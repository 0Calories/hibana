'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { signup } from '../actions';

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(32, { message: 'Password cannot be longer than 32 characters' })
  .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Must contain at least one number' })
  .regex(/[!@#$%^&*.]/, {
    message: 'Must contain at least one special character',
  });

const signupFormSchema = z
  .object({
    email: z.email({ message: 'Please enter a valid email address' }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Error appears on confirmPassword field
  });

export function SignupForm() {
  const [signupFailed, setSignupFailed] = useState(false);
  const form = useForm({
    resolver: zodResolver(signupFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: z.infer<typeof signupFormSchema>) {
    const toastId = toast.loading('Signing up...', { position: 'top-center' });

    try {
      const result = await signup(data.email, data.password);

      if (result?.error) {
        setSignupFailed(true);
        toast.error(
          `Signup failed: ${result.error.message || 'unknown error'}`,
          {
            id: toastId,
            position: 'top-center',
          },
        );

        return;
      }

      toast.success('Welcome to Hibana!', {
        id: toastId,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        toast.success('Welcome to Hibana!', {
          id: toastId,
        });
        throw error;
      }

      toast.error('Something went wrong. Please try again.', {
        id: toastId,
        position: 'top-center',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to get started
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-signup" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || signupFailed}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid || signupFailed}
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                  {(fieldState.invalid || signupFailed) && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    type="password"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    type="password"
                    required
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <FieldGroup>
              <Field>
                <Button type="submit" form="form-signup">
                  Create Account
                </Button>
              </Field>

              <div className="flex items-center">
                <Separator className="flex-1" />
                <span className="shrink-0 px-2 text-xs text-muted-foreground">
                  Or continue with
                </span>
                <Separator className="flex-1" />
              </div>

              <Field>
                <Button variant="outline" type="button">
                  Google
                </Button>
                <Button variant="outline" type="button">
                  Discord
                </Button>
              </Field>

              <FieldDescription className="px-6 text-center">
                Already have an account? <a href="/login">Login</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
