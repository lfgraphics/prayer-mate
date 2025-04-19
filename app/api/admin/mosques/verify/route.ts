import dbConnect from "@/lib/db";
import { NextResponse } from 'next/server';
import { Mosq } from '@/models/mosq';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { mosqueId } = await request.json();

        if (!mosqueId) {
            return NextResponse.json(
                { success: false, message: 'Mosque ID is required' },
                { status: 400 }
            );
        }

        // Connect to the database
        await dbConnect();

        // Find the mosque
        const mosque = await Mosq.findById(mosqueId);

        if (!mosque) {
            return NextResponse.json(
                { success: false, message: 'Mosque not found' },
                { status: 404 }
            );
        }

        // Get the imam's user ID from the mosque
        const imamUserId = mosque.id;

        if (!imamUserId) {
            return NextResponse.json(
                { success: false, message: 'Imam user ID not found in mosque data' },
                { status: 400 }
            );
        }

        // Update the mosque to verified status
        mosque.verified = true;
        await mosque.save();

        // Update the imam's user metadata to include the mosque ID
        const client = await clerkClient()
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'imam',
                mosqId: mosqueId
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Mosque verified successfully'
        });

    } catch (error) {
        console.error('Error verifying mosque:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to verify mosque' },
            { status: 500 }
        );
    }
}