import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/login-form';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Sign In | Karigor',
  description:
    'Sign in to access your Karigor customer, technician, or admin dashboard.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-card w-full max-w-md space-y-4 rounded-xl border p-8">
          <Skeleton className="mx-auto h-8 w-3/4" />
          <Skeleton className="mx-auto h-4 w-1/2" />
          <Skeleton className="mt-6 h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
