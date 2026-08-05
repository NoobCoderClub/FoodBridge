'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { EmptyState } from '@repo/ui/empty-state';
import { PageHeader, PageShell } from '@repo/ui/page-header';
import { Skeleton } from '@repo/ui/skeleton';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ListingForm } from '@/features/listings/components/listing-form';

export default function NewListingPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <PageShell width="narrow" className="space-y-5">
        <Skeleton className="h-9 w-1/2" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-xl" />
        ))}
      </PageShell>
    );
  }

  if (user?.role !== 'poster') {
    return (
      <PageShell width="narrow">
        <EmptyState
          icon={<Search aria-hidden="true" />}
          title="This view is for food posters"
          description="You’re signed in as a taker. Browse what’s available near you and claim a pickup instead."
          action={
            <Button render={<Link href="/listings" />}>
              <Search aria-hidden="true" />
              Browse food near you
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell width="narrow" className="space-y-8">
      <PageHeader
        title="Post surplus food"
        description="Takers nearby will see this straight away. The exact address stays private until someone claims it."
      />
      <ListingForm />
    </PageShell>
  );
}
