'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { updatePushPromptPreference } from '@/actions/pushActions';

export default function PushNotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [pushSupported, setPushSupported] = useState(false);
    const { user, isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        // Only proceed if user is loaded and signed in
        if (!isLoaded || !isSignedIn) return;

        // Check if push notifications are supported
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setPushSupported(true);
            checkPromptStatus();
        }
    }, [isLoaded, isSignedIn]);

    const checkPromptStatus = async () => {
        try {
            // 1. Skip if user opted out
            const dontAskAgain = user?.publicMetadata?.dontAskPushNotifications;
            if (dontAskAgain) return;

            // 2. Ensure service worker is ready before accessing pushManager
            const registration = await navigator.serviceWorker.ready;
            if (!registration) {
                console.warn("Service Worker not ready.");
                return;
            }

            // 3. Skip if already subscribed
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                console.log("User already subscribed to push.");
                return;
            }

            // 4. Prompt timing logic
            const lastPromptTime = Number(user?.publicMetadata?.lastPushPromptTime || 0);
            const currentTime = Date.now();
            const promptInterval = 3 * 24 * 60 * 60 * 1000; // 3 days

            const shouldPrompt = !lastPromptTime || (currentTime - lastPromptTime > promptInterval);

            if (shouldPrompt) {
                setShowPrompt(true);
                updatePushPromptPreference({ lastPromptTime: currentTime });
                console.log(lastPromptTime ? "Showing prompt after 3 days." : "New user, showing prompt.");
            } else {
                console.log("Prompt skipped. Last shown at:", new Date(lastPromptTime));
            }

        } catch (error) {
            console.error('❌ Error checking push prompt status:', error);
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
                setShowPrompt(false);
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

    const remindLater = async () => {
        // Set last prompt time to now, which will delay the next prompt
        await updatePushPromptPreference({ lastPromptTime: Date.now() });
        setShowPrompt(false);
    };

    const dontAskAgain = async () => {
        // Set preference to never show prompt again
        await updatePushPromptPreference({ dontAskPushNotifications: true });
        setShowPrompt(false);
    };

    // Helper function to convert base64 to Uint8Array
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

    if (!pushSupported || !showPrompt || !isSignedIn) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>Stay Updated</CardTitle>
                    <CardDescription>
                        Get notified about prayer times and mosque updates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Enable notifications to receive important updates about your favorite mosques and prayer times.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={dontAskAgain}
                        disabled={isSubscribing}
                    >
                        Don't Ask Again
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={remindLater}
                        disabled={isSubscribing}
                    >
                        Remind Later
                    </Button>
                    <Button
                        onClick={subscribeToPushNotifications}
                        disabled={isSubscribing}
                    >
                        {isSubscribing ? "Processing..." : "Enable Notifications"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}