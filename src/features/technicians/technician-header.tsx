import Image from 'next/image';
import { Star, MapPin, Award, CheckCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TechnicianProfile } from '@/types/domain';

export function TechnicianHeader({ tech }: { tech: TechnicianProfile }) {
  const avatarUrl =
    tech.avatarUrl ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      tech.user?.name || 'Karigor Pro'
    )}`;

  const hourlyRate =
    typeof tech.hourlyRate === 'number'
      ? tech.hourlyRate
      : parseFloat(String(tech.hourlyRate)) || 0;

  return (
    <div className="bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="bg-muted border-primary/40 relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 shadow-md sm:h-28 sm:w-28">
          <Image
            src={avatarUrl}
            alt={tech.user?.name || 'Technician'}
            fill
            sizes="112px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              {tech.user?.name || 'Technician'}
            </h1>
            <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600 hover:bg-emerald-500/20">
              <CheckCircle className="h-3 w-3" /> Verified Pro
            </Badge>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="text-primary h-4 w-4" />
              <span>{tech.location || 'Dhaka, Bangladesh'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="text-primary h-4 w-4" />
              <span>{tech.experienceYears || 1}+ Years Experience</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{Number(tech.avgRating || 0).toFixed(1)}</span>
              <span className="text-muted-foreground font-normal">
                ({tech.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-muted-foreground text-xs">
              Standard Rate:
            </span>
            <span className="text-foreground text-xl font-bold">
              {hourlyRate > 0 ? `৳${hourlyRate.toLocaleString()}` : 'Custom'}
            </span>
            <span className="text-muted-foreground text-xs">
              / hour or per service
            </span>
          </div>
        </div>

        {/* Guarantee Badge */}
        <div className="text-muted-foreground hidden flex-col items-end gap-1 border-l pl-6 text-right text-xs lg:flex">
          <div className="text-primary flex items-center gap-1.5 font-semibold">
            <Shield className="h-4 w-4" />
            <span>Karigor Protection</span>
          </div>
          <p className="max-w-[160px] text-[11px] leading-tight">
            Safe payments via Stripe Checkout & satisfaction guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
}
