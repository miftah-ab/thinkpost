import { requireSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard-shell';
import { ToastProvider } from '@/components/ui/toast';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await requireSession();
  } catch {
    redirect('/');
  }

  return (
    <ToastProvider>
      <DashboardShell
        userName={session.user.firstName || session.user.email}
      >
        {children}
      </DashboardShell>
    </ToastProvider>
  );
}
