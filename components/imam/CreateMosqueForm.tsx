'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Clock, Plus, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { openEmbeddedCamera } from '../EmbeddedCamera';

// Dynamically import the map component to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => (<div className="w-full h-[300px] bg-muted flex items-center justify-center">Loading map...</div>)
});

// Define the schema for mosque creation to match the Mosq model
const mosqueSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    address: z.string().min(5, { message: "Address must be at least 5 characters" }),
    city: z.string().min(2, { message: "City is required" }),
    country: z.string().min(2, { message: "Country is required" }),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
});

type MosqueFormValues = z.infer<typeof mosqueSchema>;

export default function CreateMosqueForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const [prayerTimes, setPrayerTimes] = useState({
        fajr: { hours: 5, minutes: 0 },
        zohar: { hours: 13, minutes: 0 },
        asr: { hours: 17, minutes: 0 },
        maghrib: { hours: 18, minutes: 0 },
        isha: { hours: 20, minutes: 0 },
        juma: { hours: 13, minutes: 30 }
    });
    const [photos, setPhotos] = useState<string[]>([]);

    const form = useForm<MosqueFormValues>({
        resolver: zodResolver(mosqueSchema),
        defaultValues: {
            name: '',
            address: '',
            city: '',
            country: '',
            latitude: 0,
            longitude: 0,
        }
    });

    const onSubmit = async (data: MosqueFormValues) => {
        setIsSubmitting(true);

        try {
            // Format the data to match the Mosq model structure
            const mosqueData = {
                name: data.name,
                location: `${data.address}, ${data.city}, ${data.country}`,
                // Format coordinates according to the GeoJSON Point structure in the model
                coordinates: {
                    type: "Point",
                    coordinates: [data.longitude, data.latitude] // MongoDB uses [lng, lat] format
                },
                imam: '', // This will be set by the backend based on the authenticated user
                prayerTimes,
                photos,
                verified: false
            };

            const response = await fetch('/api/mosq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mosqueData),
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Mosque created successfully!');
                router.refresh();
                // Stay on the imam page which will now show the mosque dashboard
                router.push('/imam');
            } else {
                toast.error(result.message || 'Failed to create mosque');
            }
        } catch (error) {
            toast.error('An error occurred while creating the mosque');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle location selection from the map
    const handleLocationSelect = (lat: number, lng: number) => {
        form.setValue('latitude', lat);
        form.setValue('longitude', lng);
    };

    // Handle prayer time changes
    const handlePrayerTimeChange = (prayer: string, timeString: string) => {
        // Parse the time string (format: HH:MM) into hours and minutes
        const [hours, minutes] = timeString.split(':').map(Number);

        setPrayerTimes(prev => ({
            ...prev,
            [prayer]: {
                hours,
                minutes
            }
        }));
    };

    // Photo handling functions
    const handleAddPhoto = () => {
        setPhotos(prev => [...prev, ""]);
    };

    const handlePhotoChange = (index: number, value: string) => {
        setPhotos(prev => {
            const newPhotos = [...prev];
            newPhotos[index] = value;
            return newPhotos;
        });
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(prev => {
            const newPhotos = [...prev];
            newPhotos.splice(index, 1);
            return newPhotos;
        });
    };

    const handleCapturePhoto = async (index?: number) => {
        try {
            const photoBase64 = await openEmbeddedCamera();

            if (index !== undefined) {
                // Update existing photo
                handlePhotoChange(index, photoBase64);
            } else {
                // Add new photo
                setPhotos(prev => [...prev, photoBase64]);
            }
        } catch (error) {
            console.error("Error capturing photo:", error);
            toast.error("Failed to capture photo");
        }
    };

    const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>, index?: number) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (index !== undefined) {
                    // Update existing photo
                    handlePhotoChange(index, reader.result as string);
                } else {
                    // Add new photo
                    setPhotos(prev => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Mosque</CardTitle>
                <CardDescription>
                    As an Imam, you can create a new mosque to manage prayer times and information.
                </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="details">Mosque Details</TabsTrigger>
                        <TabsTrigger value="prayer-times">Prayer Times</TabsTrigger>
                        <TabsTrigger value="photos">Photos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Mosque Name *</Label>
                                <Input
                                    id="name"
                                    {...form.register('name')}
                                    placeholder="Enter mosque name"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    {...form.register('address')}
                                    placeholder="Enter full address"
                                />
                                {form.formState.errors.address && (
                                    <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        {...form.register('city')}
                                        placeholder="City"
                                    />
                                    {form.formState.errors.city && (
                                        <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country *</Label>
                                    <Input
                                        id="country"
                                        {...form.register('country')}
                                        placeholder="Country"
                                    />
                                    {form.formState.errors.country && (
                                        <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Location *</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Drag the marker or click on the map to set the mosque's exact location
                                </p>
                                <div className="h-[300px] rounded-md overflow-hidden border">
                                    <LocationPicker
                                        onLocationSelect={handleLocationSelect}
                                        initialLatitude={form.getValues('latitude')}
                                        initialLongitude={form.getValues('longitude')}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <Input
                                            type="number"
                                            step="any"
                                            {...form.register('latitude')}
                                            placeholder="Latitude"
                                            className="text-xs"
                                        />
                                        {form.formState.errors.latitude && (
                                            <p className="text-xs text-destructive">{form.formState.errors.latitude.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Input
                                            type="number"
                                            step="any"
                                            {...form.register('longitude')}
                                            placeholder="Longitude"
                                            className="text-xs"
                                        />
                                        {form.formState.errors.longitude && (
                                            <p className="text-xs text-destructive">{form.formState.errors.longitude.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </TabsContent>

                    <TabsContent value="prayer-times">
                        <CardContent>
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={20} className="text-primary" />
                                <h2 className="text-xl font-bold">Set Prayer Times</h2>
                            </div>
                            <div className="space-y-4">
                                {/* Required prayer times */}
                                {['fajr', 'zohar', 'asr', 'maghrib', 'isha'].map((prayer) => (
                                    <div key={prayer} className="grid grid-cols-3 gap-4 items-center">
                                        <Label className="capitalize">{prayer}</Label>
                                        <div>
                                            <Input
                                                type="time"
                                                value={`${String(prayerTimes[prayer as keyof typeof prayerTimes].hours).padStart(2, '0')}:${String(prayerTimes[prayer as keyof typeof prayerTimes].minutes).padStart(2, '0')}`}
                                                onChange={(e) => handlePrayerTimeChange(prayer, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Optional prayer times with remove option */}
                                {['juma', 'eidulfitr', 'eidulazha'].map((prayer) => (
                                    prayerTimes[prayer as keyof typeof prayerTimes] && (
                                        <div key={prayer} className="grid grid-cols-3 gap-4 items-center">
                                            <Label className="capitalize">{prayer}</Label>
                                            <div>
                                                <Input
                                                    type="time"
                                                    value={`${String(prayerTimes[prayer as keyof typeof prayerTimes]?.hours || 0).padStart(2, '0')}:${String(prayerTimes[prayer as keyof typeof prayerTimes]?.minutes || 0).padStart(2, '0')}`}
                                                    onChange={(e) => handlePrayerTimeChange(prayer, e.target.value)}
                                                />
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => {
                                                    setPrayerTimes(prev => {
                                                        const newTimes = {...prev};
                                                        delete newTimes[prayer as keyof typeof prayerTimes];
                                                        return newTimes;
                                                    });
                                                }}
                                                className="text-destructive"
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        </div>
                                    )
                                ))}
                                
                                {/* Add optional prayer times */}
                                <div className="mt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const optionalPrayers = ['juma', 'eidulfitr', 'eidulazha'];
                                            const missingPrayers = optionalPrayers.filter(
                                                prayer => !prayerTimes[prayer as keyof typeof prayerTimes]
                                            );
                                            
                                            if (missingPrayers.length > 0) {
                                                setPrayerTimes(prev => ({
                                                    ...prev,
                                                    [missingPrayers[0]]: { hours: 12, minutes: 0 }
                                                }));
                                            }
                                        }}
                                        disabled={['juma', 'eidulfitr', 'eidulazha'].every(
                                            prayer => !!prayerTimes[prayer as keyof typeof prayerTimes]
                                        )}
                                    >
                                        {(() => {
                                            const optionalPrayers = ['juma', 'eidulfitr', 'eidulazha'];
                                            const missingPrayers = optionalPrayers.filter(
                                                prayer => !prayerTimes[prayer as keyof typeof prayerTimes]
                                            );
                                            return missingPrayers.length > 0 
                                                ? `Add ${missingPrayers[0].charAt(0).toUpperCase() + missingPrayers[0].slice(1)} Time` 
                                                : 'All optional times added';
                                        })()}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </TabsContent>

                    <TabsContent value="photos">
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Mosque Photos</h2>
                                <Button
                                    onClick={handleAddPhoto}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Photo
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {photos.length > 0 ? (
                                    photos.map((photo, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 items-center"
                                            onDrop={(e) => handlePhotoDrop(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <div className="flex-1">
                                                <Input
                                                    value={photo}
                                                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                                                    placeholder="Enter photo URL"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleCapturePhoto(index)}
                                                size="sm"
                                            >
                                                {photo ? "Replace" : "Take Photo"}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleRemovePhoto(index)}
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg"
                                        onDrop={(e) => handlePhotoDrop(e)}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        Drag and drop images here, or click "Take Photo" to add mosque photos.
                                        <div className="mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleCapturePhoto()}
                                            >
                                                Take Photo
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </TabsContent>
                </Tabs>

                <CardFooter className="flex justify-between mt-6">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Mosque'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}