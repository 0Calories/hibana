'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
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

function createSignupSchema(t: (key: string) => string) {
  const passwordSchema = z
    .string()
    .min(8, { message: t('passwordMinLength') })
    .max(32, { message: t('passwordMaxLength') })
    .regex(/[A-Z]/, { message: t('passwordUppercase') })
    .regex(/[a-z]/, { message: t('passwordLowercase') })
    .regex(/[0-9]/, { message: t('passwordNumber') })
    .regex(/[!@#$%^&*.]/, {
      message: t('passwordSpecialChar'),
    });

  return z
    .object({
      email: z.email({ message: t('emailInvalid') }),
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsNoMatch'),
      path: ['confirmPassword'],
    });
}

export function SignupForm() {
  const [signupFailed, setSignupFailed] = useState(false);
  const t = useTranslations('auth.signup');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const signupFormSchema = useMemo(
    () => createSignupSchema(tValidation as unknown as (key: string) => string),
    [tValidation],
  );

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
    const toastId = toast.loading(t('loading'), { position: 'top-center' });

    try {
      const result = await signup(data.email, data.password);

      if (result?.error) {
        setSignupFailed(true);
        toast.error(
          t('error', { error: result.error.message || 'unknown error' }),
          {
            id: toastId,
            position: 'top-center',
          },
        );

        return;
      }

      toast.success(t('success'), {
        id: toastId,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        toast.success(t('success'), {
          id: toastId,
        });
        throw error;
      }

      toast.error(tCommon('somethingWentWrong'), {
        id: toastId,
        position: 'top-center',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-signup" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || signupFailed}>
                  <FieldLabel htmlFor={field.name}>{tCommon('email')}</FieldLabel>
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
                  <FieldLabel htmlFor={field.name}>{tCommon('password')}</FieldLabel>
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
                  <FieldLabel htmlFor={field.name}>{t('confirmPassword')}</FieldLabel>
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
                  {t('submit')}
                </Button>
              </Field>

              <div className="flex items-center">
                <Separator className="flex-1" />
                <span className="shrink-0 px-2 text-xs text-muted-foreground">
                  {tCommon('orContinueWith')}
                </span>
                <Separator className="flex-1" />
              </div>

              <Field>
                <Button variant="outline" type="button">
                  {tCommon('google')}
                </Button>
                <Button variant="outline" type="button">
                  {tCommon('discord')}
                </Button>
              </Field>

              <FieldDescription className="px-6 text-center">
                {t('hasAccount')} <a href="/login">{t('loginLink')}</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
