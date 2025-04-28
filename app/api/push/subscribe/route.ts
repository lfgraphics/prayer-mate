import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { subscription } = await request.json();

        if (!subscription) {
            return NextResponse.json(
                { success: false, message: 'Subscription data is required' },
                { status: 400 }
            );
        }

        // Store the subscription in the user's private metadata
        const client = await clerkClient();
        await client.users.updateUser(userId, {
            privateMetadata: {
                pushSubscription: subscription
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Push subscription saved successfully'
        });
    } catch (error) {
        console.error('Error saving push subscription:', error);
        return NextResponse.json(
            { success: false, message: `Failed to save push subscription: ${error}` },
            { status: 500 }
        );
    }
}