'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons for Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
    position: [number, number];
    onLocationSelect?: (lat: number, lng: number) => void;
    onPositionChange?: (position: [number, number]) => void;
}

export default function Map({
    position,
    onLocationSelect,
    onPositionChange
}: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || leafletMapRef.current) return;

        const fallback: [number, number] = [26.75894634440903, 83.36477279663087];

        const initializeMap = (lat: number, lng: number) => {
            const map = L.map(mapRef.current!).setView([lat, lng], 13);
            leafletMapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup("Selected Location").openPopup();

            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                marker.getPopup()?.setContent("Selected Location").openOn(map);

                onLocationSelect?.(lat, lng);
                onPositionChange?.([lat, lng]);
            });

            // Inform parent of the initial location
            onLocationSelect?.(lat, lng);
            onPositionChange?.([lat, lng]);
        };

        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    initializeMap(latitude, longitude);
                },
                () => {
                    initializeMap(fallback[0], fallback[1]);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            initializeMap(fallback[0], fallback[1]);
        }
    }, []);

    useEffect(() => {
        return () => {
            leafletMapRef.current?.remove();
            leafletMapRef.current = null;
        };
    }, []);

    return (
        <div
            ref={mapRef}
            className="w-full h-full rounded overflow-hidden"
            style={{ height: '100%', width: '100%' }}
        />
    );
}
