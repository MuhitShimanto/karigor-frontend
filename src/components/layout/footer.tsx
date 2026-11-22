'use client';

import Link from 'next/link';
import { Wrench, ShieldCheck, Clock, Award, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/40 text-foreground border-t transition-colors">
      {/* Value Proposition Highlights */}
      <div className="bg-background/50 border-b py-6">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Verified Pros</p>
              <p className="text-muted-foreground text-xs">
                Screened technicians
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">On-Time Slots</p>
              <p className="text-muted-foreground text-xs">
                Pick your exact hour
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Fair Pricing</p>
              <p className="text-muted-foreground text-xs">No hidden charges</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Quality Service</p>
              <p className="text-muted-foreground text-xs">
                100% satisfaction focus
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">Karigor</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Karigor connects homeowners with reliable, skilled local
              technicians across Bangladesh. Seamless online booking,
              transparent pricing, and trusted work.
            </p>
            <p className="text-muted-foreground text-xs">
              Hotline:{' '}
              <span className="text-foreground font-semibold">
                +880 1700-000000
              </span>
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-foreground text-sm font-semibold">Services</h3>
            <ul className="text-muted-foreground mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/services?category=Electrical"
                  className="hover:text-foreground"
                >
                  Electrical & Wiring
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Plumbing"
                  className="hover:text-foreground"
                >
                  Plumbing & Pipe Repair
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=AC"
                  className="hover:text-foreground"
                >
                  AC Servicing & Gas Refill
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Carpentry"
                  className="hover:text-foreground"
                >
                  Carpentry & Woodwork
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Cleaning"
                  className="hover:text-foreground"
                >
                  Home Cleaning & Painting
                </Link>
              </li>
            </ul>
          </div>

          {/* For Technicians */}
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              For Professionals
            </h3>
            <ul className="text-muted-foreground mt-3 space-y-2 text-xs">
              <li>
                <Link href="/auth/register" className="hover:text-foreground">
                  Join as Technician
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/technician"
                  className="hover:text-foreground"
                >
                  Technician Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/technician/availability"
                  className="hover:text-foreground"
                >
                  Availability Calendar
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Browse Active Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Navigation & Roles */}
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              Portals & Access
            </h3>
            <ul className="text-muted-foreground mt-3 space-y-2 text-xs">
              <li>
                <Link href="/auth/login" className="hover:text-foreground">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-foreground">
                  Technician Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-foreground">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Browse Marketplace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-muted-foreground mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>© 2026 Karigor Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 fill-red-500 text-red-500" />{' '}
            for Programming Hero Assignment 5
          </p>
        </div>
      </div>
    </footer>
  );
}
