"use client"
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MosqType } from '@/models/mosq';
import { toast } from "sonner";
import {
    CheckCircle,
    XCircle,
    MapPin,
    User,
    Clock,
    ArrowLeft,
    Calendar
} from 'lucide-react';
import { convertToAmPm } from '@/utils/format';
import Image from 'next/image';
import MosqueMap from '@/components/MosqueMap';
import Loading from '@/app/loading';

export default function MosqueDetails() {
    const params = useParams();
    const router = useRouter();
    const [mosque, setMosque] = useState<MosqType | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const mosqueId = params.id as string;

    useEffect(() => {
        if (mosqueId) {
            fetchMosqueDetails();
        }
    }, [mosqueId]);

    const fetchMosqueDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/mosq?id=${mosqueId}`);
            const data = await response.json();

            if (data.mosq) {
                setMosque(data.mosq);
            } else {
                throw new Error("Failed to fetch mosque details");
            }
        } catch (error) {
            console.error("Error fetching mosque details:", error);
            toast.error("Failed to load mosque details");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMosque = async () => {
        setProcessing(true);
        try {
            const response = await fetch(`/api/admin/mosques/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mosqueId }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Mosque verified successfully");
                router.push('/admin/mosques');
            } else {
                throw new Error(data.message || "Failed to verify mosque");
            }
        } catch (error) {
            console.error("Error verifying mosque:", error);
            toast.error(error instanceof Error ? error.message : "Failed to verify mosque");
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectMosque = async () => {
        setProcessing(true);
        try {
            const response = await fetch(`/api/admin/mosques/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mosqueId }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Mosque rejected successfully");
                router.push('/admin/mosques');
            } else {
                throw new Error(data.message || "Failed to reject mosque");
            }
        } catch (error) {
            console.error("Error rejecting mosque:", error);
            toast.error(error instanceof Error ? error.message : "Failed to reject mosque");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!mosque) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Card className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-amber-600 mb-4">Mosque Not Found</h1>
                    <p className="mb-6">The mosque you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => router.push('/admin/mosques')}>
                        Return to Mosque Management
                    </Button>
                </Card>
            </div>
        );
    }

    const coordinates = 'type' in mosque.coordinates ? mosque.coordinates.coordinates : mosque.coordinates;
    const longitude = coordinates[0];
    const latitude = coordinates[1];

    return (
        <div className="container mx-auto py-8 px-4">
            <Button
                variant="ghost"
                onClick={() => router.push('/admin/mosques')}
                className="mb-6 flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                Back to Mosque Management
            </Button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{mosque.name}</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={handleVerifyMosque}
                        disabled={processing}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle size={16} />
                        Verify Mosque
                    </Button>
                    <Button
                        onClick={handleRejectMosque}
                        disabled={processing}
                        variant="destructive"
                        className="flex items-center gap-2"
                    >
                        <XCircle size={16} />
                        Reject Mosque
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-primary" />
                            <span className="font-medium">Imam:</span>
                            <span>{mosque.imam}</span>
                        </div>

                        <div className="flex items-start gap-2">
                            <MapPin size={18} className="text-primary flex-shrink-0 mt-1" />
                            <span className="font-medium">Location:</span>
                            <span>{mosque.location}</span>
                        </div>

                        <div className="h-64 w-full rounded-md overflow-hidden border mt-4">
                            <MosqueMap latitude={latitude} longitude={longitude} name={''} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Prayer Times</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <span>Fajr</span>
                            </div>
                            <span>{convertToAmPm(`${mosque.prayerTimes.fajr.hours}:${mosque.prayerTimes.fajr.minutes}`)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <span>Zohar</span>
                            </div>
                            <span>{convertToAmPm(`${mosque.prayerTimes.zohar.hours}:${mosque.prayerTimes.zohar.minutes}`)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <span>Asr</span>
                            </div>
                            <span>{convertToAmPm(`${mosque.prayerTimes.asr.hours}:${mosque.prayerTimes.asr.minutes}`)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <span>Maghrib</span>
                            </div>
                            <span>{convertToAmPm(`${mosque.prayerTimes.maghrib.hours}:${mosque.prayerTimes.maghrib.minutes}`)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-primary" />
                                <span>Isha</span>
                            </div>
                            <span>{convertToAmPm(`${mosque.prayerTimes.isha.hours}:${mosque.prayerTimes.isha.minutes}`)}</span>
                        </div>
                        {mosque.prayerTimes.juma && mosque.prayerTimes.juma.hours !== undefined && (
                            <div className="flex justify-between items-center border-b pb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-primary" />
                                    <span>Juma</span>
                                </div>
                                <span>{convertToAmPm(`${mosque.prayerTimes.juma.hours}:${mosque.prayerTimes.juma.minutes || 0}`)}</span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {mosque.photos && mosque.photos.length > 0 && (
                <Card className="p-6 mt-8">
                    <h2 className="text-xl font-bold mb-4">Mosque Photos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {mosque.photos.map((photo, index) => (
                            <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                                <img
                                    src={photo}
                                    alt={`${mosque.name} - Photo ${index + 1}`}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}