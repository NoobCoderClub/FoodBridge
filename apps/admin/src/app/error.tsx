'use client';

import { ErrorState } from '@repo/ui/error-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong"
          description={error.message || 'An unexpected error occurred. Try again in a moment.'}
          onRetry={reset}
        />
      </div>
    </main>
  );
}
