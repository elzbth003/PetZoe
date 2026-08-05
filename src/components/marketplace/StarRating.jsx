import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 16, className = "" }) {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= roundedRating
              ? 'fill-accent-500 text-accent-500'
              : star - 0.5 === roundedRating
              ? 'fill-accent-500 text-accent-500 opacity-50' // Half star approximation
              : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}
