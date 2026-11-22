import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 sm:p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight">
              Karigor
            </span>
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Auth Card Container */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="text-muted-foreground bg-background/50 border-t p-4 text-center text-xs">
        © 2026 Karigor Home Services Platform. Secure & Verified.
      </footer>
    </div>
  );
}
