import { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = {
  title: 'Register | Karigor',
  description: 'Create a Customer or Technician account on Karigor platform.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
