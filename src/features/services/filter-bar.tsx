'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/domain';
import { useDebounce } from '@/hooks/use-debounce';

interface FilterBarProps {
  categories: Category[];
}

export function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

      router.push(`/services?${params.toString()}`);
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
    router.push('/services');
  };

  const hasActiveFilters = Boolean(
    search ||
    location ||
    category ||
    minRating ||
    minPrice ||
    maxPrice ||
    sortBy !== 'rating'
  );

  return (
    <div className="bg-card space-y-4 rounded-2xl border p-4 shadow-sm sm:p-6">
      {/* Search and Location Top Row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="relative md:col-span-5">
          <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
          <Input
            placeholder="Search service title or technician name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <div className="relative md:col-span-4">
          <Input
            placeholder="Location (e.g. Dhanmondi, Gulshan, Mirpur)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="flex items-center gap-2 md:col-span-3">
          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split('-');
              setSortBy(s);
              setOrder(o);
            }}
            className="border-input bg-background focus:ring-ring h-10 w-full rounded-md border px-3 py-1 text-xs shadow-sm focus:ring-1 focus:outline-none sm:text-sm"
          >
            <option value="rating-desc">Sort: Highest Rated</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
            <option value="experience-desc">Sort: Most Experienced</option>
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearFilters}
              title="Clear all filters"
              className="text-muted-foreground hover:text-destructive h-10 w-10 shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills & Range Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-2">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground mr-1 flex items-center gap-1 text-xs font-semibold">
            <SlidersHorizontal className="h-3 w-3" /> Categories:
          </span>
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === ''
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted hover:bg-accent text-muted-foreground'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(category === cat.id ? '' : cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted hover:bg-accent text-muted-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Rating & Price Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Min Rating */}
          <div className="flex items-center gap-1.5">
            <Label className="text-muted-foreground text-xs">Rating:</Label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="border-input bg-background h-8 rounded-md border px-2 text-xs"
            >
              <option value="">Any</option>
              <option value="4.5">4.5+ ⭐</option>
              <option value="4.0">4.0+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
            </select>
          </div>

          {/* Min & Max Price */}
          <div className="flex items-center gap-1.5">
            <Label className="text-muted-foreground text-xs">Price:</Label>
            <Input
              type="number"
              placeholder="Min ৳"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-8 w-20 px-2 text-xs"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <Input
              type="number"
              placeholder="Max ৳"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-8 w-20 px-2 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
