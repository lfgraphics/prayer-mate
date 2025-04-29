'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
    SignedIn,
    SignedOut,
    UserButton,
    SignInButton,
    SignUpButton,
    useClerk
} from '@clerk/nextjs';
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ThemeChanger from './ThemeChanger';
import { useState } from 'react';

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/mosques', label: 'Mosques' },
    { href: '/about', label: 'About' }
];

export default function Header() {
    const [sheetOpen, setSheetOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useClerk();
    const isAdmin = user?.publicMetadata.role === 'admin';
    const isImam = user?.publicMetadata.role === 'imam';

    const handleCloseSheet = () => {
        setSheetOpen(false);
    };

    const renderNavLinks = (onClick?: () => void) => (
        NAV_LINKS.map(({ href, label }) => (
            <Link
                key={href}
                href={href}
                onClick={onClick}
                className={`px-2 py-1 text-sm font-medium transition-colors hover:text-primary ${pathname === href ? 'text-primary' : 'text-muted-foreground'}`}
            >
                {label}
            </Link>
        ))
    );

    return (
        <header className="sticky top-0 z-50 border-b bg-background/65 backdrop-blur">
            <div className="flex h-12 w-full items-center px-4 justify-between">
                {/* Logo */}
                <Link href="/" className="text-lg font-bold text-primary">
                    Prayer Mate
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-4">
                    {renderNavLinks()}
                    <SignedIn>
                        {(isAdmin || isImam) && (
                            <Link
                                href={isAdmin ? "/admin" : "/imam"}
                                className={`px-2 py-1 text-sm font-medium transition-colors hover:text-primary ${pathname === (isAdmin ? '/admin' : '/imam') ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                Dashboard
                            </Link>
                        )}
                    </SignedIn>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <ThemeChanger />

                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <div className="hidden md-block">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button variant="default" size="sm">Sign Up</Button>
                            </SignUpButton>
                        </SignedOut>
                    </div>

                    <div className="md:hidden">
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Menu className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                                    <SheetDescription></SheetDescription>
                                </SheetHeader>
                                <nav className="mt-4 mx-4 flex flex-col gap-2">
                                    {renderNavLinks(() => handleCloseSheet())}
                                    <SignedIn>
                                        {(isAdmin || isImam) && (
                                            <Link
                                                onClick={() => handleCloseSheet()}
                                                href={isAdmin ? "/admin" : "/imam"}
                                                className={`px-2 py-1 text-sm font-medium transition-colors hover:text-primary ${pathname === (isAdmin ? '/admin' : '/imam') ? 'text-primary' : 'text-muted-foreground'}`}
                                            >
                                                Dashboard
                                            </Link>
                                        )}
                                    </SignedIn>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <Button variant="ghost" size="sm">Sign In</Button>
                                        </SignInButton>
                                        <SignUpButton mode="modal">
                                            <Button variant="default" size="sm">Sign Up</Button>
                                        </SignUpButton>
                                    </SignedOut>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
