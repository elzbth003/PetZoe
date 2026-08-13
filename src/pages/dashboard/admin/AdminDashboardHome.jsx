import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Users, Shield, Database, Activity, Store, Stethoscope, HeartPulse, PawPrint, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getRecentActivity()
        ]);
        setStats(statsRes.data);
        setActivities(activityRes.data);
      } catch (err) {
        showToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-24 bg-slate-200 rounded-3xl w-full"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
      </div>
    </div>;
  }

  const actionItems = [
    { title: 'Veterinarians', count: stats?.pendingVets || 0, path: '/dashboard/admin/veterinarians', icon: Stethoscope },
    { title: 'Shelters', count: stats?.pendingShelters || 0, path: '/dashboard/admin/shelters', icon: HeartPulse },
    { title: 'Sellers', count: stats?.pendingSellers || 0, path: '/dashboard/admin/sellers', icon: Store },
    { title: 'Products', count: stats?.pendingProducts || 0, path: '/dashboard/admin/products', icon: PawPrint },
  ];
  const totalActions = actionItems.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="space-y-8">
      {/* Action Required Banner */}
      {totalActions > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Action Required</h3>
              <p className="text-amber-700 text-sm">You have {totalActions} items pending review.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {actionItems.map(item => item.count > 0 && (
              <Link key={item.title} to={item.path} className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-amber-700 shadow-sm border border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-2">
                <item.icon size={16} /> {item.count} {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Users size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
                <h3 className="text-2xl font-black text-slate-800">{stats?.totalUsers || 0}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                <PawPrint size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pet Owners</p>
                <h3 className="text-2xl font-black text-slate-800">{stats?.totalPetOwners || 0}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Stethoscope size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Vets</p>
                <h3 className="text-2xl font-black text-slate-800">{stats?.verifiedVets || 0}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                <PawPrint size={22} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Adoptions</p>
                <h3 className="text-2xl font-black text-slate-800">{stats?.activeAdoptionPets || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
              <Clock size={18} className="text-slate-400" />
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {activities.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-sm">No recent activity</div>
              ) : (
                <div className="space-y-6">
                  {activities.map((act) => (
                    <div key={act.id} className="relative pl-6 border-l-2 border-slate-100 last:border-transparent">
                      <div className="absolute w-3 h-3 bg-white border-2 border-slate-300 rounded-full -left-[7px] top-1"></div>
                      <div className="-mt-1.5">
                        <p className="text-sm font-semibold text-slate-700">
                          {act.adminUser?.name || 'Admin'} <span className="text-slate-500 font-normal">performed</span> {act.action}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{act.details}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                          {new Date(act.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
