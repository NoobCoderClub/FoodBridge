import { ListingForm } from '@/features/listings/components/listing-form';

export default function NewListingPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Post a listing</h1>
      <ListingForm />
    </main>
  );
}
