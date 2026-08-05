'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { EmptyState } from '@repo/ui/empty-state';
import { PageHeader, PageShell } from '@repo/ui/page-header';
import { CardSkeleton } from '@repo/ui/skeleton';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ListingList } from '@/features/listings/components/listing-list';

export default function ListingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <PageShell>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </PageShell>
    );
  }

  if (user?.role !== 'taker') {
    return (
      <PageShell>
        <EmptyState
          icon={<PlusCircle aria-hidden="true" />}
          title="This view is for food takers"
          description="You’re signed in as a poster. Share your surplus food and nearby takers will be able to claim it."
          action={
            <Button render={<Link href="/listings/new" />}>
              <PlusCircle aria-hidden="true" />
              Post a listing
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="Food near you"
        description="Sorted by distance, then by how soon each listing expires. Claim one to reveal the pickup address and the poster’s phone number."
      />
      <ListingList />
    </PageShell>
  );
}
