import Link from 'next/link';
import { FileQuestion, Home, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm">
        <FileQuestion className="h-8 w-8" />
      </div>

      <span className="text-sm font-semibold tracking-widest text-amber-600 uppercase dark:text-amber-400">
        404 Not Found
      </span>
      <h1 className="text-foreground mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Page does not exist
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm">
        Sorry, we couldn’t find the page you are looking for. It may have been
        moved or removed.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants({ className: 'gap-2' })}>
          <Home className="h-4 w-4" /> Go to Homepage
        </Link>
        <Link
          href="/services"
          className={buttonVariants({ variant: 'outline', className: 'gap-2' })}
        >
          Browse Services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
