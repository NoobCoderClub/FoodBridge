import type { ZodError } from 'zod';

/**
 * Base UI's <Form errors={...}> takes a record keyed by field name. Forms used
 * to render only `issues[0]`, so a user fixing one field never learned about
 * the second problem; this surfaces every field at once.
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
