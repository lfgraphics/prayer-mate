import { Metadata } from 'next';
import { getMosqById } from '@/actions/mosqActions';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Navigation, User, Clock, Calendar } from 'lucide-react';
import { convertToAmPm } from '@/utils/format';
import Link from 'next/link';
import MosqueMap from '@/components/MosqueMap';
import { MosqType } from '@/models/mosq';
import MosqueGallery from '@/components/MosqueGallery';
import MosqueFeaturedImage from '@/components/MosqueFeaturedImage';

// Dynamic metadata generation
// Define the params type explicitly
type MosquePageParams = {
    params: {
        id: string;
    };
};

// Update the type definition for generateMetadata
export async function generateMetadata({ params }: MosquePageParams): Promise<Metadata> {
    const mosqId = params.id;
    const response = await getMosqById(mosqId);

    if (!response.success) {
        return {
            title: 'Mosque Not Found | Prayer Mate',
            description: 'The requested mosque could not be found.'
        };
    }

    const mosq: MosqType = response.mosq;

    return {
        title: `${mosq.name} | Prayer Mate`,
        description: `Prayer times and information for ${mosq.name} located at ${mosq.location}`,
        keywords: ['mosque', 'prayer times', 'islamic center', mosq.name, mosq.location],
        openGraph: {
            images: [...mosq.photos],
        },
    };
}

// Update the type definition for the page component
const MosqueDetailPage = async ({ params }: { params: { id: string } }) => {
    const mosqId = await params?.id;
    const response = await getMosqById(mosqId);

    if (!response.success) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Card className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Mosque Not Found</h1>
                    <p className="mb-6">The mosque you are looking for could not be found.</p>
                    <Link href="/mosques" className="text-primary hover:underline">
                        Return to Mosque List
                    </Link>
                </Card>
            </div>
        );
    }

    const mosq = response.mosq;
    const coordinates = 'type' in mosq.coordinates ? mosq.coordinates.coordinates : mosq.coordinates;

    const longitude = coordinates[0];
    const latitude = coordinates[1];

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Mosque Image */}
                            <div className="w-full md:w-1/3 h-48 md:h-auto relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                {mosq.photos && mosq.photos.length > 0 ? (
                                    <MosqueFeaturedImage 
                                        photo={mosq.photos[0]} 
                                        mosqueName={mosq.name} 
                                    />
                                ) : (
                                    <div className="text-6xl text-muted-foreground">🕌</div>
                                )}
                            </div>

                            {/* Mosque Details */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{mosq.name}</h1>

                                <div className="flex items-center gap-2 text-muted-foreground mt-4">
                                    <MapPin size={18} className="flex-shrink-0" />
                                    <span>{mosq.location}</span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                    <User size={18} className="flex-shrink-0" />
                                    <span>Imam: {mosq.imam}</span>
                                </div>

                                <Link
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    <Navigation size={16} />
                                    <span>Get Directions</span>
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Map Section */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Location</h2>
                        <div className="w-full h-[300px] rounded-lg overflow-hidden">
                            {/* Use the client component wrapper instead */}
                            <MosqueMap
                                latitude={latitude}
                                longitude={longitude}
                                name={mosq.name}
                            />
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                            Coordinates: {latitude}, {longitude}
                        </div>
                    </Card>

                    {/* Photo Gallery */}
                    {mosq.photos && mosq.photos.length > 0 && (
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Photos</h2>
                            <MosqueGallery photos={mosq.photos} mosqueName={mosq.name} />
                        </Card>
                    )}
                </div>

                {/* Prayer Times Section */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={20} className="text-primary" />
                            <h2 className="text-xl font-bold">Prayer Times</h2>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Prayer</TableHead>
                                    <TableHead>Azan</TableHead>
                                    <TableHead>Iqamah</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Fajr</TableCell>
                                    <TableCell>{mosq.azanTimes?.fajr ? convertToAmPm(`${mosq.azanTimes.fajr.hours}:${mosq.azanTimes.fajr.minutes}`) : '-'}</TableCell>
                                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.fajr?.hours}:${mosq.prayerTimes?.fajr?.minutes}`)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Zohar</TableCell>
                                    <TableCell>{mosq.azanTimes?.zohar ? convertToAmPm(`${mosq.azanTimes.zohar.hours}:${mosq.azanTimes.zohar.minutes}`) : '-'}</TableCell>
                                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.zohar?.hours}:${mosq.prayerTimes?.zohar?.minutes}`)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Asr</TableCell>
                                    <TableCell>{mosq.azanTimes?.asr ? convertToAmPm(`${mosq.azanTimes.asr.hours}:${mosq.azanTimes.asr.minutes}`) : '-'}</TableCell>
                                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.asr?.hours}:${mosq.prayerTimes?.asr?.minutes}`)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Maghrib</TableCell>
                                    <TableCell>{mosq.azanTimes?.maghrib ? convertToAmPm(`${mosq.azanTimes.maghrib.hours}:${mosq.azanTimes.maghrib.minutes}`) : '-'}</TableCell>
                                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.maghrib?.hours}:${mosq.prayerTimes?.maghrib?.minutes}`)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Isha</TableCell>
                                    <TableCell>{mosq.azanTimes?.isha ? convertToAmPm(`${mosq.azanTimes.isha.hours}:${mosq.azanTimes.isha.minutes}`) : '-'}</TableCell>
                                    <TableCell>{convertToAmPm(`${mosq.prayerTimes?.isha?.hours}:${mosq.prayerTimes?.isha?.minutes}`)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Special Prayer Times */}
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={20} className="text-primary" />
                            <h2 className="text-xl font-bold">Special Prayer Times</h2>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Prayer</TableHead>
                                    <TableHead>Azan</TableHead>
                                    <TableHead>Khutba</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mosq.prayerTimes?.juma ? (
                                    <TableRow>
                                        <TableCell className="font-medium">Juma</TableCell>
                                        <TableCell>{mosq.azanTimes?.juma ? convertToAmPm(`${mosq.azanTimes.juma.hours}:${mosq.azanTimes.juma.minutes}`) : '-'}</TableCell>
                                        <TableCell>{convertToAmPm(`${mosq.prayerTimes.juma.hours}:${mosq.prayerTimes.juma.minutes}`)}</TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">No Juma time specified</TableCell>
                                    </TableRow>
                                )}

                                {mosq.prayerTimes?.eidulfitr ? (
                                    <TableRow>
                                        <TableCell className="font-medium">Eid-ul-Fitr</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>
                                            {mosq.prayerTimes.eidulfitr.date &&
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    {new Date(mosq.prayerTimes.eidulfitr.date).toLocaleDateString()}
                                                </div>
                                            }
                                            {convertToAmPm(`${mosq.prayerTimes.eidulfitr.hours}:${mosq.prayerTimes.eidulfitr.minutes}`)}
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {mosq.prayerTimes?.eidulazha ? (
                                    <TableRow>
                                        <TableCell className="font-medium">Eid-ul-Azha</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>
                                            {mosq.prayerTimes.eidulazha.date &&
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    {new Date(mosq.prayerTimes.eidulazha.date).toLocaleDateString()}
                                                </div>
                                            }
                                            {convertToAmPm(`${mosq.prayerTimes.eidulazha.hours}:${mosq.prayerTimes.eidulazha.minutes}`)}
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {!mosq.prayerTimes?.eidulfitr && !mosq.prayerTimes?.eidulazha && !mosq.prayerTimes?.juma && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">No special prayer times specified</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}
export default MosqueDetailPage;