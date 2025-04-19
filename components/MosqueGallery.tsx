"use client";

import { useState } from 'react';
import ImageViewer from '@/components/ImageViewer';

interface MosqueGalleryProps {
    photos: string[];
    mosqueName: string;
}

export default function MosqueGallery({ photos, mosqueName }: MosqueGalleryProps) {
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    if (!photos || photos.length === 0) {
        return null;
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo: string, index: number) => (
                    <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                        <img
                            src={photo}
                            alt={`${mosqueName} - Photo ${index + 1}`}
                            onClick={() => {
                                setIsImageOpen(true);
                                setSelectedImage(photo);
                            }}
                            className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                        />
                    </div>
                ))}
            </div>
            <ImageViewer
                src={selectedImage}
                isOpen={isImageOpen}
                onClose={() => setIsImageOpen(false)}
            />
        </>
    );
}