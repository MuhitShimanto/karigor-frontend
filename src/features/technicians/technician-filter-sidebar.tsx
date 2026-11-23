'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award,
  Star,
  Wrench,
  DollarSign,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/domain';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface TechnicianFilterSidebarProps {
  categories: Category[];
}

export function TechnicianFilterSidebar({
  categories,
}: TechnicianFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Initialize state from URL params
  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [location, setLocation] = React.useState(
    searchParams.get('location') || ''
  );
  const [category, setCategory] = React.useState(
    searchParams.get('category') || ''
  );
  const [minRating, setMinRating] = React.useState(
    searchParams.get('minRating') || ''
  );
  const [minPrice, setMinPrice] = React.useState(
    searchParams.get('minPrice') || ''
  );
  const [maxPrice, setMaxPrice] = React.useState(
    searchParams.get('maxPrice') || ''
  );
  const [sortBy, setSortBy] = React.useState(
    searchParams.get('sortBy') || 'rating'
  );
  const [order, setOrder] = React.useState(searchParams.get('order') || 'desc');

  const debouncedSearch = useDebounce(search, 350);
  const debouncedLocation = useDebounce(location, 350);
  const isInitialMount = React.useRef(true);

  // Sync state to URL when filters change
  const applyFilters = React.useCallback(
    (overrides?: Record<string, string>) => {
      const params = new URLSearchParams();

      const current = {
        search: debouncedSearch,
        location: debouncedLocation,
        category,
        minRating,
        minPrice,
        maxPrice,
        sortBy,
        order,
        ...overrides,
      };

      if (current.search) params.set('search', current.search);
      if (current.location) params.set('location', current.location);
      if (current.category) params.set('category', current.category);
      if (current.minRating) params.set('minRating', current.minRating);
      if (current.minPrice) params.set('minPrice', current.minPrice);
      if (current.maxPrice) params.set('maxPrice', current.maxPrice);
      if (current.sortBy) params.set('sortBy', current.sortBy);
      if (current.order) params.set('order', current.order);
      params.set('page', '1'); // Reset to page 1 on filter change

      router.push(`/technicians?${params.toString()}`);
    },
    [
      debouncedSearch,
      debouncedLocation,
      category,
      minRating,
      minPrice,
      maxPrice,
      sortBy,
      order,
      router,
    ]
  );

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    applyFilters();
  }, [
    debouncedSearch,
    debouncedLocation,
    category,
    minRating,
    minPrice,
    maxPrice,
    sortBy,
    order,
    applyFilters,
  ]);

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setMinRating('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('rating');
    setOrder('desc');
    router.push('/technicians');
  };

  const activeCount = [
    Boolean(search),
    Boolean(location),
    Boolean(category),
    Boolean(minRating),
    Boolean(minPrice || maxPrice),
    sortBy !== 'rating' || order !== 'desc',
  ].filter(Boolean).length;

  const filterContent = (
    <div className="space-y-6">
      {/* Header with Title and Reset */}
      <div className="border-border/60 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="text-primary h-4 w-4" />
          <h2 className="text-foreground text-sm font-bold tracking-tight">
            Filter Technicians
          </h2>
          {activeCount > 0 && (
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold"
            >
              {activeCount}
            </Badge>
          )}
        </div>

        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-destructive h-7 gap-1 px-2 text-xs font-medium"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Search Technicians Input */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-semibold tracking-wider uppercase">
          Search Technicians
        </Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="Name, trade, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Location Input */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-semibold tracking-wider uppercase">
          Service Location
        </Label>
        <div className="relative">
          <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="e.g. Dhanmondi, Gulshan, Uttara"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 pl-9 text-sm"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-xs font-semibold tracking-wider uppercase">
          Rank By
        </Label>
        <select
          value={`${sortBy}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split('-');
            setSortBy(s);
            setOrder(o);
          }}
          className="border-input bg-background focus:ring-ring h-10 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus:ring-1 focus:outline-none"
        >
          <option value="rating-desc">Top Rated First (★)</option>
          <option value="experience-desc">Most Experienced</option>
          <option value="price-asc">Rate: Low to High</option>
          <option value="price-desc">Rate: High to Low</option>
        </select>
      </div>

      {/* Trade / Specialization List */}
      <div className="border-border/60 space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
            <Award className="text-muted-foreground h-3.5 w-3.5" />
            Specialization
          </Label>
          {category && (
            <button
              type="button"
              onClick={() => setCategory('')}
              className="text-primary text-[11px] font-medium hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors',
              category === ''
                ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>All Specialties</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(category === cat.id ? '' : cat.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors',
                category === cat.id
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="border-border/60 space-y-2 border-t pt-4">
        <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          Minimum Rating
        </Label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { value: '', label: 'All' },
            { value: '3.5', label: '3.5★' },
            { value: '4.0', label: '4.0★' },
            { value: '4.5', label: '4.5★' },
          ].map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setMinRating(minRating === r.value ? '' : r.value)}
              className={cn(
                'rounded-lg border py-1.5 text-center text-xs font-medium transition-colors',
                minRating === r.value
                  ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 font-bold'
                  : 'border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Rate Range */}
      <div className="border-border/60 space-y-2 border-t pt-4">
        <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Hourly Rate (৳/hr)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min ৳/hr"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-xs"
          />
          <span className="text-muted-foreground text-xs font-medium">-</span>
          <Input
            type="number"
            placeholder="Max ৳/hr"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button & Dropdown Drawer */}
      <div className="w-full space-y-3 lg:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="border-border/80 bg-card w-full justify-between font-medium shadow-xs"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary h-4 w-4" />
            <span>Filter Technicians</span>
            {activeCount > 0 && (
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold"
              >
                {activeCount} active
              </Badge>
            )}
          </div>
          {mobileOpen ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </Button>

        {mobileOpen && (
          <div className="border-border/80 bg-card overflow-hidden rounded-xl border p-5 shadow-sm">
            {filterContent}
          </div>
        )}
      </div>

      {/* Desktop Sticky Left Sidebar */}
      <div className="border-border/80 bg-card dark:border-border/60 sticky top-24 hidden overflow-hidden rounded-xl border p-5 shadow-xs lg:block">
        {filterContent}
      </div>
    </>
  );
}
