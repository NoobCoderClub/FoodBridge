import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Join FoodBridge</h1>
        <p className="text-sm text-muted-foreground">
          Bridge the gap between surplus food and the people who need it.
        </p>
      </div>

      <RegisterForm />

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
