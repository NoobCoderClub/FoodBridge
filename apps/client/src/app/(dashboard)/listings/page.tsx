import Link from 'next/link';
import { ListingList } from '@/features/listings/components/listing-list';

export default function ListingsPage() {
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
