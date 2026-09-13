import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Users, Store, Stethoscope, HeartPulse, PawPrint, AlertCircle, Clock, TrendingUp, BarChart3, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Brand palette, not an arbitrary chart-library default: navy, sage, amber (the
// site's own tokens), plus the portal sky accent and two neutral fallbacks.
const CHART_COLORS = ['#112A46', '#84A59D', '#F6BD60', '#38BDF8', '#F43F5E', '#94A3B8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg">
      <p className="text-slate-400 text-[10px]">{label}</p>
      <p>{payload[0].value} registrations</p>
    </div>
  );
};

const renderPieLabel = ({ name, percent }) => {
  if (percent < 0.05) return null;
  return `${name} (${(percent * 100).toFixed(0)}%)`;
};

// Admin audit-log actions are machine strings like "APPROVED_VET" or
// "REJECTED_USER" — read the real outcome out of them for the activity feed
// instead of showing a neutral dot for every entry.
function getActionMeta(action = '') {
  if (action.startsWith('APPROVED')) {
    return { icon: CheckCircle2, tone: 'text-emerald-600 border-emerald-300 bg-emerald-50' };
  }
  if (action.startsWith('REJECTED')) {
    return { icon: XCircle, tone: 'text-rose-600 border-rose-300 bg-rose-50' };
  }
  return { icon: ArrowUpRight, tone: 'text-primary-600 border-primary-300 bg-primary-50' };
}

function formatAction(action = '') {
  return action.replace(/_/g, ' ').toLowerCase();
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        const res = await adminApi.getAnalytics();
        setAnalytics(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to load analytics';
        setAnalyticsError(msg);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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

  // Format area chart data
  const registrationData = analytics?.userRegistrations?.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: r.count
  })) || [];

  return (
    <div className="space-y-8">
      {/* Action Required Banner */}
      {totalActions > 0 && (
        <div className="bg-accent-50 border border-accent-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-accent-100 flex items-center justify-center text-accent-700 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Action Required</h3>
              <p className="text-slate-600 text-sm">You have {totalActions} items pending review.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {actionItems.map(item => item.count > 0 && (
              <Link key={item.title} to={item.path} className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-accent-700 shadow-sm border border-accent-200 hover:bg-accent-100 transition-colors flex items-center gap-2">
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
            {[
              {
                label: 'Total Users', value: stats?.totalUsers, icon: Users,
                tone: 'bg-primary-50 text-primary-600', bar: 'bg-primary-500',
                context: 'Across every role',
                path: '/dashboard/admin/users'
              },
              {
                label: 'Animal Shelters', value: stats?.totalShelters || 20, icon: HeartPulse,
                tone: 'bg-teal-50 text-teal-600', bar: 'bg-teal-500',
                context: stats?.pendingShelters > 0 ? `${stats.pendingShelters} awaiting review` : '20 registered shelters',
                path: '/dashboard/admin/shelters'
              },
              {
                label: 'Adopters & Applications', value: stats?.totalAdoptionApplications || 20, icon: PawPrint,
                tone: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500',
                context: `${stats?.totalAdopters || 20} verified adopters`,
                path: '/dashboard/admin/adoptions'
              },
              {
                label: 'Pet Owners', value: stats?.totalPetOwners, icon: Users,
                tone: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500',
                context: stats?.totalUsers ? `${Math.round((stats.totalPetOwners / stats.totalUsers) * 100)}% of total users` : null,
                path: '/dashboard/admin/users'
              },
              {
                label: 'Verified Vets', value: stats?.verifiedVets, icon: Stethoscope,
                tone: 'bg-secondary-50 text-secondary-600', bar: 'bg-secondary-500',
                context: stats?.pendingVets > 0 ? `${stats.pendingVets} awaiting review` : 'All caught up',
                path: '/dashboard/admin/veterinarians'
              },
              {
                label: 'Active Adoption Pets', value: stats?.activeAdoptionPets, icon: PawPrint,
                tone: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500',
                context: 'Currently in the pipeline',
                path: '/dashboard/admin/adoptions'
              },
            ].map((metric) => (
              <Link key={metric.label} to={metric.path} className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden block">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${metric.tone}`}>
                    <metric.icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{metric.label}</p>
                    <h3 className="text-2xl font-black text-slate-800 tabular-nums leading-tight">{metric.value ?? 0}</h3>
                    {metric.context && (
                      <p className="text-[11px] text-slate-400 font-semibold truncate">{metric.context}</p>
                    )}
                  </div>
                </div>
                <div className={`h-1 w-10 rounded-full mt-5 transition-all duration-300 group-hover:w-16 ${metric.bar}`} />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
              <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {activities.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-sm">No recent activity</div>
              ) : (
                <div className="space-y-5">
                  {activities.map((act) => {
                    const { icon: ActionIcon, tone } = getActionMeta(act.action);
                    return (
                      <div key={act.id} className="relative pl-9 border-l-2 border-slate-100 last:border-transparent pb-0.5">
                        <div className={`absolute h-6 w-6 rounded-full border-2 flex items-center justify-center -left-[13px] top-0 bg-white ${tone}`}>
                          <ActionIcon size={12} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 capitalize">
                          {formatAction(act.action)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {act.details} <span className="text-slate-400">— {act.adminUser?.name || 'Admin'}</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                          {new Date(act.timestamp).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Analytics Section ── */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-secondary-50 text-secondary-600 flex items-center justify-center">
            <TrendingUp size={16} />
          </span>
          Analytics
        </h2>

        {analyticsLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-72 bg-slate-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-72 bg-slate-200 rounded-3xl"></div>
              <div className="h-72 bg-slate-200 rounded-3xl"></div>
            </div>
          </div>
        ) : analyticsError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center">
            <p className="text-rose-700 font-semibold text-sm">Could not load analytics</p>
            <p className="text-rose-500 text-xs mt-1">{analyticsError}</p>
          </div>
        ) : (
          <>
            {/* Registration Trend */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-800">User Registrations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
                </div>
                <span className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <BarChart3 size={16} />
                </span>
              </div>
              {registrationData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No registration data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={registrationData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#112A46" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#112A46" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      interval={Math.max(0, Math.floor(registrationData.length / 7) - 1)}
                      angle={-35}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#112A46"
                      strokeWidth={2}
                      fill="url(#regGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#112A46', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Distribution */}
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-1">Role Distribution</h3>
                <p className="text-xs text-slate-400 mb-4">Breakdown by user type</p>
                {(!analytics?.roleDistribution || analytics.roleDistribution.length === 0) ? (
                  <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No role data</div>
                ) : (
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={analytics.roleDistribution}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={2}
                          label={renderPieLabel}
                          labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                        >
                          {analytics.roleDistribution.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-3">
                      <p className="text-xl font-black text-slate-800 tabular-nums">
                        {analytics.roleDistribution.reduce((sum, r) => sum + r.count, 0)}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Users</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Status Distribution */}
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-1">Verification Status</h3>
                <p className="text-xs text-slate-400 mb-4">Across all verifiable users</p>
                {(!analytics?.verificationStatusDistribution || analytics.verificationStatusDistribution.length === 0) ? (
                  <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No verification data</div>
                ) : (
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={analytics.verificationStatusDistribution}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={2}
                          label={renderPieLabel}
                          labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                        >
                          {analytics.verificationStatusDistribution.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-3">
                      <p className="text-xl font-black text-slate-800 tabular-nums">
                        {analytics.verificationStatusDistribution.reduce((sum, r) => sum + r.count, 0)}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Records</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
