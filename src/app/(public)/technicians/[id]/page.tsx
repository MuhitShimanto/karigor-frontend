import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechnicianHeader } from '@/features/technicians/technician-header';
import { ReviewList } from '@/features/technicians/review-list';
import { BookNowPanel } from '@/features/technicians/book-now-panel';
import { serverRequest } from '@/lib/api/server';
import { TechnicianProfile } from '@/types/domain';

interface TechnicianPageProps {
  params: Promise<{ id: string }>;
}

async function getTechnician(id: string): Promise<TechnicianProfile | null> {
  try {
    const res = await serverRequest<TechnicianProfile>(`/technicians/${id}`);
    return res.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: TechnicianPageProps): Promise<Metadata> {
  const { id } = await params;
  const tech = await getTechnician(id);

  if (!tech) {
    return {
      title: 'Technician Not Found | Karigor',
    };
  }

  return {
    title: `${tech.user?.name || 'Technician'} Profile | Karigor`,
    description:
      tech.bio ||
      `Book ${tech.user?.name} for home repair and maintenance in ${tech.location}.`,
  };
}

export default async function TechnicianDetailPage({
  params,
}: TechnicianPageProps) {
  const { id } = await params;
  const tech = await getTechnician(id);

  if (!tech) {
    notFound();
  }

  const services = tech.services || [];
  const reviews = tech.reviews || [];

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Main Profile Header */}
      <TechnicianHeader tech={tech} />

      {/* Two Column Layout: Main Details + Sticky Book Now Panel */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Bio, Skills, Services Catalog, Reviews */}
        <div className="space-y-8 lg:col-span-2">
          {/* About / Bio */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">
                About the Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tech.bio ||
                  'Dedicated home repair and installation specialist with verified credentials. Committed to punctual arrivals, clean work environments, and long-lasting repair quality.'}
              </p>

              {/* Skills Tags */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <span className="text-foreground block text-xs font-semibold tracking-wider uppercase">
                  Core Skills & Expertise
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tech.skills && tech.skills.length > 0 ? (
                    tech.skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="border-primary/20 bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium"
                      >
                        <CheckCircle2 className="text-primary mr-1 h-3 w-3" />
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">General Home Maintenance</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services & Pricing Offered */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Tag className="text-primary h-5 w-5" />
                Services Offered ({services.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="bg-muted/20 hover:border-primary/40 space-y-2 rounded-xl border p-4 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-foreground text-sm leading-snug font-bold">
                          {srv.title}
                        </h4>
                        <span className="text-primary shrink-0 text-sm font-extrabold">
                          ৳{Number(srv.price).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {srv.description ||
                          'Full inspection, labour and standard service included.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Hourly rate service starting from ৳
                  {Number(tech.hourlyRate || 500).toLocaleString()}/hr.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reviews List */}
          <ReviewList
            reviews={reviews}
            avgRating={tech.avgRating}
            reviewCount={tech.reviewCount}
          />
        </div>

        {/* Right Column: Sticky Book Now Panel */}
        <div id="book-section" className="space-y-6 lg:col-span-1">
          <BookNowPanel
            tech={tech}
            services={services}
            slots={tech.slots || []}
          />

          {/* Service Guarantee Card */}
          <Card className="bg-muted/20 border">
            <CardContent className="space-y-3 p-5">
              <div className="text-foreground flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Karigor Guarantee</span>
              </div>
              <ul className="text-muted-foreground list-inside list-disc space-y-1.5 text-xs">
                <li>100% verified technician identity</li>
                <li>Fixed pricing with no hidden charges</li>
                <li>Secure payment via Stripe Checkout</li>
                <li>Free cancellation before work starts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
