'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component with no SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <div className="w-full h-[300px] bg-muted flex items-center justify-center">Loading map...</div>
});

interface MosqueMapProps {
    latitude: number;
    longitude: number;
    name: string;
}

export default function MosqueMap({ latitude, longitude, name }: MosqueMapProps) {
    return (
        <MapComponent
            latitude={latitude}
            longitude={longitude}
            name={name}
        />
    );
}