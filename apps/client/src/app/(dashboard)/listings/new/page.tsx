'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ListingForm } from '@/features/listings/components/listing-form';

export default function NewListingPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <p className="p-8">Loading...</p>;

  if (user?.role !== 'poster') {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8">
        <h1 className="text-2xl font-semibold">Post a listing</h1>
        <p className="text-sm text-gray-600">
          This view is for posters. Head over to{' '}
          <Link href="/listings" className="underline">
            Browse listings
          </Link>{' '}
          instead.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Post a listing</h1>
      <ListingForm />
    </main>
  );
}
