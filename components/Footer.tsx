"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn } from "@clerk/nextjs";
import { userInfo } from "@/utils/authUtils";
import { useEffect, useState } from "react";
import { User } from "@clerk/nextjs/server";

export default function Footer() {
    const [localUser, setLocalUser] = useState<User | null>();
    useEffect(() => {
        userInfo().then((user) => {
            setLocalUser(user.user);
            console.log(user.user?.publicMetadata.role);
        });
    }, []);

    return (
        <footer className="border-t bg-background">
            <div className="container py-8 md:py-12 mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Prayer Mate</h3>
                        <p className="text-sm text-muted-foreground">
                            The single app to know Prayer Time in mosques around you
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <nav className="flex flex-col space-y-2">
                            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                                Home
                            </Link>
                            <Link href="/mosques" className="text-sm text-muted-foreground hover:text-primary">
                                Mosques
                            </Link>
                            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                                About
                            </Link>
                        </nav>
                    </div>

                    <SignedIn>
                        {localUser && localUser?.publicMetadata.role !== 'imam' || localUser?.publicMetadata.role !== 'admin' && <Link href="/mosques/create">
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">For Imams</h3>
                                <div>
                                    <Button variant="default">Enrol as an Imam</Button>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Are you an Imam? Register your mosque and help the community.
                                    </p>
                                </div>
                            </div>
                        </Link>}
                    </SignedIn>
                </div>

                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Prayer Mate. All rights reserved.</p>
                </div>
            </div>
        </footer >
    );
}