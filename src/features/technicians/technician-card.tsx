import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { TechnicianProfile } from '@/types/domain';

export function TechnicianCard({ tech }: { tech: TechnicianProfile }) {
  const hourlyRate =
    typeof tech.hourlyRate === 'number'
      ? tech.hourlyRate
      : parseFloat(String(tech.hourlyRate)) || 0;

  const avatarUrl =
    tech.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      tech.user?.name || 'Karigor Pro'
    )}`;

  return (
    <Card className="group border-border/80 bg-card hover:border-foreground/30 hover:shadow-primary/5 dark:border-border/60 dark:hover:border-foreground/40 relative flex flex-col justify-between overflow-hidden rounded-xl border p-0 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="border-border/80 bg-muted relative h-14 w-14 overflow-hidden rounded-full border-2 shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Image
                src={avatarUrl}
                alt={tech.user?.name || 'Technician'}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </div>
            <span
              className="border-background absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 bg-emerald-500"
              title="Verified Karigor Pro"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-foreground group-hover:text-primary truncate text-base font-bold tracking-tight transition-colors">
                {tech.user?.name || 'Technician'}
              </h3>
              <span title="Verified Technician">
                <ShieldCheck className="text-primary h-4 w-4 shrink-0" />
              </span>
            </div>

            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <MapPin className="text-muted-foreground h-3 w-3 shrink-0" />
              <span className="truncate">
                {tech.location || 'Dhaka, Bangladesh'}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <div className="border-border/70 bg-muted/40 text-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{Number(tech.avgRating || 0).toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground text-[11px]">
                ({tech.reviewCount || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-5 pt-1">
        {tech.bio && (
          <p className="text-muted-foreground/90 line-clamp-2 min-h-[32px] text-xs leading-relaxed">
            {tech.bio}
          </p>
        )}

        {/* Skills Pills */}
        <div className="flex min-h-[24px] flex-wrap gap-1">
          {tech.skills && tech.skills.length > 0 ? (
            tech.skills.slice(0, 3).map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="border-border/70 bg-muted/40 text-foreground group-hover:border-foreground/20 px-2 py-0 text-[10px] font-medium transition-colors"
              >
                {skill}
              </Badge>
            ))
          ) : (
            <Badge
              variant="outline"
              className="border-border/70 bg-muted/40 text-foreground px-2 py-0 text-[10px] font-medium"
            >
              General Maintenance
            </Badge>
          )}
          {tech.skills && tech.skills.length > 3 && (
            <span className="text-muted-foreground self-center text-[10px] font-medium">
              +{tech.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Experience & Price Bar */}
        <div className="border-border/60 flex items-center justify-between border-t pt-3 text-xs">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Award className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-foreground font-medium">
              {tech.experienceYears || 1}+ yrs exp
            </span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block text-[10px] font-medium tracking-wider uppercase">
              Rate
            </span>
            <span className="font-heading text-foreground font-bold">
              {hourlyRate > 0
                ? `৳${hourlyRate.toLocaleString()}/hr`
                : 'Negotiable'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-border/60 bg-muted/15 border-t px-5 py-4">
        <Link
          href={`/technicians/${tech.id}`}
          className={buttonVariants({
            size: 'default',
            variant: 'default',
            className:
              'group/btn hover:bg-primary/90 w-full justify-between font-semibold shadow-xs transition-all hover:shadow-md',
          })}
        >
          <span>View Profile & Book</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
