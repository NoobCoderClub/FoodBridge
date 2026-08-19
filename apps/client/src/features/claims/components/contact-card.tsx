import { MapPin, Navigation, Phone } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { CountdownTimer } from '@repo/ui/countdown';
import { mapsHref, telHref } from '@repo/ui/lib/format';

/**
 * Shown only once the taker holds an active claim. This is a phone-in-hand,
 * standing-outside-the-restaurant screen, so the address and the call button
 * are the two biggest things on it.
 */
export function ContactCard({
  addressExact,
  posterPhone,
  pickupDeadline,
  latitude,
  longitude,
}: {
  addressExact: string;
  posterPhone: string | null;
  pickupDeadline: string;
  /** The poster's GPS fix, revealed alongside the exact address. */
  latitude?: number | null;
  longitude?: number | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-primary/25 bg-primary/5">
      <div className="flex items-center justify-between gap-3 border-b border-primary/20 bg-primary/10 px-5 py-3">
        <p className="text-sm font-semibold text-primary">Pickup details</p>
        <CountdownTimer deadline={pickupDeadline} />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Exact address</p>
            <p className="mt-0.5 font-medium break-words">{addressExact}</p>
          </div>
        </div>

        {posterPhone ? (
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Poster’s phone</p>
              <p className="tabular mt-0.5 font-medium">{posterPhone}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          {posterPhone ? (
            <Button block render={<a href={telHref(posterPhone)} />}>
              <Phone aria-hidden="true" />
              Call poster
            </Button>
          ) : null}
          <Button
            variant="outline"
            block
            render={
              <a
                href={mapsHref(addressExact, { latitude, longitude })}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Navigation aria-hidden="true" />
            Directions
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Coordinate by phone — FoodBridge has no in-app chat. If you can’t make it, let the poster
          know so the food can be released to someone else.
        </p>
      </div>
    </div>
  );
}
