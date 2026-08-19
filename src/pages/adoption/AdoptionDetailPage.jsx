import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PawPrint, MapPin, ChevronRight, Syringe, Scissors, HeartHandshake, Heart } from 'lucide-react';
import adoptionPublicService from '../../services/adoptionPublicService';
import { useAuth } from '../../hooks/useAuth';

const ADOPTION_STATUS_STYLES = {
  Available: 'bg-emerald-500',
  'Adoption Pending': 'bg-amber-500',
  Adopted: 'bg-slate-500',
};

export default function AdoptionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchDetail();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const res = await adoptionPublicService.getAnimalDetail(id);
      setAnimal(res.data);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (notFound || !animal) {
    return (
      <div className="pt-32 pb-20 flex justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">This animal is not currently available for adoption</h2>
          <Link to="/adopt" className="text-primary-600 hover:underline">Browse other animals</Link>
        </div>
      </div>
    );
  }

  const isAvailable = animal.adoptionStatus === 'Available';

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8">
          <Link to="/adopt" className="hover:text-primary-600">Adopt</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 line-clamp-1">{animal.name || 'Unnamed'}</span>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 mb-12">
          <div className="md:w-1/2">
            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square flex items-center justify-center">
              {animal.primaryPhotoBase64 ? (
                <img src={animal.primaryPhotoBase64} alt={animal.name} className="w-full h-full object-cover" />
              ) : (
                <PawPrint size={64} className="text-slate-300" />
              )}
            </div>
          </div>

          <div className="md:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${ADOPTION_STATUS_STYLES[animal.adoptionStatus] || 'bg-slate-500'}`}>
                {animal.adoptionStatus}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{animal.animalCode}</span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-slate-800 leading-tight mb-2">
              {animal.name || 'Unnamed'}
            </h1>
            <p className="text-slate-500 font-medium mb-4">{animal.species}{animal.breed ? ` • ${animal.breed}` : ''}</p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sex</p>
                <p className="font-bold text-slate-700">{animal.sex !== 'UNKNOWN' ? animal.sex : 'Unknown'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Age</p>
                <p className="font-bold text-slate-700">{animal.estimatedAgeMonths != null ? `${animal.estimatedAgeMonths} months` : 'Unknown'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Size</p>
                <p className="font-bold text-slate-700">{animal.size !== 'UNKNOWN' ? animal.size.replace(/_/g, ' ') : 'Unknown'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <p className="font-bold text-slate-700">{[animal.shelter?.city, animal.shelter?.state].filter(Boolean).join(', ') || 'Unknown'}</p>
              </div>
            </div>

            {animal.adoptionFee != null && (
              <p className="text-lg font-black text-slate-900 mb-4">Adoption Fee: ₹{animal.adoptionFee.toLocaleString()}</p>
            )}

            <div className="flex flex-wrap gap-3 text-xs font-bold mb-6">
              <span className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full">
                <Syringe size={14} /> {animal.vaccinationStatus}
              </span>
              <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">
                <Scissors size={14} /> {animal.sterilizationStatus.replace(/_/g, ' ')}
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
                <HeartHandshake size={14} /> {animal.healthSummary}
              </span>
            </div>

            <div className="mt-auto">
              {!isAvailable ? (
                <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-200 font-medium text-sm">
                  This animal is no longer available for adoption.
                </div>
              ) : !user ? (
                <Link to="/login"
                  className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 transition-all">
                  <Heart size={18} /> Login to Adopt {animal.name || 'this animal'}
                </Link>
              ) : user.role !== 'Pet Owner' ? (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 font-medium text-sm">
                  Only Pet Owner accounts can apply to adopt.
                </div>
              ) : (
                <Link to={`/adopt/${animal.id}/apply`}
                  className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 transition-all">
                  <Heart size={18} /> Apply to Adopt {animal.name || 'this animal'}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 mb-12 space-y-8">
          {animal.personality && (
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Personality</h3>
              <p className="text-slate-600 leading-relaxed">{animal.personality}</p>
            </div>
          )}
          {animal.behaviour && (
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Behaviour</h3>
              <p className="text-slate-600 leading-relaxed">{animal.behaviour}</p>
            </div>
          )}
          {animal.specialCareRequirements && (
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Special Care Requirements</h3>
              <p className="text-slate-600 leading-relaxed">{animal.specialCareRequirements}</p>
            </div>
          )}
          {animal.listingDescription && (
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">About {animal.name || 'this animal'}</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{animal.listingDescription}</p>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Shelter</h3>
            <p className="font-bold text-primary-600">{animal.shelter?.name}</p>
            {animal.shelter?.description && <p className="text-slate-600 mt-1">{animal.shelter.description}</p>}
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1"><MapPin size={14} /> {[animal.shelter?.city, animal.shelter?.state].filter(Boolean).join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
