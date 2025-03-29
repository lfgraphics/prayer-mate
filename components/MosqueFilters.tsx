"use client";

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useAlert } from './useAlert';

interface FiltersProps {
    initialFilters?: { [key: string]: string | string[] | undefined };
}

export default function MosqueFilters({ initialFilters }: FiltersProps) {
    const alert = useAlert()
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [filters, setFilters] = useState({
        by: (initialFilters?.by as string) || '',
        query: (initialFilters?.query as string) || '',
        lat: (initialFilters?.lat as string) || '',
        lng: (initialFilters?.lng as string) || '',
        radius: (initialFilters?.radius as string) || '1000',
        prayerTime: (initialFilters?.prayerTime as string) || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFilters(prev => ({ ...prev, by: value }));
    };

    const handleSubmit = () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                console.log(`Setting param ${key} = ${value}`);
                params.set(key, value);
            }
        });

        startTransition(() => {
            router.push(`/mosques?${params.toString()}`);
        });
    };

    const handleUseCurrentLocation = async () => {
        await navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === "granted") {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setFilters(prev => ({
                            ...prev,
                            lat: position.coords.latitude.toString(),
                            lng: position.coords.longitude.toString()
                        }))
                    },
                    handleLocationError
                )
            } else {
                alert({
                    heading: "Location Permission",
                    message: "We need your location to show nearby Mosques. Please allow when prompted.",
                    cancelText: "No Thanks",
                    actionText: "Allow",
                    onConfirm: () => {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                setFilters(prev => ({
                                    ...prev,
                                    lat: position.coords.latitude.toString(),
                                    lng: position.coords.longitude.toString()
                                }))
                            },
                            handleLocationError
                        )
                    }
                })
            }
            handleSubmit();
        })
    };

    const handleLocationError = (error: GeolocationPositionError) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                alert({
                    heading: "Location Permission Denied",
                    message: "You have denied the permission to access your location. Please allow location access in your browser settings.",
                    cancelText: "No Thanks",
                })
                break
            case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                alert({
                    heading: "Location Unavailable",
                    message: "Location information is currently unavailable. Please try again later.",
                    cancelText: "Okay",
                })
                break
            case error.TIMEOUT:
                console.error("The request to get user location timed out.");
                alert({
                    heading: "Location Timeout",
                    message: "The request to get user location timed out. Please try again.",
                    cancelText: "Okay",
                })
                break
            default:
                console.error("An unknown error occurred.");
                alert({
                    heading: "Unknown Error",
                    message: "An unknown error occurred while getting your location. Please try again.",
                    cancelText: "Okay",
                })
                break
        }
    }

    return (
        <Card className="p-4 mb-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit }} name='mosqFilterForm' className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <Select value={filters.by} onValueChange={handleSelectChange}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select search type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Mosq Name</SelectItem>
                                <SelectItem value="location">Mosq Location</SelectItem>
                                <SelectItem value="coordinates">Coordinates</SelectItem>
                                <SelectItem value="prayerTime">Prayer Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {filters.by === 'prayerTime' &&
                        <Select value={filters.query} onValueChange={(value) => setFilters(prev => ({ ...prev, query: value }))}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select a prayer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fajr">Fajr</SelectItem>
                                <SelectItem value="zohar">Zohar</SelectItem>
                                <SelectItem value="asr">Asr</SelectItem>
                                <SelectItem value="maghrib">Maghrib</SelectItem>
                                <SelectItem value="isha">Isha</SelectItem>
                                <SelectItem value="juma">Juma</SelectItem>
                                <SelectItem value="eidulfitr">Eid-ul-Fitr</SelectItem>
                                <SelectItem value="eidulazha">Eid-ul-Azha</SelectItem>
                            </SelectContent>
                        </Select>
                    }

                    {(filters.by !== '' && filters.by !== 'coordinates' && filters.by !== 'prayerTime') && <div>
                        <Input
                            name="query"
                            value={filters.query}
                            onChange={handleInputChange}
                            placeholder={`Enter${filters.by === 'name' ? ' Mosq Name' : filters.by === 'location' ? ' Mosq Location' : filters.by === 'prayerTime' ? 'Prayer Name' : 'Cordinates'}`}
                        />
                    </div>}

                    {(filters.by === 'coordinates') && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Radius (meters)</label>
                                <Input
                                    name="radius"
                                    value={filters.radius}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 1000"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleUseCurrentLocation}
                                    className="w-full"
                                >
                                    Use Current Location
                                </Button>
                            </div>
                        </>
                    )}

                    {filters.by === 'prayerTime' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Prayer Time</label>
                            <Input
                                type="time"
                                name="prayerTime"
                                value={filters.prayerTime}
                                onChange={handleInputChange}
                                placeholder="Select prayer time"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                We'll find mosques with this prayer within a 90-minute window
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending} onClick={handleSubmit}>
                        {isPending ? 'Searching...' : 'Search Mosques'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}