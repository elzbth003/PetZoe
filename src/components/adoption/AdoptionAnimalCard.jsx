import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PawPrint } from 'lucide-react';

export default function AdoptionAnimalCard({ animal }) {
  return (
    <Link
      to={`/adopt/${animal.id}`}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
    >
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center">
        {animal.primaryPhotoBase64 ? (
          <img
            src={animal.primaryPhotoBase64}
            alt={animal.name || animal.species}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <PawPrint size={48} className="text-slate-300" />
        )}
        <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          {animal.adoptionStatus}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
          {animal.species}{animal.breed ? ` • ${animal.breed}` : ''}
        </div>

        <h3 className="font-bold text-slate-800 text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {animal.name || 'Unnamed'}
        </h3>

        <div className="text-xs text-slate-500 space-y-1 mt-auto pt-3 border-t border-slate-50">
          <p>
            {animal.sex && animal.sex !== 'UNKNOWN' ? animal.sex.charAt(0) + animal.sex.slice(1).toLowerCase() : 'Sex unknown'}
            {animal.estimatedAgeMonths != null && ` • ${animal.estimatedAgeMonths} months`}
            {animal.size && animal.size !== 'UNKNOWN' && ` • ${animal.size.replace(/_/g, ' ').toLowerCase()}`}
          </p>
          {(animal.city || animal.state) && (
            <p className="flex items-center gap-1">
              <MapPin size={12} /> {[animal.city, animal.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
