"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/mosques", label: "Mosques" },
    { href: "/about", label: "About" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <div className="flex items-center gap-6">
                    {/* Logo/App Name */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">Prayer Mate</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile Navigation - Only visible when signed in */}
                    <SignedIn>
                        <Sheet>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetHeader>
                                Prayer Mate
                            </SheetHeader>
                            <SheetContent side="left">
                                <div className="flex flex-col gap-4 py-4">
                                    <Link href="/" className="flex items-center gap-2 px-2">
                                        <span className="text-xl font-bold">Prayer Mate</span>
                                    </Link>
                                    <nav className="flex flex-col gap-3">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={`px-2 py-1 text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                                                    }`}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </SignedIn>

                    {/* Auth Buttons */}
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button variant="default" size="sm">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}