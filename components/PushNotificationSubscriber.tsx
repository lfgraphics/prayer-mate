'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function PushNotificationSubscriber() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [pushSupported, setPushSupported] = useState(false);

    useEffect(() => {
        // Check if push notifications are supported
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPushSupported(true);
            checkSubscriptionStatus();
        }
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    };

    const subscribeToPushNotifications = async () => {
        try {
            setIsSubscribing(true);
            
            // Register service worker if not already registered
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Get the server's public key
            const response = await fetch('/api/push/vapid-public-key');
            const { publicKey } = await response.json();

            // Subscribe the user to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Send the subscription to the server
            const saveResponse = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscription })
            });

            if (saveResponse.ok) {
                setIsSubscribed(true);
                toast.success("Notifications enabled", {
                    description: "You will now receive notifications about mosque updates."
                });
            } else {
                throw new Error('Failed to save subscription');
            }
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            toast.error("Notification error", {
                description: "Could not enable notifications. Please try again."
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    const unsubscribeFromPushNotifications = async () => {
        try {
            setIsSubscribing(true);
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                
                // Notify the server about unsubscription
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                setIsSubscribed(false);
                toast.success("Notifications disabled", {
                    description: "You will no longer receive notifications."
                });
            }
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            toast.error("Error", {
                description: "Could not disable notifications. Please try again."
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    if (!pushSupported) {
        return null; // Don't show anything if push is not supported
    }

    return (
        <div className="mt-4">
            <Button
                onClick={isSubscribed ? unsubscribeFromPushNotifications : subscribeToPushNotifications}
                disabled={isSubscribing}
                variant={isSubscribed ? "outline" : "default"}
            >
                {isSubscribing 
                    ? "Processing..." 
                    : isSubscribed 
                        ? "Disable Notifications" 
                        : "Enable Notifications"}
            </Button>
        </div>
    );
}

// Helper function to convert base64 to Uint8Array
// (Required for applicationServerKey)
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}