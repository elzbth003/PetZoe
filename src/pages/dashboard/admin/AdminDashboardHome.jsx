import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Users, Shield, Database, Activity, Store, Stethoscope, HeartPulse, PawPrint } from 'lucide-react';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (err) {
        showToast("Failed to load dashboard statistics", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-24 bg-slate-200 rounded-3xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-slate-800">{stats?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <PawPrint size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pet Owners</p>
            <h3 className="text-2xl font-black text-slate-800">{stats?.totalPetOwners || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Store size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Sellers</p>
            <h3 className="text-2xl font-black text-slate-800">{stats?.pendingSellers || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Stethoscope size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Vets</p>
            <h3 className="text-2xl font-black text-slate-800">{stats?.pendingVets || 0}</h3>
          </div>
        </div>
      </div>
      
      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
            <HeartPulse size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Shelters</p>
            <h3 className="text-2xl font-black text-slate-800">{stats?.pendingShelters || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Store size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Products</p>
            <h3 className="text-2xl font-black text-slate-800">{stats?.pendingProducts || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
