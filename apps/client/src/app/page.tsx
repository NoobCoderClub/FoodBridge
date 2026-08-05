import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  HandHeart,
  MapPin,
  PhoneCall,
  Sprout,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { ThemeToggle } from '@repo/ui/theme-toggle';

const STEPS = [
  {
    icon: Store,
    title: 'A poster lists surplus',
    body: 'A restaurant, cafe, caterer or event organiser posts what’s left over, how much of it there is, and when it stops being good to eat.',
  },
  {
    icon: MapPin,
    title: 'A taker nearby claims it',
    body: 'Approved NGOs, shelters and neighbours see listings sorted by distance and time-to-expiry, and claim the one they can actually reach.',
  },
  {
    icon: PhoneCall,
    title: 'They collect it in person',
    body: 'Claiming reveals the exact address and the poster’s phone number, and starts a 60-minute pickup window. No middlemen, no warehousing.',
  },
];

const AUDIENCES = [
  {
    icon: Store,
    eyebrow: 'For food posters',
    title: 'Surplus shouldn’t mean waste',
    points: [
      'Post what’s left in under a minute',
      'Your exact address stays private until someone claims',
      'See everything you’ve rescued in one place',
    ],
    href: '/signup',
    cta: 'Share surplus food',
  },
  {
    icon: HandHeart,
    eyebrow: 'For food takers',
    title: 'Good food, close by, right now',
    points: [
      'Listings ranked by how close and how urgent they are',
      'A live countdown so you know exactly how long you have',
      'Call the poster directly — no in-app back and forth',
    ],
    href: '/signup',
    cta: 'Find food near you',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6"
        >
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-4.5" aria-hidden="true" />
            </span>
            FoodBridge
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Sign up
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-soft">
                <Sprout className="size-3.5 text-primary" aria-hidden="true" />
                Community food rescue
              </span>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Surplus food, redistributed <span className="text-primary">before it spoils</span>.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
                Restaurants and caterers end each day with food nobody bought. Shelters and
                neighbours nearby could use it tonight. FoodBridge is the bridge between them — in
                real time, before the clock runs out.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" render={<Link href="/signup" />}>
                  <Store aria-hidden="true" />I have food to give
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/signup" />}>
                  <HandHeart aria-hidden="true" />I need food
                </Button>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Free to use. Every account is reviewed before it goes live.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
              <p className="mt-3 text-muted-foreground">
                Three steps, one pickup window, no warehousing in between.
              </p>
            </div>

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <Card className="h-full gap-4 p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <step.icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="tabular text-sm font-medium text-muted-foreground">
                        Step {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The urgency argument */}
        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-balance">
                  Food waste is a timing problem
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Surplus food doesn’t go to waste because nobody wants it. It goes to waste because
                  the people who want it don’t hear about it in time. FoodBridge makes the clock
                  visible to everyone: every listing shows exactly how long is left, and every claim
                  starts a countdown.
                </p>
                <div className="mt-8">
                  <Button render={<Link href="/signup" />}>
                    Get started
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Illustrative listing card — mirrors the real component */}
              <Card className="gap-4 p-5" variant="raised">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UtensilsCrossed className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">Chicken biryani</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">40 servings</p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <MapPin className="size-3" aria-hidden="true" />
                    1.2 km
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[68%] rounded-full bg-urgency-soon" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      Banani, Dhaka
                    </span>
                    <span className="tabular flex items-center gap-1.5 text-sm font-medium text-urgency-soon">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      2h 14m left
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Audience split */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid gap-6 md:grid-cols-2">
              {AUDIENCES.map((audience) => (
                <Card key={audience.eyebrow} className="gap-5 p-8">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <audience.icon className="size-5.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-primary">{audience.eyebrow}</p>
                    <h3 className="mt-1 text-xl font-semibold">{audience.title}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {audience.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="mt-1 w-fit"
                    render={<Link href={audience.href} />}
                  >
                    {audience.cta}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-4" aria-hidden="true" />
            </span>
            FoodBridge
          </div>
          <p className="text-sm text-muted-foreground">
            Rescuing surplus food, one pickup at a time.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="text-muted-foreground hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
