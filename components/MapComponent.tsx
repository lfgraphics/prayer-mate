'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
    latitude: number;
    longitude: number;
    name: string;
}

const MapComponent = ({ latitude, longitude, name }: MapComponentProps) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fix for Leaflet icon issue in Next.js
        if (typeof window !== 'undefined') {
            // Fix Leaflet's icon paths
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            });
        }

        if (!mapRef.current) return;

        // Initialize the map
        const map = L.map(mapRef.current).setView([latitude, longitude], 14);

        // Add the OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a marker
        L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(name)
            .openPopup();

        // Clean up on unmount
        return () => {
            map.remove();
        };
    }, [latitude, longitude, name]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent;