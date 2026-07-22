import { authClient } from '@/lib/auth';
import type { LoginInput, SignupInput } from '../schema/auth.schema';

export async function login(input: LoginInput) {
  const { data, error } = await authClient.signIn.email(input);
  if (error) throw new Error(error.message ?? 'Login failed');
  return data;
}

export async function signup(input: SignupInput) {
  const { data, error } = await authClient.signUp.email(input);
  if (error) throw new Error(error.message ?? 'Signup failed');
  return data;
}

export async function getCurrentUser() {
  const { data } = await authClient.getSession();
  return data?.user ?? null;
}

export async function logout() {
  await authClient.signOut();
}
