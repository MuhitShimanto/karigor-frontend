import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSession();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="bg-background flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar user={user} />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
