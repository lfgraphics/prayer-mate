"use client";

import { useState } from 'react';
import ImageViewer from '@/components/ImageViewer';

interface MosqueFeaturedImageProps {
    photo: string;
    mosqueName: string;
}

export default function MosqueFeaturedImage({ photo, mosqueName }: MosqueFeaturedImageProps) {
    const [isImageOpen, setIsImageOpen] = useState(false);

    return (
        <>
            <img
                onClick={() => setIsImageOpen(true)}
                src={photo}
                alt={mosqueName}
                className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
            />
            <ImageViewer
                src={photo}
                isOpen={isImageOpen}
                onClose={() => setIsImageOpen(false)}
            />
        </>
    );
}