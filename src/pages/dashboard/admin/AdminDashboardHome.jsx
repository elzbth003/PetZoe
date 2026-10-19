import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import {
  Users, Store, Stethoscope, HeartPulse, PawPrint, AlertCircle, Clock,
  TrendingUp, BarChart3, CheckCircle2, XCircle, ArrowUpRight, Calendar,
  RefreshCw, ShoppingBag, Bot, Server, ShieldCheck, Activity, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

// Theme tokens for PetZoe admin
const CHART_COLORS = ['#112A46', '#84A59D', '#F6BD60', '#38BDF8', '#F43F5E', '#10B981', '#6366F1', '#EC4899'];

const CustomTooltip = ({ active, payload, label, unit = 'records' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg border border-slate-700">
      <p className="text-slate-400 text-[10px] mb-0.5">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color || '#fff' }}>
          {entry.name || 'Count'}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value} {unit}
        </p>
      ))}
    </div>
  );
};

const renderPieLabel = ({ name, percent }) => {
  if (!percent || percent < 0.05) return null;
  return `${name} (${(percent * 100).toFixed(0)}%)`;
};

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
  const [systemHealth, setSystemHealth] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Reporting period controls: 7, 30, 90, 365
  const [reportingDays, setReportingDays] = useState(30);

  // Active analytics category tab
  const [activeTab, setActiveTab] = useState('users');

  // Audit filter state
  const [activityFilter, setActivityFilter] = useState('ALL');

  const { showToast } = useToast();

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, activityRes, healthRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRecentActivity(),
        adminApi.getSystemHealth().catch(() => ({ data: null }))
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data || []);
      setSystemHealth(healthRes?.data || null);
    } catch (err) {
      showToast("Failed to load dashboard metrics", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  const fetchAnalytics = useCallback(async (days) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await adminApi.getAnalytics(days);
      setAnalytics(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load analytics';
      setAnalyticsError(msg);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchAnalytics(reportingDays);
  }, [reportingDays, fetchAnalytics]);

  const handlePeriodChange = (days) => {
    setReportingDays(days);
  };

  const handleManualRefresh = () => {
    fetchDashboardData(true);
    fetchAnalytics(reportingDays);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  // Pending Actions
  const actionItems = [
    { title: 'Veterinarians', count: stats?.pendingVets ?? 0, path: '/dashboard/admin/veterinarians', icon: Stethoscope },
    { title: 'Shelters', count: stats?.pendingShelters ?? 0, path: '/dashboard/admin/shelters', icon: HeartPulse },
    { title: 'Sellers', count: stats?.pendingSellers ?? 0, path: '/dashboard/admin/sellers', icon: Store },
    { title: 'Products', count: stats?.pendingProducts ?? 0, path: '/dashboard/admin/products', icon: ShoppingBag },
    { title: 'Adoption Listings', count: stats?.pendingAdoptionListings ?? 0, path: '/dashboard/admin/adoptions', icon: PawPrint },
  ];
  const totalActions = actionItems.reduce((acc, item) => acc + item.count, 0);

  // Filtered Activities
  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'APPROVED') return act.action?.startsWith('APPROVED');
    if (activityFilter === 'REJECTED') return act.action?.startsWith('REJECTED');
    if (activityFilter === 'USER') return act.targetEntity === 'User';
    if (activityFilter === 'PRODUCT') return act.targetEntity === 'Product';
    return true;
  });

  // Time-series chart formatting
  const registrationData = analytics?.userRegistrations?.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: r.count
  })) || [];

  const appointmentData = analytics?.appointmentTrends?.map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: a.count
  })) || [];

  const orderData = analytics?.orderTrends?.map(o => ({
    date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: o.count,
    revenue: o.revenue
  })) || [];

  const aiMessageData = analytics?.aiMessageTrends?.map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: m.count
  })) || [];

  return (
    <div className="space-y-8">
      {/* ── Top Header Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Admin Command Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform metrics, operational queues, and system telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reporting Period Switcher */}
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
            {[
              { label: '7D', days: 7 },
              { label: '30D', days: 30 },
              { label: '90D', days: 90 },
              { label: '1Y', days: 365 },
            ].map(p => (
              <button
                key={p.days}
                onClick={() => handlePeriodChange(p.days)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  reportingDays === p.days
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-primary-600' : ''} />
          </button>
        </div>
      </div>

      {/* ── Action Required Banner ── */}
      {totalActions > 0 ? (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pending Operational Reviews</h3>
              <p className="text-slate-600 text-sm">{totalActions} item(s) awaiting administrative review.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {actionItems.map(item => item.count > 0 && (
              <Link
                key={item.title}
                to={item.path}
                className="px-3.5 py-1.5 bg-white rounded-xl text-xs font-bold text-slate-800 shadow-sm border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-2"
              >
                <item.icon size={14} className="text-amber-700" />
                <span>{item.count}</span> {item.title}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>All operational queues are caught up. Zero pending verification reviews.</span>
        </div>
      )}

      {/* ── Primary KPI Cards Grid (Genuine Database Metrics) ── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Core Platform KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Users',
              value: stats?.totalUsers ?? 0,
              icon: Users,
              tone: 'bg-primary-50 text-primary-600',
              bar: 'bg-primary-500',
              context: `${stats?.totalPetOwners ?? 0} Pet Owners`,
              path: '/dashboard/admin/users'
            },
            {
              label: 'Registered Pets',
              value: stats?.totalPets ?? 0,
              icon: PawPrint,
              tone: 'bg-amber-50 text-amber-600',
              bar: 'bg-amber-500',
              context: `${stats?.activeAdoptionPets ?? 0} ready for adoption`,
              path: '/dashboard/admin/adoptions'
            },
            {
              label: 'Verified Veterinarians',
              value: stats?.verifiedVets ?? 0,
              icon: Stethoscope,
              tone: 'bg-secondary-50 text-secondary-600',
              bar: 'bg-secondary-500',
              context: stats?.pendingVets > 0 ? `${stats.pendingVets} pending review` : 'All verified',
              path: '/dashboard/admin/veterinarians'
            },
            {
              label: 'Registered Shelters',
              value: stats?.totalShelters ?? 0,
              icon: HeartPulse,
              tone: 'bg-teal-50 text-teal-600',
              bar: 'bg-teal-500',
              context: stats?.pendingShelters > 0 ? `${stats.pendingShelters} pending approval` : 'Active shelters',
              path: '/dashboard/admin/shelters'
            },
            {
              label: 'Adoption Applications',
              value: stats?.totalAdoptionApplications ?? 0,
              icon: PawPrint,
              tone: 'bg-indigo-50 text-indigo-600',
              bar: 'bg-indigo-500',
              context: `${stats?.totalAdopters ?? 0} verified adopters`,
              path: '/dashboard/admin/adoptions'
            },
            {
              label: 'Veterinary Consultations',
              value: stats?.totalAppointments ?? 0,
              icon: Activity,
              tone: 'bg-sky-50 text-sky-600',
              bar: 'bg-sky-500',
              context: `${stats?.completedAppointments ?? 0} completed · ${stats?.cancelledAppointments ?? 0} cancelled`,
              path: '/dashboard/admin/veterinarians'
            },
            {
              label: 'Marketplace Orders',
              value: stats?.totalOrders ?? 0,
              icon: ShoppingBag,
              tone: 'bg-rose-50 text-rose-600',
              bar: 'bg-rose-500',
              context: `₹${(stats?.grossOrderRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })} Gross Settled`,
              path: '/dashboard/admin/products'
            },
            {
              label: 'AI Chat Interactions',
              value: stats?.totalAiMessages ?? 0,
              icon: Bot,
              tone: 'bg-emerald-50 text-emerald-600',
              bar: 'bg-emerald-500',
              context: `${stats?.totalAiConversations ?? 0} Conversations`,
              path: '/dashboard/admin'
            },
          ].map((metric) => (
            <Link
              key={metric.label}
              to={metric.path}
              className="group bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden block"
            >
              <div className="flex items-center gap-3.5">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${metric.tone}`}>
                  <metric.icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{metric.label}</p>
                  <h3 className="text-xl font-black text-slate-800 tabular-nums leading-tight">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : (metric.value ?? 0)}
                  </h3>
                  {metric.context && (
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{metric.context}</p>
                  )}
                </div>
              </div>
              <div className={`h-1 w-8 rounded-full mt-4 transition-all duration-300 group-hover:w-14 ${metric.bar}`} />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Analytics and Activity Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Multi-tab Analytics Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary-600" />
                  Analytics & Visualizations
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reporting window: Last {reportingDays} days (Genuine database aggregations)
                </p>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600">
                {[
                  { id: 'users', label: 'Users & Roles' },
                  { id: 'veterinary', label: 'Veterinary & Adoptions' },
                  { id: 'marketplace', label: 'Marketplace' },
                  { id: 'ai', label: 'AI Assistant' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div className="animate-pulse space-y-4 py-8">
                <div className="h-64 bg-slate-100 rounded-2xl w-full"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-48 bg-slate-100 rounded-2xl"></div>
                  <div className="h-48 bg-slate-100 rounded-2xl"></div>
                </div>
              </div>
            ) : analyticsError ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-6">
                <p className="text-rose-700 font-semibold text-sm">Could not load analytics</p>
                <p className="text-rose-500 text-xs mt-1">{analyticsError}</p>
                <button
                  onClick={() => fetchAnalytics(reportingDays)}
                  className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                {/* ── TAB 1: USERS & ROLES ── */}
                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-800">User Registrations Trend</h3>
                        <span className="text-[11px] text-slate-400 font-semibold">Daily new accounts</span>
                      </div>
                      {registrationData.length === 0 || registrationData.every(r => r.count === 0) ? (
                        <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                          <Users size={28} className="text-slate-300 mb-2" />
                          <span>No user registrations recorded in the last {reportingDays} days</span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={230}>
                          <AreaChart data={registrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="userRegGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#112A46" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#112A46" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip unit="registrations" />} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#112A46"
                              strokeWidth={2}
                              fill="url(#userRegGrad)"
                              dot={false}
                              activeDot={{ r: 4, fill: '#112A46' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* Role Distribution */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">User Role Distribution</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Counts by registered account role</p>
                        {(!analytics?.roleDistribution || analytics.roleDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No role data</div>
                        ) : (
                          <div className="relative">
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={analytics.roleDistribution}
                                  dataKey="count"
                                  nameKey="label"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={75}
                                  innerRadius={42}
                                  paddingAngle={2}
                                  label={renderPieLabel}
                                >
                                  {analytics.roleDistribution.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="users" />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {/* Verification Status Distribution */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Verification Status Breakdown</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Accounts requiring verification</p>
                        {(!analytics?.verificationStatusDistribution || analytics.verificationStatusDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No verification data</div>
                        ) : (
                          <div className="relative">
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={analytics.verificationStatusDistribution}
                                  dataKey="count"
                                  nameKey="label"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={75}
                                  innerRadius={42}
                                  paddingAngle={2}
                                  label={renderPieLabel}
                                >
                                  {analytics.verificationStatusDistribution.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="accounts" />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: VETERINARY & ADOPTIONS ── */}
                {activeTab === 'veterinary' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-800">Veterinary Consultations Scheduled</h3>
                        <span className="text-[11px] text-slate-400 font-semibold">Daily appointment bookings</span>
                      </div>
                      {appointmentData.length === 0 || appointmentData.every(a => a.count === 0) ? (
                        <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                          <Stethoscope size={28} className="text-slate-300 mb-2" />
                          <span>No appointments scheduled in the selected period</span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={appointmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="vetAppGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#84A59D" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#84A59D" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip unit="appointments" />} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#84A59D"
                              strokeWidth={2}
                              fill="url(#vetAppGrad)"
                              dot={false}
                              activeDot={{ r: 4, fill: '#84A59D' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* Appointment Status */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Appointment Outcomes</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Distribution by appointment status</p>
                        {(!analytics?.appointmentStatusDistribution || analytics.appointmentStatusDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No appointment data</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={analytics.appointmentStatusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip unit="records" />} />
                              <Bar dataKey="count" fill="#84A59D" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Adoption Application Status */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Adoption Workflow Pipeline</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Submitted application lifecycle</p>
                        {(!analytics?.adoptionApplicationStatusDistribution || analytics.adoptionApplicationStatusDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No adoption applications</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={analytics.adoptionApplicationStatusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip unit="applications" />} />
                              <Bar dataKey="count" fill="#F6BD60" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: MARKETPLACE & ORDERS ── */}
                {activeTab === 'marketplace' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-800">Order Volume & Value</h3>
                        <span className="text-[11px] text-slate-400 font-semibold">Daily placed orders</span>
                      </div>
                      {orderData.length === 0 || orderData.every(o => o.orders === 0) ? (
                        <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                          <ShoppingBag size={28} className="text-slate-300 mb-2" />
                          <span>No marketplace orders recorded in the selected period</span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={orderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip unit="orders" />} />
                            <Bar dataKey="orders" fill="#112A46" radius={[6, 6, 0, 0]} name="Orders" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* Order Status Distribution */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Order Status Lifecycle</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Active vs. delivered orders</p>
                        {(!analytics?.orderStatusDistribution || analytics.orderStatusDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No orders recorded</div>
                        ) : (
                          <div className="relative">
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={analytics.orderStatusDistribution}
                                  dataKey="count"
                                  nameKey="label"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={75}
                                  innerRadius={42}
                                  paddingAngle={2}
                                  label={renderPieLabel}
                                >
                                  {analytics.orderStatusDistribution.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="orders" />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {/* Payment Status */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Razorpay Payment Status</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Real payment verification outcomes</p>
                        {(!analytics?.paymentStatusDistribution || analytics.paymentStatusDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No payment records</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={analytics.paymentStatusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip unit="payments" />} />
                              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: AI ASSISTANT & SYSTEM HEALTH ── */}
                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-800">AI Assistant Activity</h3>
                        <span className="text-[11px] text-slate-400 font-semibold">User messages processed</span>
                      </div>
                      {aiMessageData.length === 0 || aiMessageData.every(m => m.count === 0) ? (
                        <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                          <Bot size={28} className="text-slate-300 mb-2" />
                          <span>No AI chat messages recorded in the selected period</span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={aiMessageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="aiChatGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip unit="messages" />} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#10B981"
                              strokeWidth={2}
                              fill="url(#aiChatGrad)"
                              dot={false}
                              activeDot={{ r: 4, fill: '#10B981' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* AI Intent Distribution */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Detected Clinical & Care Intents</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Intent routing breakdown</p>
                        {(!analytics?.aiIntentDistribution || analytics.aiIntentDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No intent telemetry</div>
                        ) : (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={analytics.aiIntentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="label" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip unit="queries" />} />
                              <Bar dataKey="count" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* AI Retrieval Source Distribution */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-1">Knowledge Retrieval Provenance</h4>
                        <p className="text-[11px] text-slate-400 mb-3">Source grounding distribution</p>
                        {(!analytics?.aiSourceDistribution || analytics.aiSourceDistribution.length === 0) ? (
                          <div className="h-44 flex items-center justify-center text-slate-400 text-xs">No retrieval telemetry</div>
                        ) : (
                          <div className="relative">
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={analytics.aiSourceDistribution}
                                  dataKey="count"
                                  nameKey="label"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={75}
                                  innerRadius={42}
                                  paddingAngle={2}
                                  label={renderPieLabel}
                                >
                                  {analytics.aiSourceDistribution.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="responses" />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── System Telemetry Status Card ── */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Server size={16} className="text-slate-600" />
              Runtime Telemetry & Operational Health
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${systemHealth?.databaseStatus === 'HEALTHY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-xs font-bold text-slate-800">{systemHealth?.databaseStatus || 'UNKNOWN'}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audit Subsystem</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${systemHealth?.auditServiceStatus === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <p className="text-xs font-bold text-slate-800">{systemHealth?.auditServiceStatus || 'UNKNOWN'}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">JVM Memory</p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {systemHealth ? `${systemHealth.usedMemoryMb}MB / ${systemHealth.totalMemoryMb}MB` : 'Unavailable'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPU Cores</p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {systemHealth?.availableProcessors ? `${systemHealth.availableProcessors} Available` : 'Unavailable'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Genuine Administrative Activity Feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full max-h-[750px]">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={16} className="text-primary-600" />
                  Audit Activity Feed
                </h2>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">
                  {filteredActivities.length} logs
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'APPROVED', label: 'Approved' },
                  { id: 'REJECTED', label: 'Rejected' },
                  { id: 'USER', label: 'Users' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActivityFilter(f.id)}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      activityFilter === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {filteredActivities.length === 0 ? (
                <div className="text-center text-slate-400 py-12 text-xs border border-dashed border-slate-200 rounded-2xl">
                  <ShieldCheck size={28} className="mx-auto text-slate-300 mb-2" />
                  <span>No audit activities match the active filter</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((act) => {
                    const { icon: ActionIcon, tone } = getActionMeta(act.action);
                    return (
                      <div key={act.id} className="relative pl-7 border-l-2 border-slate-100 last:border-transparent pb-1">
                        <div className={`absolute h-5 w-5 rounded-full border flex items-center justify-center -left-[11px] top-0.5 bg-white ${tone}`}>
                          <ActionIcon size={10} />
                        </div>
                        <p className="text-xs font-bold text-slate-800 capitalize leading-snug">
                          {formatAction(act.action)}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                          {act.details} <span className="text-slate-400 font-semibold">— {act.adminUser?.name || 'Admin'}</span>
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
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
    </div>
  );
}

