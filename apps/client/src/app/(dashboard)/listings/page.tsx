'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ListingList } from '@/features/listings/components/listing-list';

export default function ListingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <p className="p-8">Loading...</p>;

  if (user?.role !== 'taker') {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
        <h1 className="text-2xl font-semibold">Browse listings</h1>
        <p className="text-sm text-gray-600">
          This view is for takers. As a poster, head over to{' '}
          <Link href="/listings/new" className="underline">
            Post a listing
          </Link>{' '}
          instead.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Browse listings</h1>
        <Link href="/listings/new" className="text-sm underline">
          Post a listing
        </Link>
      </div>
      <ListingList />
    </main>
  );
}
