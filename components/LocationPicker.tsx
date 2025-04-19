'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';

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
        loading: () => <div className="w-full h-full bg-muted flex items-center justify-center">Loading map...</div>
    }
);

export default function LocationPicker({
    onLocationSelect,
    initialLatitude = 51.505,
    initialLongitude = -0.09
}: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number]>([
        initialLatitude || 51.505,
        initialLongitude || -0.09
    ]);

    // Get user location with better error handling
    // Update the getUserLocation function in LocationPicker.tsx
    
    const getUserLocation = useCallback(() => {
        if (typeof window === 'undefined') {
            console.log("Running on server side, geolocation not available");
            return;
        }
        
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser");
            return;
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        try {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted' || result.state === 'prompt') {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            setPosition([latitude, longitude]);
                            onLocationSelect(latitude, longitude);
                        },
                        (error) => {
                            // More detailed error handling
                            let errorMessage = "Unknown error";
                            switch(error.code) {
                                case error.PERMISSION_DENIED:
                                    errorMessage = "User denied the request for geolocation";
                                    break;
                                case error.POSITION_UNAVAILABLE:
                                    errorMessage = "Location information is unavailable";
                                    break;
                                case error.TIMEOUT:
                                    errorMessage = "The request to get user location timed out";
                                    break;
                            }
                            console.error(`Geolocation error: ${errorMessage}`);
                        },
                        options
                    );
                } else {
                    console.log("Geolocation permission denied");
                }
            });
        } catch (error) {
            console.error("Failed to get location:", error);
        }
    }, [onLocationSelect, setPosition]);

    // Try to get user location on component mount
    useEffect(() => {
        if ((!initialLatitude || !initialLongitude || 
            (initialLatitude === 0 && initialLongitude === 0))) {
            getUserLocation();
        }
    }, [initialLatitude, initialLongitude, getUserLocation]);

    return (
        <div className="w-full h-full">
            <Map 
                position={position} 
                onPositionChange={setPosition} 
                onLocationSelect={onLocationSelect} 
            />
        </div>
    );
}