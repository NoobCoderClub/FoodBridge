import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Join FoodBridge</h1>
      <RegisterForm />
      <p className="text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
