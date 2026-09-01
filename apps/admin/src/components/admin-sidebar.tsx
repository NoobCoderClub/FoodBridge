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
              'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all',
              'focus-visible:ring-2 focus-visible:ring-sidebar-ring/40 focus-visible:outline-none',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
            )}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-lg',
                active
                  ? 'bg-sidebar-primary/10 text-sidebar-primary'
                  : 'text-sidebar-foreground/50',
              )}
            >
              <link.icon className="size-4" aria-hidden="true" />
            </span>

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
      className="flex items-center gap-2.5 font-semibold tracking-tight text-sidebar-foreground"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <ShieldCheck className="size-4.5" aria-hidden="true" />
      </span>

      <span>
        FoodBridge <span className="text-xs font-medium text-sidebar-foreground/40">Admin</span>
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-svh">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">{brand}</div>

        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 p-3">
          {NavLinks({ pathname })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 rounded-xl bg-sidebar-accent/50 px-3 py-2.5">
            <p className="truncate text-xs font-medium text-sidebar-foreground/70">{userName}</p>
            <p className="text-[10px] text-sidebar-foreground/40">Administrator</p>
          </div>

          <Button
            variant="ghost"
            block
            className="justify-start rounded-xl text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive"
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
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />

            <Button
              variant="outline"
              block
              className="mt-2 rounded-xl"
              onClick={onLogout}
              loading={loggingOut}
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </nav>
        ) : null}

        {/* Desktop header */}
        <div className="hidden h-16 items-center justify-end border-b border-border px-6 lg:flex">
          <ThemeToggle />
        </div>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
