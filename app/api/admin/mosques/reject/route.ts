import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import { Mosq } from '@/models/mosq';
import { auth } from '@clerk/nextjs/server';


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

        // Delete the mosque
        const result = await Mosq.findByIdAndDelete(mosqueId);

        if (!result) {
            return NextResponse.json(
                { success: false, message: 'Mosque not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Mosque rejected and removed successfully'
        });

    } catch (error) {
        console.error('Error rejecting mosque:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to reject mosque' },
            { status: 500 }
        );
    }
}