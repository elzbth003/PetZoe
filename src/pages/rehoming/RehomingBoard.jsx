import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, Search, Filter, MapPin, Heart, ShieldCheck, 
  Sparkles, Clock, CheckCircle2, User, Loader2, ArrowRight
} from 'lucide-react';
import rehomeService from '../../services/rehomeService';
import RehomeApplicationModal from '../../components/rehoming/RehomeApplicationModal';
import { useAuth } from '../../hooks/useAuth';

export default function RehomingBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [selectedListingForApply, setSelectedListingForApply] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const speciesOptions = ['All', 'Dog', 'Cat', 'Bird', 'Other'];

  useEffect(() => {
    fetchListings();
  }, [selectedSpecies]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSpecies !== 'All') params.species = selectedSpecies;
      if (searchQuery.trim()) params.query = searchQuery.trim();

      const res = await rehomeService.getActiveListings(params);
      setListings(res.data || []);
    } catch (err) {
      console.error('Error fetching rehoming listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleApplyClick = (listing) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedListingForApply(listing);
  };

  const filteredListings = listings.filter((listing) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      listing.petName?.toLowerCase().includes(q) ||
      listing.petBreed?.toLowerCase().includes(q) ||
      listing.city?.toLowerCase().includes(q) ||
      listing.petCode?.toLowerCase().includes(q) ||
      listing.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <CheckCircle2 size={16} />
            {toastMessage.text}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
              <HeartHandshake size={14} /> Community Pet Rehoming
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-tight">
              Give a Loving Pet a Second Chance at Forever
            </h1>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              Browse pets looking for new homes from private owners. When life circumstances change, our community connects caring pet lovers with pets in need, keeping medical records continuous and care seamless.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by breed, name, city, or Pet ID..."
                className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Species Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {speciesOptions.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSpecies(sp)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedSpecies === sp
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 size={36} className="animate-spin text-amber-500" />
            <p className="text-xs font-semibold">Discovering pets seeking a new home...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3 max-w-lg mx-auto">
            <HeartHandshake size={44} className="mx-auto text-amber-400" />
            <h3 className="font-bold text-slate-800 text-base">No Rehoming Listings Found</h3>
            <p className="text-xs text-slate-500">
              There are currently no active rehoming listings matching your filters. Try clearing your search or checking back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Photo & Badges */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={listing.petPhotoUrl || (listing.petSpecies === 'Cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600')}
                    alt={listing.petName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-xs shadow-xs">
                      {listing.petSpecies}
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-[#1E3A5F]/90 text-white px-2 py-1 rounded-md backdrop-blur-xs shadow-xs">
                      {listing.petCode}
                    </span>
                  </div>

                  {listing.city && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-xs flex items-center gap-1">
                      <MapPin size={10} /> {listing.city}
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-600 transition-colors">
                        {listing.petName}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {listing.petAge} {listing.petAge === 1 ? 'yr' : 'yrs'} • {listing.petGender}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold">
                      {listing.petBreed}
                    </p>

                    <p className="text-xs font-medium text-slate-700 leading-relaxed line-clamp-2">
                      {listing.title}
                    </p>

                    {/* Reason snippet */}
                    <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block">Reason for Rehoming</span>
                      <p className="line-clamp-2">{listing.reason}</p>
                    </div>

                    {/* Requirements */}
                    {listing.requirements && (
                      <div className="flex items-start gap-1.5 text-[11px] text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                        <Sparkles size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2"><strong>Home Needs:</strong> {listing.requirements}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions / Status */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      Continuous Medical History
                    </span>

                    {listing.isOwner ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">
                        Your Pet
                      </span>
                    ) : listing.hasApplied ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock size={12} /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(listing)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Heart size={13} />
                        Apply to Adopt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {selectedListingForApply && (
        <RehomeApplicationModal
          listing={selectedListingForApply}
          isOpen={!!selectedListingForApply}
          onClose={() => setSelectedListingForApply(null)}
          onSuccess={() => {
            fetchListings();
            showToast('Application successfully submitted to the owner!', 'success');
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
