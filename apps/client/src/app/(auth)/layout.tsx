import Link from 'next/link';
import { Clock3, MapPin, Sprout } from 'lucide-react';
import { ThemeToggle } from '@repo/ui/theme-toggle';

const POINTS = [
  {
    icon: MapPin,
    title: 'Nearby, not nationwide',
    body: 'Listings are sorted by how close they are to you, so a pickup is always walkable or a short drive.',
  },
  {
    icon: Clock3,
    title: 'Claim it, then collect it',
    body: 'Claiming locks the food to you and reveals the exact address and the poster’s phone number.',
  },
  {
    icon: Sprout,
    title: 'Nothing goes to landfill',
    body: 'Every completed pickup is surplus food that fed someone instead of being thrown away.',
  },
];

/**
 * Split layout: the brand panel carries the story on desktop and collapses away
 * on mobile, where the form is all that matters.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:w-1/2 lg:flex-col xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-highlight/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <Link href="/" className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          FoodBridge
        </Link>

        <div className="relative mt-auto space-y-10">
          <p className="max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance">
            Surplus food, redistributed before it spoils.
          </p>

          <ul className="max-w-md space-y-6">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <point.icon className="size-4.5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{point.title}</span>
                  <span className="mt-1 block text-sm text-primary-foreground/75">
                    {point.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold tracking-tight lg:invisible"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-4.5" aria-hidden="true" />
            </span>
            FoodBridge
          </Link>
          <ThemeToggle />
        </div>

        <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
