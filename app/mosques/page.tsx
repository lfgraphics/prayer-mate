import { Suspense } from 'react';
import MosqueList from '@/components/MosqueList';
import MosqueFilters from '@/components/MosqueFilters';
import { getMosqs } from "@/actions/mosqActions";
import Loading from '../loading';
// import { use } from 'react';

export const metadata = {
    title: 'Mosques | Prayer Mate',
    description: 'Find mosques near you with prayer times and location information',
    keywords: 'mosque, prayer times, islamic centers, masjid'
};

type Params = Promise<{ slug: string }>
type SearchParams = {
    by?: string;
    lat?: string;
    lng?: string;
    radius?: string;
    prayerTime?: string;
    query?: string;
    timeStart?: string;
    timeEnd?: string;
};
// Convert to a client component to avoid searchParams issues
export default async function MosquesPage(props: {
    params: Params
    searchParams: SearchParams
}) {
    // const params = use(props.params)
    const searchParams = await props.searchParams
    const query = searchParams.query
    const by = searchParams.by
    const lat = searchParams.lat
    const lng = searchParams.lng
    const radius = searchParams.radius
    const prayerTime = searchParams.prayerTime
    const timeStart = searchParams.timeStart
    const timeEnd = searchParams.timeEnd
    // Instead of using Object.entries, access properties directly
    let filterParams: any = {};

    // Check if coordinates search
    if (by === "coordinates" && lat && lng) {
        filterParams.by = "coordinates";
        filterParams.coordinates = [
            parseFloat(lng),
            parseFloat(lat)
        ];

        if (radius) {
            filterParams.radius = parseInt(radius);
        }
    }

    if (by === "prayerTime") {
        filterParams.by = "prayerTime";

        if (prayerTime) {
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

            if (query) {
                filterParams.prayerName = query;
            }
        }
        else if (timeStart || timeEnd) {
            filterParams.timeRange = {
                start: timeStart ? timeStart.padStart(5, '0') : "00:00",
                end: timeEnd ? timeEnd.padStart(5, '0') : "23:59"
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

            <MosqueFilters initialFilters={searchParams} />

            <Suspense fallback={<Loading />}>
                <MosqueList mosques={mosques} />
            </Suspense>
        </div>
    );
}
