import { Suspense } from 'react';
import MosqueList from '@/components/MosqueList';
import MosqueFilters from '@/components/MosqueFilters';
import { getMosqs } from "@/actions/mosqActions";
import Loading from '../loading';

// export const metadata = {
//     title: 'Mosques | Prayer Mate',
//     description: 'Find mosques near you with prayer times and location information',
//     keywords: 'mosque, prayer times, islamic centers, masjid'
// };

async function MosquesPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const params = await Promise.resolve(searchParams);
    const filterParams: any = {};

    if (params?.by) {
        filterParams.by = params?.by as string;
    }

    if (params?.query) {
        filterParams.query = params?.query as string;
    }

    if (params?.lat && params?.lng) {
        filterParams.coordinates = [
            parseFloat(params?.lng as string),
            parseFloat(params?.lat as string)
        ];

        if (params?.radius) {
            filterParams.radius = parseInt(params?.radius as string);
        }
    }

    if (params?.by === "prayerTime") {
        if (params?.prayerTime) {
            const prayerTime = params?.prayerTime as string;
            console.log(`Raw prayerTime from URL: ${prayerTime}`);
            
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
            
            console.log(`Searching for prayer times between ${startTime} and ${endTime}`);
            
            filterParams.timeRange = {
                start: startTime,
                end: endTime
            };
            
            if (params?.query) {
                filterParams.prayerName = params?.query;
            }
        }

        else if (params?.timeStart || params?.timeEnd) {
            filterParams.timeRange = {
                start: params?.timeStart ? (params?.timeStart as string).padStart(5, '0') : "00:00",
                end: params?.timeEnd ? (params?.timeEnd as string).padStart(5, '0') : "23:59"
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
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Find Mosques prayer time</h1>

            <MosqueFilters initialFilters={params} />

            <Suspense fallback={<Loading />}>
                <MosqueList mosques={mosques} />
            </Suspense>
        </div>
    );
}

export default MosquesPage;
