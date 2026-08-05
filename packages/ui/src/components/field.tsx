'use client';

import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';

import { cn } from '../lib/utils';

/**
 * Forms previously collapsed all of Zod's issues into a single string
 * (`parsed.error.issues[0]`), so a user fixing one field never learned about
 * the second problem. Base UI's Form accepts an `errors` record keyed by field
 * name and routes each message to the matching Field.Error — per-field
 * validation without pulling in react-hook-form.
 */
const FormRoot = Form;

function FormField({
  name,
  label,
  description,
  children,
  className,
  ...props
}: Omit<Field.Root.Props, 'children'> & {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Field.Root name={name} className={cn('flex flex-col gap-2', className)} {...props}>
      {label ? (
        <Field.Label className="text-sm leading-none font-medium select-none">{label}</Field.Label>
      ) : null}
      {children}
      {description ? (
        <Field.Description className="text-xs text-muted-foreground">
          {description}
        </Field.Description>
      ) : null}
      <Field.Error className="text-sm text-destructive" />
    </Field.Root>
  );
}

const FieldControl = Field.Control;
const FieldError = Field.Error;
const FieldLabel = Field.Label;
const FieldDescription = Field.Description;

export { FormRoot as Form, FormField, FieldControl, FieldError, FieldLabel, FieldDescription };
