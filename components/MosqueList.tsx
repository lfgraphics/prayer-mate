"use client";

import MosqueCard from '@/components/MosqueCard';
import { MosqType } from '@/models/mosq';

interface MosqueListProps {
    mosques?: MosqType[];
}

export default function MosqueList({ mosques }: MosqueListProps) {
    if (mosques?.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-lg text-gray-600">No mosques found matching your criteria.</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search filters.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {mosques?.length && mosques.length > 0 && mosques?.map((mosque) => (
                <div key={String(mosque._id)} className="flex flex-col gap-2">
                    <MosqueCard mosq={mosque}
                    />
                </div>
            ))}
        </div>
    );
}