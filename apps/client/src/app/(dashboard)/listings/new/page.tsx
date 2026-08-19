'use client';

import { PageHeader, PageShell } from '@repo/ui/page-header';
import { ListingForm } from '@/features/listings/components/listing-form';

export default function NewListingPage() {
  return (
    <PageShell width="narrow" className="space-y-8">
      <PageHeader
        title="Post surplus food"
        description="Others nearby will see this straight away. The exact address stays private until someone claims it."
      />
      <ListingForm />
    </PageShell>
  );
}
