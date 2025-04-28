// This is a service worker file that will handle push notifications

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/icons/icon-192x192.png', // Path to your app icon
            badge: '/icons/badge-72x72.png', // Path to your notification badge
            data: data.data || {}
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(
        clients.matchAll({
            type: "window"
        }).then(function (clientList) {
            const notificationData = event.notification.data;
            const url = notificationData.url || '/';

            // If a client is already open, focus it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }

            // Otherwise, open a new window/tab
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});