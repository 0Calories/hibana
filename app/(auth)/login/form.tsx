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
import { login } from '../actions';

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.email({ message: t('emailInvalid') }),
    password: z.string().min(1, { message: t('passwordRequired') }),
  });
}

export function LoginForm() {
  const [loginFailed, setLoginFailed] = useState(false);
  const t = useTranslations('auth.login');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const loginFormSchema = useMemo(
    () => createLoginSchema(tValidation as unknown as (key: string) => string),
    [tValidation],
  );

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof loginFormSchema>) {
    const toastId = toast.loading(t('loading'), { position: 'top-center' });

    try {
      const result = await login(data.email, data.password);

      if (result?.error) {
        setLoginFailed(true);
        toast.error(
          t('error', { error: result.error.message || 'unknown error' }),
          {
            id: toastId,
            position: 'top-center',
          },
        );

        return;
      }

      toast.success(t('success'), { id: toastId, position: 'top-center' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        toast.success(t('success'), { id: toastId, position: 'top-center' });
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
        <form id="form-login" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || loginFailed}>
                  <FieldLabel htmlFor={field.name}>
                    {tCommon('email')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid || loginFailed}
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
                <Field data-invalid={fieldState.invalid || loginFailed}>
                  <FieldLabel htmlFor={field.name}>
                    {tCommon('password')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid || loginFailed}
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
                {t('noAccount')} <a href="/signup">{t('signUpLink')}</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
