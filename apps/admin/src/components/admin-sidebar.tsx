'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BarChart3, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ThemeToggle } from '@repo/ui/theme-toggle';
import { cn } from '@repo/ui/lib/utils';

const LINKS = [
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
              'focus-visible:ring-3 focus-visible:ring-sidebar-ring/40 focus-visible:outline-none',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            )}
          >
            <link.icon className="size-4 shrink-0" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminSidebar({
  userName,
  onLogout,
  loggingOut,
  children,
}: {
  userName: string;
  onLogout: () => void;
  loggingOut: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = (
    <Link
      href="/accounts"
      className="flex items-center gap-2 font-semibold tracking-tight text-sidebar-foreground"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <ShieldCheck className="size-4.5" aria-hidden="true" />
      </span>
      FoodBridge
      <span className="text-sidebar-foreground/50">Admin</span>
    </Link>
  );

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-4">{brand}</div>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 p-3">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="space-y-2 border-t border-sidebar-border p-3">
          <p className="truncate px-3 text-xs text-sidebar-foreground/60">{userName}</p>
          <Button
            variant="ghost"
            block
            className="justify-start"
            onClick={onLogout}
            loading={loggingOut}
          >
            <LogOut aria-hidden="true" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
          {brand}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </header>

        {mobileOpen ? (
          <nav
            id="admin-mobile-nav"
            aria-label="Admin"
            className="flex flex-col gap-1 border-b border-border bg-sidebar p-3 lg:hidden"
          >
            {/* Dismiss on navigation — a route change should never leave the
                mobile menu hanging open. */}
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
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
          </nav>
        ) : null}

        {/* Desktop header strip carries the theme toggle */}
        <div className="hidden h-16 items-center justify-end border-b border-border px-6 lg:flex">
          <ThemeToggle />
        </div>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
