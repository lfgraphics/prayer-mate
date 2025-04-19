'use client';

interface MapComponentProps {
    latitude: number;
    longitude: number;
    name: string; // Optional for display use
}

const MapComponent = ({ latitude, longitude, name }: MapComponentProps) => {
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;

    return (
        <div className="w-full h-full rounded overflow-hidden border">
            <iframe
                title={name}
                src={mapUrl}
                style={{ border: 0, width: '100%', height: '100%' }}
                loading="lazy"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default MapComponent;
