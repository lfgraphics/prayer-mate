import { Suspense } from 'react';
import MosqueList from '@/components/MosqueList';
import MosqueFilters from '@/components/MosqueFilters';
import { getMosqs } from "@/actions/mosqActions";
import Loading from '../loading';

export const metadata = {
    title: 'Mosques | Prayer Mate',
    description: 'Find mosques near you with prayer times and location information',
    keywords: 'mosque, prayer times, islamic centers, masjid'
};

// Convert to a client component to avoid searchParams issues
export default async function MosquesPage({
    params,
    searchParams,
}: {
    params: {};
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Create a copy of searchParams to avoid direct access
    const searchParamsObj = Object.fromEntries(
        Object.entries(searchParams || {})
    );
    
    let filterParams: any = {};

    // Check if coordinates search
    if (searchParamsObj.by === "coordinates" && searchParamsObj.lat && searchParamsObj.lng) {
        filterParams.by = "coordinates";
        filterParams.coordinates = [
            parseFloat(searchParamsObj.lng as string),
            parseFloat(searchParamsObj.lat as string)
        ];

        if (searchParamsObj.radius) {
            filterParams.radius = parseInt(searchParamsObj.radius as string);
        }
    }

    if (searchParamsObj.by === "prayerTime") {
        filterParams.by = "prayerTime";
        
        if (searchParamsObj.prayerTime) {
            const prayerTime = searchParamsObj.prayerTime as string;
            const [hours, minutes] = prayerTime.split(':').map(Number);

            let endHours = hours;
            let endMinutes = minutes + 90;

            if (endMinutes >= 60) {
                endHours += Math.floor(endMinutes / 60);
                endMinutes = endMinutes % 60;
            }

            if (endHours >= 24) {
                endHours = endHours % 24;
            }

            const startTime = prayerTime.padStart(5, '0');
            const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

            filterParams.timeRange = {
                start: startTime,
                end: endTime
            };

            if (searchParamsObj.query) {
                filterParams.prayerName = searchParamsObj.query as string;
            }
        }
        else if (searchParamsObj.timeStart || searchParamsObj.timeEnd) {
            filterParams.timeRange = {
                start: searchParamsObj.timeStart ? (searchParamsObj.timeStart as string).padStart(5, '0') : "00:00",
                end: searchParamsObj.timeEnd ? (searchParamsObj.timeEnd as string).padStart(5, '0') : "23:59"
            };
        }
    }

    const response = await getMosqs(filterParams);

    let mosques = response.success ? Object(response.mosques?.map((mosque: any) => ({
        id: mosque._id.toString(),
        name: mosque.name,
        location: mosque.location,
        coordinates: mosque.coordinates.coordinates,
        imam: mosque.imam,
        prayerTimes: mosque.prayerTimes,
        photos: mosque.photos || [],
        verified: mosque.verified
    }))) : [];

    return (
        <div className="container mx-auto py-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Find Mosques prayer time</h1>

            <MosqueFilters initialFilters={searchParamsObj} />

            <Suspense fallback={<Loading />}>
                <MosqueList mosques={mosques} />
            </Suspense>
        </div>
    );
}
