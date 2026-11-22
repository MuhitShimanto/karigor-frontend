import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Award, ArrowRight } from 'lucide-react';
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
    <Card className="hover:border-primary/40 flex flex-col justify-between overflow-hidden border transition-all hover:shadow-lg">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-muted border-primary/30 relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2">
            <Image
              src={avatarUrl}
              alt={tech.user?.name || 'Technician'}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-foreground truncate text-base font-bold">
              {tech.user?.name || 'Technician'}
            </h3>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
              <MapPin className="text-primary h-3 w-3 shrink-0" />
              <span className="truncate">
                {tech.location || 'Dhaka, Bangladesh'}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
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

      <CardContent className="space-y-3 p-5 pt-2">
        {tech.bio && (
          <p className="text-muted-foreground line-clamp-2 min-h-[32px] text-xs">
            {tech.bio}
          </p>
        )}

        {/* Skills Pills */}
        <div className="flex min-h-[24px] flex-wrap gap-1">
          {tech.skills && tech.skills.length > 0 ? (
            tech.skills.slice(0, 3).map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="px-2 py-0 text-[10px]"
              >
                {skill}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="px-2 py-0 text-[10px]">
              General Maintenance
            </Badge>
          )}
          {tech.skills && tech.skills.length > 3 && (
            <span className="text-muted-foreground self-center text-[10px]">
              +{tech.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Experience & Price Bar */}
        <div className="flex items-center justify-between border-t pt-3 text-xs">
          <div className="text-muted-foreground flex items-center gap-1">
            <Award className="text-primary h-3.5 w-3.5" />
            <span>{tech.experienceYears || 1}+ yrs exp</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block text-[10px]">
              Rate
            </span>
            <span className="text-foreground font-bold">
              {hourlyRate > 0
                ? `৳${hourlyRate.toLocaleString()}/hr`
                : 'Negotiable'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link
          href={`/technicians/${tech.id}`}
          className={buttonVariants({
            size: 'sm',
            className: 'w-full gap-1.5 shadow-sm',
          })}
        >
          View Profile & Book <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
