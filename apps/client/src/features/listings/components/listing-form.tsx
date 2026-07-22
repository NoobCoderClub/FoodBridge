'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateListing } from '../hooks/use-create-listing';
import { createListingSchema } from '../schema/listing.schema';

export function ListingForm() {
  const router = useRouter();
  const createListing = useCreateListing();
  const [form, setForm] = useState({
    foodType: '',
    quantity: '',
    quantityUnit: 'servings' as 'kg' | 'servings',
    latitude: '',
    longitude: '',
    addressApprox: '',
    addressExact: '',
    preparedAt: '',
    expiresAt: '',
  });
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = createListingSchema.safeParse({
      ...form,
      preparedAt: form.preparedAt ? new Date(form.preparedAt).toISOString() : '',
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : '',
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    createListing.mutate(parsed.data, {
      onSuccess: (listing) => router.push(`/listings/${listing.id}`),
      onError: (err) => setError(err.message),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="foodType">Food type</Label>
        <Input
          id="foodType"
          value={form.foodType}
          onChange={(e) => update('foodType', e.target.value)}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="any"
            value={form.quantity}
            onChange={(e) => update('quantity', e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="quantityUnit">Unit</Label>
          <select
            id="quantityUnit"
            value={form.quantityUnit}
            onChange={(e) => update('quantityUnit', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="servings">Servings</option>
            <option value="kg">Kg</option>
          </select>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => update('latitude', e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => update('longitude', e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="addressApprox">Approximate area</Label>
        <Input
          id="addressApprox"
          value={form.addressApprox}
          onChange={(e) => update('addressApprox', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="addressExact">Exact pickup address</Label>
        <Input
          id="addressExact"
          value={form.addressExact}
          onChange={(e) => update('addressExact', e.target.value)}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="preparedAt">Prepared at</Label>
          <Input
            id="preparedAt"
            type="datetime-local"
            value={form.preparedAt}
            onChange={(e) => update('preparedAt', e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="expiresAt">Expires at</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => update('expiresAt', e.target.value)}
            required
          />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={createListing.isPending}>
        {createListing.isPending ? 'Posting...' : 'Post listing'}
      </Button>
    </form>
  );
}
