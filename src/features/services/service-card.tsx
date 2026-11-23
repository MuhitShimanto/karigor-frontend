import Link from 'next/link';
import { Wrench, MapPin, Tag, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Service } from '@/types/domain';

export function ServiceCard({ service }: { service: Service }) {
  const price =
    typeof service.price === 'number'
      ? service.price
      : parseFloat(String(service.price)) || 0;

  return (
    <Card className="group border-border/80 bg-card hover:border-foreground/30 hover:shadow-primary/5 dark:border-border/60 dark:hover:border-foreground/40 relative flex flex-col justify-between overflow-hidden rounded-xl border p-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className="border-border/80 bg-muted/40 text-foreground group-hover:border-foreground/30 text-[11px] font-medium tracking-tight transition-colors"
          >
            <Tag className="text-muted-foreground mr-1 h-3 w-3" />
            {service.category?.name || 'General Service'}
          </Badge>
          <div className="border-border/60 bg-muted/20 rounded-lg border px-2.5 py-1 text-right">
            <span className="text-muted-foreground block text-[10px] font-medium tracking-wider uppercase">
              Starting at
            </span>
            <span className="font-heading text-foreground text-base font-bold">
              ৳{price.toLocaleString()}
            </span>
          </div>
        </div>

        <h3 className="text-foreground group-hover:text-primary mt-3 line-clamp-1 text-base font-bold tracking-tight transition-colors">
          {service.title}
        </h3>
      </CardHeader>

      <CardContent className="p-5 pt-0 pb-4">
        <p className="text-muted-foreground/90 line-clamp-2 min-h-[34px] text-xs leading-relaxed">
          {service.description ||
            'Professional home service delivered with verified safety and quality standards.'}
        </p>

        {service.technician && (
          <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="border-border/60 bg-muted text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full border">
                <Wrench className="h-3 w-3" />
              </div>
              <span className="text-foreground truncate font-medium">
                {service.technician.user?.name || 'Verified Pro'}
              </span>
            </div>
            {service.technician.location && (
              <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-[11px]">
                <MapPin className="h-3 w-3" />
                <span>{service.technician.location}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-border/60 bg-muted/15 border-t px-5 py-4">
        <Link
          href={
            service.technicianId
              ? `/technicians/${service.technicianId}`
              : '/services'
          }
          className={buttonVariants({
            size: 'default',
            variant: 'default',
            className:
              'group/btn hover:bg-primary/90 w-full justify-between font-semibold shadow-xs transition-all hover:shadow-md',
          })}
        >
          <span>Book This Service</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
