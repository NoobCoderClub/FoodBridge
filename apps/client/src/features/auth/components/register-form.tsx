'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Eye, EyeOff, HandHeart, Store } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Form, FormField } from '@repo/ui/field';
import { InlineError } from '@repo/ui/error-state';
import { cn } from '@repo/ui/lib/utils';
import { useRegister } from '../hooks/use-register';
import { signupSchema } from '../schema/auth.schema';
import { zodFieldErrors } from '@/lib/form';

type SignupRole = 'poster' | 'taker';

const ROLES: {
  value: SignupRole;
  label: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: 'poster',
    label: 'I have food to give',
    blurb: 'Restaurants, cafes, caterers and event organisers with surplus food.',
    icon: Store,
  },
  {
    value: 'taker',
    label: 'I need food',
    blurb: 'NGOs, shelters and individuals who can collect and redistribute it.',
    icon: HandHeart,
  },
];

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignupRole>('taker');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse({ name, email, password, role });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    register.mutate(parsed.data, {
      onSuccess: (data) => {
        router.push(data.user.role === 'poster' ? '/my-listings' : '/listings');
      },
      onError: (err) => setFormError(err.message),
    });
  }

  return (
    <Form errors={errors} onSubmit={handleSubmit} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm leading-none font-medium">I’m signing up because…</legend>
        <div className="grid gap-2">
          {ROLES.map((option) => {
            const selected = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setRole(option.value)}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                  'focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
                  selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border bg-card hover:border-primary/30 hover:bg-accent/40',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <option.icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{option.blurb}</span>
                </span>
                {selected ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

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
        New accounts are reviewed by an admin before you can post or claim food.
      </p>
    </Form>
  );
}
