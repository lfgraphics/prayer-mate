"use client"
import React, { useEffect, useState } from 'react'
import { SignedIn, useUser } from '@clerk/clerk-react';
import { MosqType } from '@/models/mosq';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Navigation, User, Clock, Calendar, Save, Edit, Plus, Trash } from 'lucide-react';
import { convertToAmPm } from '@/utils/format';
import Link from 'next/link';
import MosqueMap from '@/components/MosqueMap';
import Loading from '@/app/loading';
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { openEmbeddedCamera } from '@/components/EmbeddedCamera';

const Page = () => {
    const { isLoaded, isSignedIn, user } = useUser()
    const [mosq, setMosq] = useState<MosqType | null>(null)
    const [mosqId, setMosqId] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [editMode, setEditMode] = useState<boolean>(false)
    const [updatedMosq, setUpdatedMosq] = useState<MosqType | null>(null)
    const [saving, setSaving] = useState<boolean>(false)

    useEffect(() => {
        if (isSignedIn && isLoaded && user) {
            const role = user.publicMetadata.role;
            if (role === "imam" || role === "admin") {
                const userMosqId = user.publicMetadata.mosqId as string;
                setMosqId(userMosqId);
            }
        }
    }, [isLoaded, isSignedIn, user]);

    useEffect(() => {
        if (mosqId) {
            getMosq();
        }
    }, [mosqId]);

    const getMosq = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/mosq?id=${mosqId}`);
            const data = await response.json();
            setMosq(data.mosq);
            setUpdatedMosq(data.mosq);
            console.log('mosq: ', data.mosq);
        } catch (error) {
            console.error("Error fetching mosque:", error);
            toast.error("Failed to fetch mosque information");
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (field: string, value: any) => {
        if (!updatedMosq) return;

        setUpdatedMosq(prev => {
            if (!prev) return prev;

            // Handle nested fields
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...(prev[parent as keyof MosqType] as Record<string, any>),
                        [child]: value
                    }
                };
            }

            // Handle direct fields
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleSave = async () => {
        if (!updatedMosq) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/mosq?id=${mosqId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedMosq),
            });

            const data = await response.json();

            if (data.success) {
                setMosq(data.mosq);
                setEditMode(false);
                toast.success("Mosque information updated successfully");
            } else {
                throw new Error(data.message || "Failed to update mosque");
            }
        } catch (error) {
            console.error("Error updating mosque:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update mosque information");
        } finally {
            setSaving(false);
        }
    };

    const handleAddPhoto = () => {
        if (!updatedMosq) return;

        setUpdatedMosq(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                photos: [...(prev.photos || []), ""]
            };
        });
    };

    const handlePhotoChange = (index: number, value: string) => {
        if (!updatedMosq) return;

        setUpdatedMosq(prev => {
            if (!prev || !prev.photos) return prev;

            const newPhotos = [...prev.photos];
            newPhotos[index] = value;

            return {
                ...prev,
                photos: newPhotos
            };
        });
    };

    const handleRemovePhoto = (index: number) => {
        if (!updatedMosq) return;

        setUpdatedMosq(prev => {
            if (!prev || !prev.photos) return prev;

            const newPhotos = [...prev.photos];
            newPhotos.splice(index, 1);

            return {
                ...prev,
                photos: newPhotos
            };
        });
    };

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    if (isSignedIn && isLoaded && user) {
        const role = user.publicMetadata.role;
        if (role !== "imam" && role !== "admin") {
            return <div className="container mx-auto py-12 px-4">
                <Card className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                    <p className="mb-6">You're not authorized to view this page</p>
                    <Link href="/" className="text-primary hover:underline">
                        Return to Home
                    </Link>
                </Card>
            </div>;
        }
    }

    if (loading) {
        return <Loading />;
    }

    if (!mosq) {
        return <div className="container mx-auto py-12 px-4">
            <Card className="p-8 text-center">
                <h1 className="text-2xl font-bold text-amber-600 mb-4">No Mosque Found</h1>
                <p className="mb-6">No mosque is associated with your account.</p>
                <Link href="/" className="text-primary hover:underline">
                    Return to Home
                </Link>
            </Card>
        </div>;
    }

    const coordinates = 'type' in mosq.coordinates ? mosq.coordinates.coordinates : mosq.coordinates;
    const longitude = coordinates[0];
    const latitude = coordinates[1];

    const handleCapturePhoto = async (index?: number) => {
        try {
            const photoBase64 = await openEmbeddedCamera();

            if (index !== undefined) {
                // Update existing photo
                handlePhotoChange(index, photoBase64);
            } else {
                // Add new photo
                setUpdatedMosq(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        photos: [...(prev.photos || []), photoBase64]
                    };
                });
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
                    setUpdatedMosq(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            photos: [...(prev.photos || []), reader.result as string]
                        };
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAzanTimeChange = (prayer: string, timeString: string) => {
        if (!updatedMosq) return;

        // Parse the time string (format: HH:MM) into hours and minutes
        const [hours, minutes] = timeString.split(':').map(Number);

        setUpdatedMosq(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                azanTimes: {
                    ...(prev.azanTimes || {}), // Create azanTimes object if it doesn't exist
                    [prayer]: {
                        ...(prev.azanTimes?.[prayer as keyof typeof prev.azanTimes] || {}),
                        hours,
                        minutes
                    }
                }
            };
        });
    };

    const handlePrayerTimeChange = (prayer: string, timeString: string) => {
        if (!updatedMosq) return;

        // Parse the time string (format: HH:MM) into hours and minutes
        const [hours, minutes] = timeString.split(':').map(Number);

        setUpdatedMosq(prev => {
            if (!prev || !prev.prayerTimes) return prev;

            return {
                ...prev,
                prayerTimes: {
                    ...prev.prayerTimes,
                    [prayer]: {
                        ...prev.prayerTimes[prayer as keyof typeof prev.prayerTimes],
                        hours,
                        minutes
                    }
                }
            };
        });
    };

    return (
        <SignedIn>
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Mosque Dashboard</h1>
                    {!editMode ? (
                        <Button onClick={() => setEditMode(true)} className="flex items-center gap-2">
                            <Edit size={16} />
                            Edit Mosque
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => {
                                setEditMode(false);
                                setUpdatedMosq(mosq);
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                                {saving ? "Saving..." : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="details">Mosque Details</TabsTrigger>
                        <TabsTrigger value="prayer-times">Prayer Times</TabsTrigger>
                        <TabsTrigger value="photos">Photos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                <h2 className="text-xl font-bold mb-4">Basic Information</h2>

                                {editMode ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Mosque Name</Label>
                                            <Input
                                                id="name"
                                                value={updatedMosq?.name || ''}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="location">Location</Label>
                                            <Textarea
                                                id="location"
                                                value={updatedMosq?.location || ''}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="imam">Imam Name</Label>
                                            <Input
                                                id="imam"
                                                value={user?.fullName || ''}
                                                readOnly
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <User size={18} className="text-primary" />
                                            <span className="font-medium">Name:</span>
                                            <span>{mosq.name}</span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <MapPin size={18} className="text-primary flex-shrink-0 mt-1" />
                                            <span className="font-medium">Location:</span>
                                            <span>{mosq.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <User size={18} className="text-primary" />
                                            <span className="font-medium">Imam:</span>
                                            <span>{mosq.imam}</span>
                                        </div>

                                        <Link
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                        >
                                            <Navigation size={16} />
                                            <span>View on Google Maps</span>
                                        </Link>
                                    </div>
                                )}
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">Location</h2>
                                <div className="w-full h-[300px] rounded-lg overflow-hidden">
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
                        </div>
                    </TabsContent>

                    <TabsContent value="prayer-times">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock size={20} className="text-primary" />
                                    <h2 className="text-xl font-bold">Daily Prayer Times</h2>
                                </div>

                                {editMode ? (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-medium text-primary">Azan Times</h3>
                                            {['fajr', 'zohar', 'asr', 'maghrib', 'isha'].map((prayer) => (
                                                <div key={`azan-${prayer}`} className="grid grid-cols-3 gap-4 items-center">
                                                    <Label className="capitalize">{prayer}</Label>
                                                    <div>
                                                        <Input
                                                            type="time"
                                                            value={`${String(updatedMosq?.azanTimes?.[prayer as keyof typeof updatedMosq.azanTimes]?.hours || 0).padStart(2, '0')}:${String(updatedMosq?.azanTimes?.[prayer as keyof typeof updatedMosq.azanTimes]?.minutes || 0).padStart(2, '0')}`}
                                                            onChange={(e) => handleAzanTimeChange(prayer, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-medium text-primary">Iqamah Times</h3>
                                            {['fajr', 'zohar', 'asr', 'maghrib', 'isha'].map((prayer) => (
                                                <div key={`prayer-${prayer}`} className="grid grid-cols-3 gap-4 items-center">
                                                    <Label className="capitalize">{prayer}</Label>
                                                    <div>
                                                        <Input
                                                            type="time"
                                                            value={`${String(updatedMosq?.prayerTimes?.[prayer as keyof typeof updatedMosq.prayerTimes]?.hours || 0).padStart(2, '0')}:${String(updatedMosq?.prayerTimes?.[prayer as keyof typeof updatedMosq.prayerTimes]?.minutes || 0).padStart(2, '0')}`}
                                                            onChange={(e) => handlePrayerTimeChange(prayer, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
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
                                )}
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar size={20} className="text-primary" />
                                    <h2 className="text-xl font-bold">Special Prayer Times</h2>
                                </div>

                                {editMode ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4 items-center">
                                            <Label>Juma Azan</Label>
                                            <div>
                                                <Input
                                                    type="time"
                                                    value={`${String(updatedMosq?.azanTimes?.juma?.hours || 0).padStart(2, '0')}:${String(updatedMosq?.azanTimes?.juma?.minutes || 0).padStart(2, '0')}`}
                                                    onChange={(e) => handleAzanTimeChange('juma', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 items-center">
                                            <Label>Juma Iqamah</Label>
                                            <div>
                                                <Input
                                                    type="time"
                                                    value={`${String(updatedMosq?.prayerTimes?.juma?.hours || 0).padStart(2, '0')}:${String(updatedMosq?.prayerTimes?.juma?.minutes || 0).padStart(2, '0')}`}
                                                    onChange={(e) => handlePrayerTimeChange('juma', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-medium text-primary">Eid-ul-Fitr</h3>
                                            <div className="grid grid-cols-2 gap-4 items-center">
                                                <Label htmlFor="eidulfitr-time">Time</Label>
                                                <Input
                                                    id="eidulfitr-time"
                                                    type="time"
                                                    value={`${String(updatedMosq?.prayerTimes?.eidulfitr?.hours || 0).padStart(2, '0')}:${String(updatedMosq?.prayerTimes?.eidulfitr?.minutes || 0).padStart(2, '0')}`}
                                                    onChange={(e) => handlePrayerTimeChange('eidulfitr', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-medium text-primary">Eid-ul-Azha</h3>
                                            <div className="grid grid-cols-2 gap-4 items-center">
                                                <Label htmlFor="eidulazha-time">Time</Label>
                                                <Input
                                                    id="eidulazha-time"
                                                    type="time"
                                                    value={`${String(updatedMosq?.prayerTimes?.eidulazha?.hours || 0).padStart(2, '0')}:${String(updatedMosq?.prayerTimes?.eidulazha?.minutes || 0).padStart(2, '0')}`}
                                                    onChange={(e) => handlePrayerTimeChange('eidulazha', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Prayer</TableHead>
                                                <TableHead>Azan</TableHead>
                                                <TableHead>Iqamah</TableHead>
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
                                                    <TableCell>
                                                        {convertToAmPm(`${mosq.prayerTimes.eidulfitr.hours}:${mosq.prayerTimes.eidulfitr.minutes}`)}
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}

                                            {mosq.prayerTimes?.eidulazha ? (
                                                <TableRow>
                                                    <TableCell className="font-medium">Eid-ul-Azha</TableCell>
                                                    <TableCell>
                                                        {convertToAmPm(`${mosq.prayerTimes.eidulazha.hours}:${mosq.prayerTimes.eidulazha.minutes}`)}
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}

                                            {!mosq.prayerTimes?.eidulfitr && !mosq.prayerTimes?.eidulazha && !mosq.prayerTimes?.juma && (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No special prayer times specified</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="photos">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Mosque Photos</h2>
                                {editMode && (
                                    <Button onClick={handleAddPhoto} variant="outline" className="flex items-center gap-2">
                                        <Plus size={16} />
                                        Add Photo
                                    </Button>
                                )}
                            </div>

                            {editMode ? (
                                <div className="space-y-4">
                                    {updatedMosq?.photos && updatedMosq.photos.length > 0 ? (
                                        updatedMosq.photos.map((photo, index) => (
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
                                        <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg"
                                            onDrop={(e) => handlePhotoDrop(e)}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            Drag and drop images here, or click "Take Photo" to add mosque photos.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {mosq.photos && mosq.photos.length > 0 ? (
                                        mosq.photos.map((photo, index) => (
                                            <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                                                <img
                                                    src={photo}
                                                    alt={`${mosq.name} - Photo ${index + 1}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center text-muted-foreground py-8">
                                            No photos available for this mosque.
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SignedIn>
    )
}

export default Page