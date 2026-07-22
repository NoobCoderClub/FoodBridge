'use client';

import { useEffect, useState } from 'react';

function formatRemaining(deadline: string): string {
  const remainingMs = new Date(deadline).getTime() - Date.now();
  if (remainingMs <= 0) return 'Expired';
  const minutes = Math.floor(remainingMs / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function CountdownTimer({ deadline }: { deadline: string }) {
  // Avoid hydration mismatches: render a static placeholder on the server,
  // compute the real remaining time only after mount (setInterval's first
  // tick, not a synchronous setState in the effect body).
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(formatRemaining(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span className="font-mono text-sm">{remaining ?? 'Loading...'}</span>;
}
