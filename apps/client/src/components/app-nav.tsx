'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Menu, PlusCircle, Search, Sprout, Ticket, X } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ThemeToggle } from '@repo/ui/theme-toggle';
import { cn } from '@repo/ui/lib/utils';
import type { UserRole } from '@repo/types';

type NavLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const POSTER_LINKS: NavLink[] = [
  { href: '/my-listings', label: 'My listings', icon: Sprout },
  { href: '/listings/new', label: 'Post a listing', icon: PlusCircle },
];

const TAKER_LINKS: NavLink[] = [
  { href: '/listings', label: 'Browse', icon: Search },
  { href: '/my-claims', label: 'My claims', icon: Ticket },
];

export function AppNav({
  role,
  userName,
  onLogout,
  loggingOut,
}: {
  role: UserRole;
  userName: string;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = role === 'poster' ? POSTER_LINKS : TAKER_LINKS;
  const home = role === 'poster' ? '/my-listings' : '/listings';

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-4 sm:px-6"
      >
        <Link
          href={home}
          className="flex shrink-0 items-center gap-2 rounded-lg font-semibold tracking-tight focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="size-4.5" aria-hidden="true" />
          </span>
          FoodBridge
        </Link>

        <div className="hidden items-center gap-1 sm:ml-4 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                'focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
                isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <link.icon className="size-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <span className="hidden max-w-32 truncate px-2 text-sm text-muted-foreground lg:inline">
            {userName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={onLogout}
            loading={loggingOut}
          >
            <LogOut aria-hidden="true" />
            Log out
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </nav>

      {menuOpen ? (
        <div id="mobile-menu" className="border-t border-border bg-background sm:hidden">
          <div className="flex flex-col gap-1 p-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                // Dismiss on navigation — a route change should never leave the
                // mobile menu hanging open.
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'inline-flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <link.icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            ))}
            <Button
              variant="outline"
              block
              className="mt-2"
              onClick={onLogout}
              loading={loggingOut}
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
