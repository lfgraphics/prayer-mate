"use client"
import { useRouter } from 'next/navigation';
import CreateMosqueForm from '@/components/imam/CreateMosqueForm';
import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import Loading from '@/app/loading';

export default function CreateMosquePage() {
    const router = useRouter();
    const { isLoaded, user } = useUser();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (isLoaded) {
            // Check if user is logged in and has a mosque
            if (user) {
                const userRole = user.publicMetadata.role as string;
                const userMosqId = user.publicMetadata.mosqId as string | undefined;

                // If user already has a mosque, redirect to imam page
                if (userMosqId) {
                    router.replace('/imam');
                    return;
                }
            }
            setIsChecking(false);
        }
    }, [isLoaded, user, router]);

    // Show loading while checking user status
    if (!isLoaded || isChecking) {
        return <Loading />;
    }

    return (
        <div className="container py-8 block mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Your Mosque</h1>
            <SignedIn>
                <CreateMosqueForm />
            </SignedIn>
            <SignedOut>
                <p className="text-center">
                    You're not signed in. Please sign in to proceed further.
                </p>
            </SignedOut>
        </div>
    );
}