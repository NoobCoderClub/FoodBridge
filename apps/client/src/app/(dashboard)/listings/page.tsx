'use client';

import { PageHeader, PageShell } from '@repo/ui/page-header';
import { ListingList } from '@/features/listings/components/listing-list';

export default function ListingsPage() {
  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="Food near you"
        description="Sorted by distance, then by how soon each listing expires. Your own listings aren’t shown here. Claim one to reveal the pickup address and the poster’s phone number."
      />
      <ListingList />
    </PageShell>
  );
}
