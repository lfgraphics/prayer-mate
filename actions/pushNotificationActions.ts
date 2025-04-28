'use server'

import webpush from 'web-push';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    'mailto:your-email@example.com', // Update with your contact email
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

type PushPayload = {
    title: string;
    body: string;
    data?: any;
};

/**
 * Sends a push notification to a specific subscription
 * @param subscription The push subscription object
 * @param payload The notification payload (title, body, and optional data)
 * @returns Promise resolving to success status
 */
export async function sendPushNotification(
    subscription: webpush.PushSubscription,
    payload: PushPayload
): Promise<boolean> {
    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: payload.title,
                body: payload.body,
                ...payload.data
            })
        );
        return true;
    } catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
}

/**
 * Sends push notifications to multiple users with admin role
 * @param adminUsers Array of admin users with push subscriptions
 * @param payload The notification payload
 * @returns Promise resolving to an array of success/failure results
 */
export async function notifyAdmins(
    adminUsers: any[],
    payload: PushPayload
): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const admin of adminUsers) {
        const pushSubscription = admin.privateMetadata?.pushSubscription;
        if (pushSubscription) {
            const result = await sendPushNotification(pushSubscription, payload);
            results.push(result);
        }
    }
    
    return results;
}