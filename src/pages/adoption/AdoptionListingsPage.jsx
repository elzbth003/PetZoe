import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight, PawPrint } from 'lucide-react';
import adoptionPublicService from '../../services/adoptionPublicService';
import AdoptionAnimalCard from '../../components/adoption/AdoptionAnimalCard';
import SelectDropdown from '../../components/ui/SelectDropdown';

const SEX_OPTIONS = ['MALE', 'FEMALE'];
const SIZE_OPTIONS = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];

export default function AdoptionListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [animals, setAnimals] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [species, setSpecies] = useState(searchParams.get('species') || '');
  const [sex, setSex] = useState('');
  const [size, setSize] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    adoptionPublicService.getDistinctSpecies().then(res => setSpeciesList(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAnimals();
    const newParams = new URLSearchParams();
    if (species) newParams.set('species', species);
    setSearchParams(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, species, sex, size, city, state]);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const res = await adoptionPublicService.searchAnimals({
        species: species || undefined,
        sex: sex || undefined,
        size: size || undefined,
        city: city || undefined,
        state: state || undefined,
        page: currentPage,
        pageSize: 12,
      });
      setAnimals(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalElements);
    } catch (err) {
      console.error('Failed to fetch adoptable animals', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSpecies(''); setSex(''); setSize(''); setCity(''); setState(''); setCurrentPage(0);
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-slate-800">Adopt a Pet</h1>
            <p className="text-slate-500 font-medium mt-1">Showing {animals.length} of {totalItems} animals looking for a home</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl font-bold text-slate-700 shadow-sm"
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <div className={`md:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline">Clear</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Species</label>
                <SelectDropdown
                  value={species}
                  onChange={(val) => { setSpecies(val); setCurrentPage(0); }}
                  placeholder="All Species"
                  options={[
                    { value: '', label: 'All Species' },
                    ...speciesList.map(s => ({ value: s, label: s }))
                  ]}
                  size="sm"
                  buttonClassName="bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sex</label>
                <SelectDropdown
                  value={sex}
                  onChange={(val) => { setSex(val); setCurrentPage(0); }}
                  placeholder="Any Sex"
                  options={[
                    { value: '', label: 'Any Sex' },
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' }
                  ]}
                  size="sm"
                  buttonClassName="bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Size</label>
                <SelectDropdown
                  value={size}
                  onChange={(val) => { setSize(val); setCurrentPage(0); }}
                  placeholder="Any Size"
                  options={[
                    { value: '', label: 'Any Size' },
                    ...SIZE_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))
                  ]}
                  size="sm"
                  buttonClassName="bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
                <input value={city} onChange={e => { setCity(e.target.value); setCurrentPage(0); }}
                  placeholder="e.g. Kochi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">State</label>
                <input value={state} onChange={e => { setState(e.target.value); setCurrentPage(0); }}
                  placeholder="e.g. Kerala"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500" />
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary-600"></div>
              </div>
            ) : animals.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <PawPrint size={32} />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mb-2">No animals found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters, or check back soon — new animals are listed regularly.</p>
                <button onClick={clearFilters} className="bg-primary-50 text-primary-600 font-bold px-6 py-2.5 rounded-full hover:bg-primary-100 transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {animals.map(animal => (
                    <AdoptionAnimalCard key={animal.id} animal={animal} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft size={20} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 rounded-xl font-bold transition-colors ${currentPage === i ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
