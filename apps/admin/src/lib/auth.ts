import { createAuthClient } from 'better-auth/client';
import { inferAdditionalFields } from 'better-auth/client/plugins';

const BEARER_TOKEN_KEY = 'foodbridge_admin_bearer_token';

export function getBearerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(BEARER_TOKEN_KEY);
}

function setBearerToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(BEARER_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(BEARER_TOKEN_KEY);
  }
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string', required: false },
        status: { type: 'string', required: false },
        phone: { type: 'string', required: false },
        verificationInfo: { type: 'string', required: false },
      },
    }),
  ],
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => getBearerToken() ?? '',
    },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get('set-auth-token');
      if (token) setBearerToken(token);
    },
  },
});

export function clearBearerToken() {
  setBearerToken(null);
}
