'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Camera, Clock, Crosshair, MapPin, UtensilsCrossed } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Form, FormField } from '@repo/ui/field';
import { InlineError } from '@repo/ui/error-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { toast } from '@repo/ui/toast';
import { useGeolocation } from '@/hooks/use-geolocation';
import { ListingImagePicker } from './listing-image-picker';
import { useCreateListing } from '../hooks/use-create-listing';
import { createListingSchema } from '../schema/listing.schema';
import { zodFieldErrors } from '@/lib/form';

/** Default window: prepared now, collectable for the next three hours. */
function defaultTimes() {
  const now = new Date();
  const expires = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const toLocalInput = (date: Date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return { preparedAt: toLocalInput(now), expiresAt: toLocalInput(expires) };
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-5 p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

export function ListingForm() {
  const router = useRouter();
  const createListing = useCreateListing();
  const geo = useGeolocation({ immediate: false });

  const [form, setForm] = useState({
    foodType: '',
    quantity: '',
    quantityUnit: 'servings' as 'kg' | 'servings',
    latitude: '',
    longitude: '',
    addressApprox: '',
    addressExact: '',
    ...defaultTimes(),
  });
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Folded in from the geolocation callback rather than an effect watching geo
  // state, so the coordinates are written exactly once per request.
  function useMyLocation() {
    geo.request(({ lat, lng }) =>
      setForm((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) })),
    );
  }

  const hasCoords = form.latitude !== '' && form.longitude !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = createListingSchema.safeParse({
      ...form,
      imageKeys,
      preparedAt: form.preparedAt ? new Date(form.preparedAt).toISOString() : '',
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : '',
    });

    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    createListing.mutate(parsed.data, {
      onSuccess: (listing) => {
        toast.success({
          title: 'Listing posted',
          description: 'Nearby takers can see it now — you’ll be notified when someone claims it.',
        });
        router.push(`/listings/${listing.id}`);
      },
      onError: (err) => setFormError(err.message),
    });
  }

  return (
    <Form errors={errors} onSubmit={handleSubmit} className="space-y-5">
      <Section
        icon={UtensilsCrossed}
        title="What are you sharing?"
        description="Describe the food so a taker knows what they’re collecting."
      >
        <FormField name="foodType" label="Food type">
          <Input
            placeholder="e.g. Chicken biryani, mixed pastries"
            value={form.foodType}
            onChange={(e) => update('foodType', e.target.value)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="quantity" label="Quantity">
            <Input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="40"
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
            />
          </FormField>

          <FormField name="quantityUnit" label="Unit">
            <Select
              value={form.quantityUnit}
              onValueChange={(value) => update('quantityUnit', String(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servings">Servings</SelectItem>
                <SelectItem value="kg">Kilograms</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </Section>

      <Section
        icon={Camera}
        title="Photos"
        description="Optional, but a photo is the first thing anyone judges the food on. The first one is the cover."
      >
        <ListingImagePicker onChange={setImageKeys} onUploadingChange={setUploading} />
      </Section>

      <Section
        icon={MapPin}
        title="Where is it?"
        description="Takers see only the approximate area until they claim it. The exact address is revealed to the claimer alone."
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={hasCoords ? 'outline' : 'default'}
              size="sm"
              onClick={useMyLocation}
              loading={geo.loading}
            >
              <Crosshair aria-hidden="true" />
              {hasCoords ? 'Update location' : 'Use my current location'}
            </Button>
            {hasCoords ? (
              <span className="tabular text-xs text-muted-foreground">
                {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
              </span>
            ) : null}
          </div>

          {geo.denied ? (
            <p className="text-xs text-muted-foreground">
              Location unavailable. Enter the coordinates manually below — takers need them to sort
              listings by distance.
            </p>
          ) : null}

          {geo.denied || hasCoords ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField name="latitude" label="Latitude">
                <Input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={form.latitude}
                  onChange={(e) => update('latitude', e.target.value)}
                />
              </FormField>
              <FormField name="longitude" label="Longitude">
                <Input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={form.longitude}
                  onChange={(e) => update('longitude', e.target.value)}
                />
              </FormField>
            </div>
          ) : null}
        </div>

        <FormField
          name="addressApprox"
          label="Approximate area"
          description="Shown publicly — keep it broad, like a neighbourhood."
        >
          <Input
            placeholder="e.g. Banani, Dhaka"
            value={form.addressApprox}
            onChange={(e) => update('addressApprox', e.target.value)}
          />
        </FormField>

        <FormField
          name="addressExact"
          label="Exact pickup address"
          description="Only revealed to the taker who claims this listing."
        >
          <Input
            placeholder="e.g. House 12, Road 5, Banani"
            value={form.addressExact}
            onChange={(e) => update('addressExact', e.target.value)}
          />
        </FormField>
      </Section>

      <Section
        icon={Clock}
        title="When does it expire?"
        description="Listings auto-expire at this time and are flagged as wasted, so be realistic."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="preparedAt" label="Prepared at">
            <Input
              type="datetime-local"
              value={form.preparedAt}
              onChange={(e) => update('preparedAt', e.target.value)}
            />
          </FormField>
          <FormField name="expiresAt" label="Expires at">
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => update('expiresAt', e.target.value)}
            />
          </FormField>
        </div>
      </Section>

      {formError ? <InlineError>{formError}</InlineError> : null}

      {/* Posting mid-upload would drop the photos still in flight. */}
      <Button type="submit" size="lg" block loading={createListing.isPending} disabled={uploading}>
        {uploading ? 'Waiting for photos…' : 'Post listing'}
      </Button>
    </Form>
  );
}
