import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewer = ({ src, alt = "Image", isOpen, onClose }: ImageViewerProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleBackEvent = () => {
      if (isOpen) {
        onClose();
        history.pushState(null, '', window.location.href);
      }
    };

    const isMobile = window.innerWidth <= 768;

    window.addEventListener("keydown", handleKeyDown);
    if (isMobile) {
      window.addEventListener("popstate", handleBackEvent);

      if (isOpen) {
        history.pushState(null, "", window.location.href);
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (isMobile) {
        window.removeEventListener("popstate", handleBackEvent);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageViewer;