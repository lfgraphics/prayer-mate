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

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/mosques', label: 'Mosques' },
    { href: '/about', label: 'About' }
];

export default function Header() {
    const pathname = usePathname();
    const { user } = useClerk();
    const isAdmin = user?.publicMetadata.role === 'admin';

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
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
            <div className="flex h-12 items-center justify-between px-4 w-full">
                {/* Logo */}
                <Link href="/" className="text-lg font-bold text-primary">
                    Prayer Mate
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-4">
                    {renderNavLinks()}
                    <SignedIn>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className={`px-2 py-1 text-sm font-medium transition-colors hover:text-primary ${pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                Dashboard
                            </Link>
                        )}
                    </SignedIn>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 -translate-x-6">
                    <ThemeChanger />

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet>
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
                                <nav className="mt-4 ml-4 flex flex-col gap-2">
                                    {renderNavLinks()}
                                    <SignedIn>
                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                className="px-2 py-1 text-sm font-medium hover:text-primary"
                                            >
                                                Dashboard
                                            </Link>
                                        )}
                                        <div className="mt-4">
                                            <UserButton afterSignOutUrl="/" />
                                        </div>
                                    </SignedIn>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Auth Buttons */}
                    <SignedOut>
                        <div className="hidden md:block">
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">Sign In</Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button variant="default" size="sm">Sign Up</Button>
                            </SignUpButton>
                        </div>
                        <div className="md:hidden">
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm" className="h-8 px-2">Sign In</Button>
                            </SignInButton>
                        </div>
                    </SignedOut>

                    {/* User Menu on desktop */}
                    <SignedIn>
                        <div className="hidden md:block">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
