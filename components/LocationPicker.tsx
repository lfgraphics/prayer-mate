'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Define the props interface
interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLatitude?: number;
    initialLongitude?: number;
}

// Dynamically import the map component with SSR disabled
const Map = dynamic(
    () => import('./Map'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full bg-muted flex items-center justify-center">
                Loading map...
            </div>
        )
    }
);

export default function LocationPicker({
    onLocationSelect,
    initialLatitude = 26.7589463,
    initialLongitude = 83.3647728
}: LocationPickerProps) {
    // Controlled position state: [lat, lng]
    const [position, setPosition] = useState<[number, number]>([
        initialLatitude,
        initialLongitude
    ]);

    // Callback for when Map triggers a location change
    const handleMapSelect = useCallback((lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
    }, [onLocationSelect]);

    // Try to get user location on mount
    const getUserLocation = useCallback(() => {
        if (typeof window === 'undefined' || !navigator.geolocation) return;
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted' || result.state === 'prompt') {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setPosition([latitude, longitude]);
                        onLocationSelect(latitude, longitude);
                    },
                    (err) => console.error('Geolocation error', err),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
        });
    }, [onLocationSelect]);

    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    return (
        <div className="w-full h-full">
            <Map
                position={position}
                onLocationSelect={handleMapSelect}
            />
        </div>
    );
}
