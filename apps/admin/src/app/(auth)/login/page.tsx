import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { Card } from '@repo/ui/card';
import { ThemeToggle } from '@repo/ui/theme-toggle';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex justify-end p-4 sm:p-6">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-3 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">FoodBridge Admin</h1>
              <p className="text-sm text-muted-foreground">
                Account moderation and platform health.
              </p>
            </div>
          </div>

          <Card className="p-6">
            <LoginForm />
          </Card>
        </div>
      </main>
    </div>
  );
}
