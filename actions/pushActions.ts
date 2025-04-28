'use server'

import webpush from 'web-push';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    'mailto:your-email@example.com', // Contact email for push service
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

/**
 * Send a push notification to a specific subscription
 * @param subscription The push subscription object
 * @param payload The notification payload (title, body, and optional data)
 * @returns Promise resolving to success status and message
 */
export async function sendPushNotification(
    subscription: webpush.PushSubscription,
    payload: { title: string, body: string, data?: any }
) {
    try {
        // Send the push notification
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: payload.title,
                body: payload.body,
                ...payload.data
            })
        );

        return {
            success: true,
            message: 'Push notification sent successfully'
        };
    } catch (error) {
        console.error('Error sending push notification:', error);
        return {
            success: false,
            message: `Failed to send push notification: ${error}`
        };
    }
}

/**
 * Update user's push notification prompt preferences
 * @param preferences Object containing preference values to update
 * @returns Promise resolving to success status and message
 */
export async function updatePushPromptPreference(
    preferences: { 
        lastPromptTime?: number; 
        dontAskPushNotifications?: boolean;
    }
) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return {
                success: false,
                message: 'No authenticated user'
            };
        }

        const client = await clerkClient();
        await client.users.updateUser(userId, {
            publicMetadata: preferences
        });

        return {
            success: true,
            message: 'Push notification preferences updated successfully'
        };
    } catch (error) {
        console.error('Error updating push notification preferences:', error);
        return {
            success: false,
            message: `Failed to update push notification preferences: ${error}`
        };
    }
}