'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserCheck, Wrench, Loader2 } from 'lucide-react';

import { registerSchema, RegisterFormValues } from './schemas';
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

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<
    'CUSTOMER' | 'TECHNICIAN'
  >('CUSTOMER');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRoleChange = (role: 'CUSTOMER' | 'TECHNICIAN') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          phone: data.phone || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errorDetails && Array.isArray(json.errorDetails)) {
          for (const err of json.errorDetails) {
            const field = err.field?.replace(
              /^body\./,
              ''
            ) as keyof RegisterFormValues;
            if (field) {
              setError(field, { message: err.message });
            }
          }
        }
        toast.error(
          json.message || 'Registration failed. Please check the form.'
        );
        return;
      }

      const user = json.data?.user as SafeUser;
      setUser(user);
      toast.success(`Account created successfully! Welcome to Karigor.`);

      if (user.role === 'TECHNICIAN') {
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

  return (
    <Card className="border-border w-full shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Choose your role and enter your details to get started
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Role Selection Cards */}
          <div className="space-y-1.5">
            <Label>Select Account Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('CUSTOMER')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  selectedRole === 'CUSTOMER'
                    ? 'text-foreground border-amber-500 bg-amber-50/50 font-semibold ring-2 ring-amber-500/20 dark:bg-amber-950/20'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <UserCheck
                  className={`mb-1.5 h-5 w-5 ${selectedRole === 'CUSTOMER' ? 'text-amber-500' : ''}`}
                />
                <span className="text-xs font-medium">Customer</span>
                <span className="text-muted-foreground text-[10px]">
                  Book Services
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('TECHNICIAN')}
                className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  selectedRole === 'TECHNICIAN'
                    ? 'text-foreground border-amber-500 bg-amber-50/50 font-semibold ring-2 ring-amber-500/20 dark:bg-amber-950/20'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Wrench
                  className={`mb-1.5 h-5 w-5 ${selectedRole === 'TECHNICIAN' ? 'text-amber-500' : ''}`}
                />
                <span className="text-xs font-medium">Technician</span>
                <span className="text-muted-foreground text-[10px]">
                  Provide Services
                </span>
              </button>
            </div>
            {errors.role && (
              <p className="text-destructive mt-1 text-xs font-medium">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Rahim Ahmed"
              {...register('name')}
              className={
                errors.name
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.name && (
              <p className="text-destructive text-xs font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

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

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+880 1700-000000"
              {...register('phone')}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              {...register('confirmPassword')}
              className={
                errors.confirmPassword
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-xs font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
