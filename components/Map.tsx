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
    /** Controlled position [latitude, longitude] */
    position: [number, number];
    /** Called when user moves marker or clicks map */
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function Map({ position, onLocationSelect }: MapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        const [lat, lng] = position;
        // Initialize map once
        if (!mapRef.current && containerRef.current) {
            const map = L.map(containerRef.current).setView([lat, lng], 15);
            mapRef.current = map;

            // Base layers
            const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            });
            const satellite = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                { attribution: 'Tiles &copy; Esri' }
            );
            const labels = L.tileLayer(
                'https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png',
                { attribution: 'Labels &copy; Stamen', pane: 'overlayPane' }
            );

            // Add default layers
            streets.addTo(map);
            labels.addTo(map);

            // Layer control
            L.control.layers(
                { Streets: streets, Satellite: satellite },
                { Labels: labels },
                { position: 'topright' }
            ).addTo(map);

            // Draggable marker
            const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            markerRef.current = marker;

            // Event: user drags marker
            marker.on('dragend', () => {
                const p = marker.getLatLng();
                onLocationSelect(p.lat, p.lng);
            });

            // Event: user clicks map
            map.on('click', (e: L.LeafletMouseEvent) => {
                marker.setLatLng(e.latlng);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            });
        } else if (mapRef.current && markerRef.current) {
            // Update existing marker and view when position prop changes
            markerRef.current.setLatLng([lat, lng]);
            mapRef.current.panTo([lat, lng]);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [position, onLocationSelect]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full rounded overflow-hidden"
            style={{ height: '100%', width: '100%' }}
        />
    );
}
