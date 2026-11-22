import Link from 'next/link';
import { Wrench, MapPin, Tag } from 'lucide-react';
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
    <Card className="flex flex-col justify-between overflow-hidden border transition-all hover:border-amber-500/40 hover:shadow-md">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className="border-amber-500/30 text-[11px] font-medium text-amber-600 dark:text-amber-400"
          >
            <Tag className="mr-1 h-3 w-3" />
            {service.category?.name || 'General Service'}
          </Badge>
          <div className="text-right">
            <span className="text-muted-foreground block text-xs">
              Starting at
            </span>
            <span className="text-foreground text-lg font-bold">
              ৳{price.toLocaleString()}
            </span>
          </div>
        </div>

        <h3 className="text-foreground mt-2 line-clamp-1 text-base leading-tight font-semibold">
          {service.title}
        </h3>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <p className="text-muted-foreground line-clamp-2 min-h-[32px] text-xs">
          {service.description ||
            'Professional home service provided by verified technicians.'}
        </p>

        {service.technician && (
          <div className="text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Wrench className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="truncate">
                {service.technician.user?.name || 'Verified Pro'}
              </span>
            </div>
            {service.technician.location && (
              <div className="text-muted-foreground flex shrink-0 items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="text-[11px]">
                  {service.technician.location}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link
          href={
            service.technicianId
              ? `/technicians/${service.technicianId}`
              : '/services'
          }
          className={buttonVariants({
            size: 'sm',
            variant: 'outline',
            className:
              'w-full transition-colors hover:bg-amber-500 hover:text-white',
          })}
        >
          Book This Service
        </Link>
      </CardFooter>
    </Card>
  );
}
