'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { login } from '../actions';

const loginFormSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Please enter your password' }),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof loginFormSchema>) {
    const toastId = toast.loading('Logging in...');

    try {
      const result = await login(data.email, data.password);

      if (result?.error) {
        toast.error(
          result.error.message || 'Something went wrong. Please try again.',
          {
            id: toastId,
          },
        );
        return;
      }

      toast.success('Welcome back!', { id: toastId });
    } catch (error) {
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        toast.success('Welcome back!', { id: toastId });
        throw error;
      }

      toast.error('Something went wrong. Please try again.', {
        id: toastId,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back!</CardTitle>
        <CardDescription>Enter your credentials to log in</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-login" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="name@example.com"
                    type="email"
                    required
                  />
                  {fieldState.invalid && (
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

            <FieldGroup>
              <Field>
                <Button type="submit" form="form-login">
                  Log In
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
                Don't have an account? <a href="/signup">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
