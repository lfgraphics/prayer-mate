import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import { Mosq } from '@/models/mosq';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Connect to the database
        await dbConnect();

        // Fetch all unverified mosques
        const unverifiedMosques = await Mosq.find({ verified: false });

        return NextResponse.json({
            success: true,
            mosques: unverifiedMosques
        });

    } catch (error) {
        console.error('Error fetching unverified mosques:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch unverified mosques' },
            { status: 500 }
        );
    }
}