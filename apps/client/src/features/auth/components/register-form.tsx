'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Form, FormField } from '@repo/ui/field';
import { InlineError } from '@repo/ui/error-state';
import { useRegister } from '../hooks/use-register';
import { signupSchema } from '../schema/auth.schema';
import { zodFieldErrors } from '@/lib/form';

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    register.mutate(parsed.data, {
      onSuccess: () => router.push('/listings'),
      onError: (err) => setFormError(err.message),
    });
  }

  return (
    <Form errors={errors} onSubmit={handleSubmit} className="space-y-5">
      <FormField name="name" label="Name">
        <Input
          autoComplete="organization"
          placeholder="Your name or organisation"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>

      <FormField name="email" label="Email">
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@organisation.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>

      <FormField name="password" label="Password" description="At least 8 characters.">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            className="pr-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>

      {formError ? <InlineError>{formError}</InlineError> : null}

      <Button type="submit" size="lg" block loading={register.isPending}>
        Create account
      </Button>

      <p className="text-xs text-muted-foreground">
        One account does both — share surplus food and claim what others post. New accounts are
        reviewed by an admin before you can do either.
      </p>
    </Form>
  );
}
