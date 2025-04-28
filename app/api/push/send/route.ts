import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { sendPushNotification } from "@/actions/pushActions";

export async function POST(request: NextRequest) {
    try {
        // Verify the user is authenticated
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { subscription, payload } = await request.json();

        if (!subscription || !payload) {
            return NextResponse.json(
                { success: false, message: 'Subscription and payload are required' },
                { status: 400 }
            );
        }

        // Use the server action to send the notification
        const result = await sendPushNotification(subscription, payload);
        
        return NextResponse.json(result, {
            status: result.success ? 200 : 500
        });
    } catch (error) {
        console.error('Error in push notification API route:', error);
        return NextResponse.json(
            { success: false, message: `Failed to process push notification: ${error}` },
            { status: 500 }
        );
    }
}