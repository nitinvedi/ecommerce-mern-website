import React from "react";

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-[4/3] rounded-lg" />
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        {/* Price & Button */}
        <div className="flex items-center justify-between mt-2">
          <div className="space-y-1">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
