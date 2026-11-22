'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LogIn, Loader2, KeyRound } from 'lucide-react';

import { loginSchema, LoginFormValues } from './schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { SafeUser } from '@/types/auth';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const expired = searchParams.get('expired');
  const setUser = useAuthStore((state) => state.setUser);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (expired) {
      toast.warning('Your session has expired. Please sign in again.');
    }
  }, [expired]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errorDetails && Array.isArray(json.errorDetails)) {
          for (const err of json.errorDetails) {
            const field = err.field?.replace(
              /^body\./,
              ''
            ) as keyof LoginFormValues;
            if (field) {
              setError(field, { message: err.message });
            }
          }
        }
        toast.error(json.message || 'Invalid email or password.');
        return;
      }

      const user = json.data?.user as SafeUser;
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);

      // Determine redirect destination
      if (nextUrl && nextUrl.startsWith('/')) {
        router.push(nextUrl);
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (user.role === 'TECHNICIAN') {
        router.push('/dashboard/technician');
      } else {
        router.push('/dashboard/customer');
      }
    } catch {
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <Card className="border-border w-full shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={
                errors.email
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.email && (
              <p className="text-destructive text-xs font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className={
                errors.password
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.password && (
              <p className="text-destructive text-xs font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Quick Demo Credentials */}
          <div className="bg-muted/30 space-y-2 rounded-lg border p-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
              <KeyRound className="text-primary h-3.5 w-3.5" />
              <span>Demo Test Accounts:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  fillCredentials('admin@karigor.com', 'Admin@12345')
                }
                className="bg-background hover:bg-accent rounded border px-2 py-1 text-[11px] font-medium transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() =>
                  fillCredentials('customer@karigor.com', 'Password@123')
                }
                className="bg-background hover:bg-accent rounded border px-2 py-1 text-[11px] font-medium transition-colors"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() =>
                  fillCredentials('tech1@karigor.com', 'Password@123')
                }
                className="bg-background hover:bg-accent rounded border px-2 py-1 text-[11px] font-medium transition-colors"
              >
                Technician
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            className="w-full shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
