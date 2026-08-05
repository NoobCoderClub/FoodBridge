import type { ZodError } from 'zod';

/**
 * Base UI's <Form errors={...}> takes a record keyed by field name, so every
 * failing field reports at once instead of only `issues[0]`.
 */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
