import Link from 'next/link';
import { ArrowRight, Shield, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ServiceCard } from '@/features/services/service-card';
import { TechnicianCard } from '@/features/technicians/technician-card';
import { serverRequest } from '@/lib/api/server';
import { Service, TechnicianProfile } from '@/types/domain';

async function getFeaturedData() {
  try {
    const [servicesRes, techsRes] = await Promise.all([
      serverRequest<Service[]>('/services?limit=6'),
      serverRequest<TechnicianProfile[]>(
        '/technicians?sortBy=rating&order=desc&limit=4'
      ),
    ]);
    return {
      services: servicesRes.data || [],
      technicians: techsRes.data || [],
    };
  } catch {
    return {
      services: [],
      technicians: [],
    };
  }
}

// Fallback high-quality showcase data if live backend has not yet seeded services
const FALLBACK_SERVICES: Service[] = [
  {
    id: 'sample-1',
    title: 'Emergency Electrical Wiring & Circuit Fix',
    description:
      'Diagnose short circuits, replace breaker switches, and install safe home power lines.',
    price: 800,
    technicianId: 'tech-1',
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Electrical', isActive: true },
    technician: {
      id: 'tech-1',
      userId: 'u-1',
      user: { id: 'u-1', name: 'Shafiqul Islam', email: 'shafiq@karigor.com' },
      skills: ['Wiring', 'Circuit Breakers', 'Load Balancing'],
      experienceYears: 8,
      location: 'Dhanmondi, Dhaka',
      hourlyRate: 500,
      avgRating: 4.9,
      reviewCount: 38,
    },
  },
  {
    id: 'sample-2',
    title: 'Complete Sanitary & Pipe Leak Repair',
    description:
      'Fix pipeline blockages, bathroom fittings, kitchen sinks, and water motor leakages.',
    price: 700,
    technicianId: 'tech-2',
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Plumbing', isActive: true },
    technician: {
      id: 'tech-2',
      userId: 'u-2',
      user: { id: 'u-2', name: 'Kamal Hossain', email: 'kamal@karigor.com' },
      skills: ['Pipe Fitting', 'Leak Detection', 'Sanitary'],
      experienceYears: 6,
      location: 'Mirpur, Dhaka',
      hourlyRate: 450,
      avgRating: 4.8,
      reviewCount: 29,
    },
  },
  {
    id: 'sample-3',
    title: 'Split AC Master Servicing & Gas Refill',
    description:
      'Indoor and outdoor deep jet cleaning, cooling coil check, and R410A gas top-up.',
    price: 1500,
    technicianId: 'tech-3',
    categoryId: 'cat-3',
    category: { id: 'cat-3', name: 'AC Servicing', isActive: true },
    technician: {
      id: 'tech-3',
      userId: 'u-3',
      user: { id: 'u-3', name: 'Tanvir Ahmed', email: 'tanvir@karigor.com' },
      skills: ['AC Jet Wash', 'Gas Charging', 'Compressor'],
      experienceYears: 7,
      location: 'Gulshan, Dhaka',
      hourlyRate: 700,
      avgRating: 5.0,
      reviewCount: 44,
    },
  },
];

const FALLBACK_TECHS: TechnicianProfile[] = [
  {
    id: 'tech-1',
    userId: 'u-1',
    user: { id: 'u-1', name: 'Shafiqul Islam', email: 'shafiq@karigor.com' },
    bio: 'Certified Master Electrician with 8+ years experience in commercial and residential electrical installations.',
    skills: ['Wiring', 'Circuit Breakers', 'Appliance Repair', 'Solar'],
    experienceYears: 8,
    location: 'Dhanmondi, Dhaka',
    hourlyRate: 500,
    avgRating: 4.9,
    reviewCount: 38,
  },
  {
    id: 'tech-2',
    userId: 'u-2',
    user: { id: 'u-2', name: 'Kamal Hossain', email: 'kamal@karigor.com' },
    bio: 'Professional plumber specializing in modern sanitary fixtures, pipeline troubleshooting, and water pumps.',
    skills: ['Pipe Repair', 'Bathroom Fittings', 'Water Pumps'],
    experienceYears: 6,
    location: 'Mirpur, Dhaka',
    hourlyRate: 450,
    avgRating: 4.8,
    reviewCount: 29,
  },
  {
    id: 'tech-3',
    userId: 'u-3',
    user: { id: 'u-3', name: 'Tanvir Ahmed', email: 'tanvir@karigor.com' },
    bio: 'HVAC specialist offering top-tier cooling system diagnostics, split AC installation, and duct cleaning.',
    skills: ['AC Repair', 'Gas Charging', 'HVAC Installation'],
    experienceYears: 7,
    location: 'Gulshan, Dhaka',
    hourlyRate: 700,
    avgRating: 5.0,
    reviewCount: 44,
  },
  {
    id: 'tech-4',
    userId: 'u-4',
    user: { id: 'u-4', name: 'Nazmul Haque', email: 'nazmul@karigor.com' },
    bio: 'Expert carpenter skilled in custom furniture repairs, wooden door fittings, and interior restoration.',
    skills: ['Woodwork', 'Door Locks', 'Furniture Assembly'],
    experienceYears: 10,
    location: 'Uttara, Dhaka',
    hourlyRate: 550,
    avgRating: 4.7,
    reviewCount: 25,
  },
];

export default async function HomePage() {
  const data = await getFeaturedData();
  const services = data.services.length > 0 ? data.services : FALLBACK_SERVICES;
  const technicians =
    data.technicians.length > 0 ? data.technicians : FALLBACK_TECHS;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="via-background to-background from-primary/10 relative overflow-hidden bg-gradient-to-b py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="font-clash bg-background text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Your Trusted Home Service Marketplace</span>
            </div>

            <h1 className="font-clash text-foreground text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Professional Home Services at{' '}
              <span className="text-primary">Your Doorstep</span>
            </h1>

            <p className="text-muted-foreground mt-6 text-base leading-relaxed sm:text-lg">
              Book certified electricians, plumbers, AC technicians, and
              carpenters in minutes. Transparent pricing, verified background
              checks, and guaranteed satisfaction.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/services"
                className={buttonVariants({
                  size: 'lg',
                  className: 'w-full gap-2 shadow-md sm:w-auto',
                })}
              >
                Browse Services <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'w-full font-medium sm:w-auto',
                })}
              >
                Join as a Technician
              </Link>
            </div>

            {/* Quick stats row */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t pt-8 text-center">
              <div>
                <p className="font-clash text-foreground text-2xl font-bold sm:text-3xl">
                  500+
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Verified Technicians
                </p>
              </div>
              <div>
                <p className="font-clash text-foreground text-2xl font-bold sm:text-3xl">
                  15,000+
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Jobs Completed
                </p>
              </div>
              <div>
                <p className="font-clash text-foreground text-2xl font-bold sm:text-3xl">
                  4.8 / 5
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Average Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                Popular Requests
              </span>
              <h2 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Featured Services
              </h2>
            </div>
            <Link
              href="/services"
              className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline"
            >
              View all services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Technicians Grid */}
      <section className="bg-muted/20 border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                Verified Experts
              </span>
              <h2 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Top Rated Technicians
              </h2>
            </div>
            <Link
              href="/services?sort=rating"
              className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline"
            >
              Browse all professionals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {technicians.slice(0, 4).map((tech) => (
              <TechnicianCard key={tech.id} tech={tech} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="bg-background border-t py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why Choose Karigor?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              We make home repairs and maintenance reliable, transparent, and
              hassle-free.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Verified Experts</h3>
              <p className="text-muted-foreground text-sm">
                Every technician undergoes identity and skills validation before
                handling jobs.
              </p>
            </div>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Exact Time Slots</h3>
              <p className="text-muted-foreground text-sm">
                No all-day waiting windows. Pick the exact slot that suits your
                schedule.
              </p>
            </div>

            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Secure Online Payment
              </h3>
              <p className="text-muted-foreground text-sm">
                Pay safely through Stripe Checkout only after the technician
                confirms your booking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
