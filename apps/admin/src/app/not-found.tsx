import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { EmptyState } from '@repo/ui/empty-state';

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <EmptyState
          icon={<Compass aria-hidden="true" />}
          title="Page not found"
          description="That page doesn’t exist in the admin console."
          action={<Button render={<Link href="/accounts" />}>Back to accounts</Button>}
        />
      </div>
    </main>
  );
}
