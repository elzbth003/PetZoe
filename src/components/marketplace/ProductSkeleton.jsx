import React from 'react';

export default function ProductSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-slate-100 p-4 flex flex-col h-full shadow-sm animate-pulse"
        >
          {/* Image placeholder */}
          <div className="w-full aspect-square bg-slate-100 rounded-2xl mb-4" />

          {/* Brand & title placeholders */}
          <div className="h-3 w-1/4 bg-slate-100 rounded mb-2" />
          <div className="h-4 w-4/5 bg-slate-200 rounded mb-1.5" />
          <div className="h-4 w-3/5 bg-slate-200 rounded mb-3" />

          {/* Rating placeholder */}
          <div className="h-3 w-24 bg-slate-100 rounded mb-4" />

          {/* Price & action footer */}
          <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3 w-12 bg-slate-100 rounded" />
              <div className="h-5 w-20 bg-slate-200 rounded" />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </>
  );
}
