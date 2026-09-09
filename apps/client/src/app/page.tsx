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
    title: 'Someone lists surplus',
    body: 'A restaurant, cafe, caterer or event organiser posts what’s left over, how much of it there is, and when it stops being good to eat.',
  },
  {
    icon: MapPin,
    title: 'Someone nearby claims it',
    body: 'Approved NGOs, shelters and neighbours see listings sorted by distance and time-to-expiry, and claim the one they can actually reach.',
  },
  {
    icon: PhoneCall,
    title: 'They collect it in person',
    body: 'Claiming reveals the exact address and the poster’s phone number, and starts a 60-minute pickup window. No middlemen, no warehousing.',
  },
];

// Two things one account does, not two kinds of account.
const AUDIENCES = [
  {
    icon: Store,
    eyebrow: 'Give surplus',
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
    eyebrow: 'Collect nearby',
    title: 'Good food, close by, right now',
    points: [
      'Listings ranked by how close and how urgent they are',
      'A live countdown so you know exactly how long you have',
      'Call whoever posted it directly — no in-app back and forth',
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
            className="pointer-events-none absolute -top-40 left-1/2 size-144 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-primary bg-primary/5 shadow-soft">
                <Sprout className="size-3.5 text-primary" aria-hidden="true" />
                Community food rescue
              </span>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Good food deserves a <span className="text-primary">second chance.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
                FoodBridge connects restaurants with people and communities who need surplus food —
                helping good meals reach the table instead of going to waste.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" render={<Link href="/signup" />}>
                  <Sprout aria-hidden="true" />
                  Get started
                </Button>

                <Button size="lg" variant="outline" render={<Link href="/login" />}>
                  Log in
                </Button>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Give surplus food a purpose. Find what you need. Make a difference.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            {/* Section Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-primary bg-primary/5 shadow-soft">
                  Simple process
                </span>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  How it works
                </h2>

                <p className="mt-3 text-muted-foreground">
                  Three steps, one pickup window, no warehousing in between.
                </p>
              </div>

              <div className="hidden text-sm text-muted-foreground sm:block">
                From surplus to shared
              </div>
            </div>

            {/* Steps */}
            <ol className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
              {STEPS.map((step, index) => (
                <li key={step.title} className="group relative">
                  <Card
                    className="
              relative h-full overflow-hidden border-border/70
              bg-card/80 p-6 shadow-sm
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-lg
              sm:p-7
            "
                  >
                    {/* Background number */}
                    <span
                      aria-hidden="true"
                      className="
                pointer-events-none absolute -right-3 -top-7
                text-8xl font-bold tracking-tighter
                text-primary/5 transition-colors duration-300
                group-hover:text-primary/10
              "
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Top row */}
                    <div className="relative flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                        <step.icon className="size-5" aria-hidden="true" />
                      </div>

                      <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                        Step {index + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="relative mt-8">
                      <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                    </div>

                    {/* Bottom accent */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                  </Card>

                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="
                absolute left-[calc(100%+6px)] top-1/2 hidden
                h-px w-4 bg-border md:block
              "
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The urgency argument */}
        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              {/* Content */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-primary bg-primary/5 shadow-soft">
                  Why FoodBridge?
                </span>

                <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Food waste is a <span className="text-primary">timing problem.</span>
                </h2>

                <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                  Surplus food doesn’t go to waste because nobody wants it. It goes to waste because
                  the people who want it don’t hear about it in time. FoodBridge makes the clock
                  visible to everyone: every listing shows exactly how long is left, and every claim
                  starts a countdown.
                </p>

                <div className="mt-8">
                  <Button render={<Link href="/signup" />} className="group">
                    Get started
                    <ArrowRight
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>

              {/* Listing visualization */}
              <div className="relative">
                {/* Decorative background */}
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/4 blur-2xl" />

                <Card
                  className="relative overflow-hidden rounded-2xl border-border/70 bg-background p-0 shadow-sm"
                  variant="raised"
                >
                  {/* Top accent */}
                  <div className="h-1 bg-primary/70" />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <UtensilsCrossed className="size-5" aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                          <p className="font-semibold tracking-tight">Chicken Biryani</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            40 servings available
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <MapPin className="size-3" aria-hidden="true" />
                        1.2 km
                      </span>
                    </div>

                    {/* Time remaining */}
                    <div className="mt-7 rounded-xl border border-urgency-soon/15 bg-urgency-soon/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Claim window</p>
                          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-urgency-soon">
                            <Clock3 className="size-4" aria-hidden="true" />
                            2h 14m left
                          </p>
                        </div>

                        <span className="text-xs font-medium text-muted-foreground">
                          68% remaining
                        </span>
                      </div>

                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background">
                        <div className="h-full w-[68%] rounded-full bg-urgency-soon transition-all" />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-muted">
                          <MapPin className="size-3.5" aria-hidden="true" />
                        </span>
                        Banani, Dhaka
                      </span>

                      <span className="text-xs font-medium text-primary">Available now</span>
                    </div>
                  </div>
                </Card>

                {/* Floating status */}
                <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-border bg-background px-4 py-3 shadow-md sm:block">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                      <Clock3 className="size-3.5 text-primary" aria-hidden="true" />
                    </span>

                    <div>
                      <p className="text-xs font-semibold">Time matters</p>
                      <p className="text-[11px] text-muted-foreground">Claim before it expires</p>
                    </div>
                  </div>
                </div>

                {/* Floating location badge */}
                <div className="absolute -right-3 -top-5 hidden rounded-xl border border-border bg-background px-3 py-2 shadow-md sm:block">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="size-2 rounded-full bg-primary" />
                    Nearby listing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audience split */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            {/* Section heading */}
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-primary bg-primary/5 shadow-soft">
                Built for everyone
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                One platform, two ways to make a difference
              </h2>
              <p className="mt-4 text-muted-foreground">
                Whether you have surplus food or want to help put it to good use, FoodBridge makes
                the process simple.
              </p>
            </div>
            {/* Audience cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {AUDIENCES.map((audience) => (
                <Card
                  key={audience.eyebrow}
                  className="group relative gap-6 overflow-hidden p-7 transition-shadow hover:shadow-md sm:p-8"
                >
                  {/* Icon + label */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <audience.icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                      {audience.eyebrow}
                    </span>
                  </div>
                  {/* Heading */}
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{audience.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {audience.eyebrow === 'For businesses'
                        ? "Turn today's surplus into an opportunity to help someone nearby."
                        : 'Find available surplus food nearby before it goes to waste.'}
                    </p>
                  </div>
                  {/* Benefits */}
                  <ul className="space-y-3 border-t border-border pt-5">
                    {audience.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm">
                        <span
                          aria-hidden="true"
                          className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                        >
                          <span className="size-1.5 rounded-full bg-primary" />
                        </span>
                        <span className="leading-5 text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                  {/* CTA */}
                  <div className="mt-auto pt-1">
                    <Button
                      variant="outline"
                      className="group-hover:border-primary group-hover:text-primary"
                      render={<Link href={audience.href} />}
                    >
                      {audience.cta}
                      <ArrowRight
                        className="transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
          {/* Main footer */}
          <div className="grid gap-10 lg:grid-cols-[1.6fr_0.8fr_1fr]">
            {/* Brand */}
            <div className="max-w-md">
              <Link href="/" className="group inline-flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-rotate-3">
                  <Sprout className="size-4.5" aria-hidden="true" />
                </span>

                <span className="text-base font-semibold tracking-tight">FoodBridge</span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                Connecting surplus food with people who can put it to good use. Less waste, more
                community.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                Building a less wasteful community
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-sm font-semibold">Join Us</h3>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign up
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold">Get in touch</h3>

              <div className="mt-4 space-y-3">
                <a
                  href="mailto:hello@foodbridge.com"
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                    <Sprout className="size-4" aria-hidden="true" />
                  </span>
                  hello@foodbridge.com
                </a>

                <a
                  href="tel:+8801234567890"
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                    <PhoneCall className="size-4" aria-hidden="true" />
                  </span>
                  +880 1739-702012
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} FoodBridge. All rights reserved.</p>

            <p className="flex items-center gap-1.5">
              Made for the community
              <span className="text-primary">•</span>
              One pickup at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
