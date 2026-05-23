import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON COMPONENTS — loading placeholders matching product card layouts
// ─────────────────────────────────────────────────────────────────────────────

const shimmer = 'animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl';

/** Reusable shimmer block */
const SkimBlock = ({ className = '' }) => (
  <div className={`${shimmer} ${className}`} aria-hidden="true" />
);

/** Product card skeleton — matches ProductCard layout */
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-brand-50" aria-busy="true" aria-label="Loading product">
    <SkimBlock className="h-52 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <SkimBlock className="h-3 w-3/4" />
      <SkimBlock className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <SkimBlock className="h-5 w-16" />
        <SkimBlock className="h-8 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

/** Grid of product card skeletons */
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" role="status" aria-label="Loading products">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

/** Product detail page skeleton */
export const ProductDetailSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-10" aria-busy="true" aria-label="Loading product details">
    <SkimBlock className="h-96 w-full rounded-3xl" />
    <div className="space-y-4">
      <SkimBlock className="h-6 w-4/5" />
      <SkimBlock className="h-4 w-1/3" />
      <SkimBlock className="h-4 w-full" />
      <SkimBlock className="h-4 w-5/6" />
      <SkimBlock className="h-4 w-2/3" />
      <SkimBlock className="h-12 w-full rounded-full mt-6" />
    </div>
  </div>
);

/** Order list skeleton */
export const OrderSkeleton = () => (
  <div className="bg-white border border-brand-50 rounded-3xl p-5 space-y-3 shadow-soft" aria-busy="true" aria-label="Loading order">
    <div className="flex justify-between">
      <SkimBlock className="h-4 w-1/3" />
      <SkimBlock className="h-6 w-20 rounded-full" />
    </div>
    <SkimBlock className="h-3 w-1/2" />
    <SkimBlock className="h-3 w-1/4" />
    <div className="flex gap-2 pt-1">
      <SkimBlock className="h-12 w-12 rounded-xl" />
      <SkimBlock className="h-12 w-12 rounded-xl" />
      <SkimBlock className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

/** Inline text skeleton */
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <SkimBlock key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);
