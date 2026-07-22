import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">FoodBridge Admin</h1>
      <LoginForm />
    </main>
  );
}
