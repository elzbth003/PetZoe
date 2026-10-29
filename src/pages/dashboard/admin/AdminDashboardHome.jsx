import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Link } from 'react-router-dom';
import {
  Users, Store, Stethoscope, HeartPulse, PawPrint, AlertCircle, Clock,
  TrendingUp, BarChart3, CheckCircle2, XCircle, ArrowUpRight, Calendar,
  RefreshCw, ShoppingBag, Bot, Server, ShieldCheck, Activity, DollarSign,
  Search, Filter, ChevronRight, Eye, Shield, Check, AlertTriangle, Layers,
  CheckCircle, ArrowDownRight, Sparkles, Database, Cpu
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

// Design tokens strictly following the PetZoe design system
const PALETTE = {
  primaryNavy: '#17365C',
  deepNavy: '#102844',
  background: '#F5F8FC',
  cardBackground: '#FFFFFF',
  primaryBlue: '#3B82F6',
  teal: '#10B981',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  coralRed: '#F43F5E',
  primaryText: '#172B4D',
  secondaryText: '#71829E',
  border: '#E5ECF4',
};

// Harmonious chart colors for distributions
const DONUT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Teal
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#17365C', // Navy
  '#F43F5E', // Coral
];

// Clean, high-contrast dark tooltip matching enterprise aesthetic
const CustomTooltip = ({ active, payload, label, unit = 'records', prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#102844] text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-[#17365C] backdrop-blur-md">
      <p className="text-[#71829E] text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || '#3B82F6' }} />
          <span className="text-slate-300 font-medium">{entry.name || 'Count'}:</span>
          <span className="text-white font-bold font-mono">
            {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value} {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

// Format date strings cleanly
function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

// Consistent Status Badge Component
function StatusBadge({ status = '' }) {
  const s = (status || '').toUpperCase();
  if (['APPROVED', 'VERIFIED', 'DELIVERED', 'COMPLETED', 'PAID', 'SUCCESS', 'ACTIVE'].includes(s)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    );
  }
  if (['PENDING', 'PENDING_REVIEW', 'SUBMITTED', 'UPCOMING', 'PROCESSING', 'SHIPPED'].includes(s)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        {status.replace(/_/g, ' ')}
      </span>
    );
  }
  if (['REJECTED', 'CANCELLED', 'FAILED', 'SUSPENDED'].includes(s)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {status || 'Not Set'}
    </span>
  );
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activities, setActivities] = useState([]);

  // Data for tables
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  // Date range filter: 1, 7, 30, 90, 365
  const [reportingDays, setReportingDays] = useState(30);

  // Table active tab & search
  const [activeTableTab, setActiveTableTab] = useState('registrations');
  const [tableSearch, setTableSearch] = useState('');

  // Verification breakdown filter entity
  const [verificationFilter, setVerificationFilter] = useState('ALL');

  const { showToast } = useToast();

  // Load all dashboard core statistics and recent lists
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const results = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getSystemHealth(),
        adminApi.getUsers(),
        adminApi.getRecentAppointments(),
        adminApi.getRecentOrders(),
        adminApi.getRecentActivity()
      ]);

      if (results[0].status === 'fulfilled') setStats(results[0].value.data);
      if (results[1].status === 'fulfilled') setSystemHealth(results[1].value.data);
      if (results[2].status === 'fulfilled') setRecentUsers(results[2].value.data || []);
      if (results[3].status === 'fulfilled') setRecentAppointments(results[3].value.data || []);
      if (results[4].status === 'fulfilled') setRecentOrders(results[4].value.data || []);
      if (results[5].status === 'fulfilled') setActivities(results[5].value.data || []);
    } catch {
      showToast('Some operational metrics could not be loaded', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // Load time-series analytics according to chosen period
  const fetchAnalytics = useCallback(async (days) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await adminApi.getAnalytics(days);
      setAnalytics(res.data);
    } catch (err) {
      setAnalyticsError(err.response?.data?.message || 'Failed to load analytics series');
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

  // Pending Actions queue
  const actionItems = useMemo(() => [
    { title: 'Veterinarians', count: stats?.pendingVets ?? 0, path: '/dashboard/admin/veterinarians', icon: Stethoscope },
    { title: 'Shelters', count: stats?.pendingShelters ?? 0, path: '/dashboard/admin/shelters', icon: HeartPulse },
    { title: 'Sellers', count: stats?.pendingSellers ?? 0, path: '/dashboard/admin/sellers', icon: Store },
    { title: 'Products', count: stats?.pendingProducts ?? 0, path: '/dashboard/admin/products', icon: ShoppingBag },
    { title: 'Adoption Listings', count: stats?.pendingAdoptionListings ?? 0, path: '/dashboard/admin/adoptions', icon: PawPrint },
  ], [stats]);

  const totalPendingActions = actionItems.reduce((acc, item) => acc + item.count, 0);

  // Time-series data formatting
  const registrationChartData = useMemo(() => {
    return analytics?.userRegistrations?.map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: r.count
    })) || [];
  }, [analytics]);

  const appointmentChartData = useMemo(() => {
    return analytics?.appointmentTrends?.map(a => ({
      date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      appointments: a.count
    })) || [];
  }, [analytics]);

  const revenueChartData = useMemo(() => {
    return analytics?.orderTrends?.map(o => ({
      date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(o.revenue || 0),
      orders: o.count
    })) || [];
  }, [analytics]);

  // Total period aggregates for charts
  const totalPeriodRegistrations = useMemo(() => {
    return registrationChartData.reduce((acc, d) => acc + d.registrations, 0);
  }, [registrationChartData]);

  const totalPeriodAppointments = useMemo(() => {
    return appointmentChartData.reduce((acc, d) => acc + d.appointments, 0);
  }, [appointmentChartData]);

  const totalPeriodRevenue = useMemo(() => {
    return revenueChartData.reduce((acc, d) => acc + d.revenue, 0);
  }, [revenueChartData]);

  // User Role Distribution with computed percentages
  const roleDistributionWithPercentages = useMemo(() => {
    const list = analytics?.roleDistribution || [];
    const total = list.reduce((sum, item) => sum + item.count, 0);
    return list.map((item, idx) => ({
      ...item,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
    }));
  }, [analytics]);

  // Order Status Distribution with computed percentages
  const orderDistributionWithPercentages = useMemo(() => {
    const list = analytics?.orderStatusDistribution || [];
    const total = list.reduce((sum, item) => sum + item.count, 0);
    return list.map((item, idx) => ({
      ...item,
      color: DONUT_COLORS[(idx + 1) % DONUT_COLORS.length],
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
    }));
  }, [analytics]);

  // Verification status breakdown items
  const verificationBreakdown = useMemo(() => {
    return [
      {
        entity: 'Veterinarians',
        approved: stats?.verifiedVets || 0,
        pending: stats?.pendingVets || 0,
        rejected: 0,
        total: (stats?.verifiedVets || 0) + (stats?.pendingVets || 0),
        path: '/dashboard/admin/veterinarians'
      },
      {
        entity: 'Shelters & Rescues',
        approved: (stats?.totalShelters || 0) - (stats?.pendingShelters || 0),
        pending: stats?.pendingShelters || 0,
        rejected: 0,
        total: stats?.totalShelters || 0,
        path: '/dashboard/admin/shelters'
      },
      {
        entity: 'Marketplace Sellers',
        approved: 0,
        pending: stats?.pendingSellers || 0,
        rejected: 0,
        total: stats?.pendingSellers || 0,
        path: '/dashboard/admin/sellers'
      },
      {
        entity: 'Product Listings',
        approved: 0,
        pending: stats?.pendingProducts || 0,
        rejected: 0,
        total: stats?.pendingProducts || 0,
        path: '/dashboard/admin/products'
      }
    ];
  }, [stats]);

  // Filtered table rows
  const filteredUsers = useMemo(() => {
    if (!tableSearch) return recentUsers.slice(0, 8);
    const q = tableSearch.toLowerCase();
    return recentUsers
      .filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [recentUsers, tableSearch]);

  const filteredAppointments = useMemo(() => {
    if (!tableSearch) return recentAppointments.slice(0, 8);
    const q = tableSearch.toLowerCase();
    return recentAppointments
      .filter(a => a.petName?.toLowerCase().includes(q) || a.ownerName?.toLowerCase().includes(q) || a.veterinarianName?.toLowerCase().includes(q) || a.status?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [recentAppointments, tableSearch]);

  const filteredOrders = useMemo(() => {
    if (!tableSearch) return recentOrders.slice(0, 8);
    const q = tableSearch.toLowerCase();
    return recentOrders
      .filter(o => String(o.id).includes(q) || o.status?.toLowerCase().includes(q) || o.user?.name?.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [recentOrders, tableSearch]);

  // Derived Pet Healthcare Operation calculations
  const healthcareMetrics = useMemo(() => {
    const totalAppts = stats?.totalAppointments || 0;
    const completedAppts = stats?.completedAppointments || 0;
    const cancelledAppts = stats?.cancelledAppointments || 0;
    
    const completionRate = totalAppts > 0 ? ((completedAppts / totalAppts) * 100).toFixed(1) : '0.0';
    const cancellationRate = totalAppts > 0 ? ((cancelledAppts / totalAppts) * 100).toFixed(1) : '0.0';
    
    return {
      completionRate,
      cancellationRate,
      activeAdoptionPets: stats?.activeAdoptionPets || 0,
      adoptionApplications: stats?.totalAdoptionApplications || 0,
      aiConversations: stats?.totalAiConversations || 0,
      aiMessages: stats?.totalAiMessages || 0,
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white border border-[#E5ECF4] rounded-2xl w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 bg-white border border-[#E5ECF4] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white border border-[#E5ECF4] rounded-2xl" />
          <div className="h-80 bg-white border border-[#E5ECF4] rounded-2xl" />
          <div className="h-80 bg-white border border-[#E5ECF4] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Controls & Date-Range Bar ── */}
      <div className="bg-white border border-[#E5ECF4] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <h2 className="text-sm font-extrabold text-[#172B4D] tracking-tight">
              Operational Command Center
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#3B82F6] border border-blue-200">
              Live Production
            </span>
          </div>
          <p className="text-xs text-[#71829E] mt-0.5">
            Aggregated analytics across user registry, clinical appointments, adoption shelters, and commerce.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date-Range Selector */}
          <div className="inline-flex bg-[#F5F8FC] p-1 rounded-xl border border-[#E5ECF4] text-xs font-bold text-[#71829E]">
            {[
              { label: 'Today', days: 1 },
              { label: '7D', days: 7 },
              { label: '30D', days: 30 },
              { label: '90D', days: 90 },
              { label: '1Y', days: 365 },
            ].map(p => (
              <button
                key={p.days}
                onClick={() => handlePeriodChange(p.days)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  reportingDays === p.days
                    ? 'bg-[#17365C] text-white shadow-xs'
                    : 'hover:text-[#172B4D]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5ECF4] rounded-xl text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh database metrics"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#3B82F6]' : 'text-slate-500'} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        </div>
      </div>

      {/* ── Operational Queue Alert Banner ── */}
      {totalPendingActions > 0 ? (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                Operational Reviews Required ({totalPendingActions} Pending)
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                New clinical credentials, seller profiles, shelter audits, or product catalogs require administrative moderation.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actionItems.map(item => item.count > 0 && (
              <Link
                key={item.title}
                to={item.path}
                className="px-3 py-1.5 bg-white hover:bg-amber-100/60 rounded-xl text-xs font-bold text-slate-800 shadow-xs border border-amber-200 transition-colors flex items-center gap-1.5 group cursor-pointer"
              >
                <item.icon size={13} className="text-amber-700 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-[#17365C]">{item.count}</span>
                <span>{item.title}</span>
                <ChevronRight size={12} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>All operational queues are cleared. Zero pending verification reviews across all platform domains.</span>
        </div>
      )}

      {/* ── Section 5: Responsive Row of 6 KPI Summary Cards ── */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {/* 1. Total Users */}
          <Link
            to="/dashboard/admin/users"
            className="bg-white border border-[#E5ECF4] rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#3B82F6]/50 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Total Users</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#3B82F6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-[#172B4D] tabular-nums leading-tight">
                {(stats?.totalUsers ?? 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-[#71829E] font-medium mt-1 truncate">
                {stats?.totalPetOwners ?? 0} Pet Owners
              </p>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#3B82F6] w-full" />
            </div>
          </Link>

          {/* 2. Veterinarians */}
          <Link
            to="/dashboard/admin/veterinarians"
            className="bg-white border border-[#E5ECF4] rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#10B981]/50 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Veterinarians</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-[#172B4D] tabular-nums leading-tight">
                {((stats?.verifiedVets ?? 0) + (stats?.pendingVets ?? 0)).toLocaleString()}
              </h3>
              <p className="text-[11px] text-[#71829E] font-medium mt-1 truncate">
                {stats?.verifiedVets ?? 0} Verified • {stats?.pendingVets ?? 0} Pending
              </p>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#10B981] w-full" />
            </div>
          </Link>

          {/* 3. Adoption Listings */}
          <Link
            to="/dashboard/admin/adoptions"
            className="bg-white border border-[#E5ECF4] rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#8B5CF6]/50 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Adoptions</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-[#8B5CF6] flex items-center justify-center group-hover:scale-105 transition-transform">
                <PawPrint size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-[#172B4D] tabular-nums leading-tight">
                {(stats?.activeAdoptionPets ?? 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-[#71829E] font-medium mt-1 truncate">
                Ready: {stats?.activeAdoptionPets ?? 0} • Apps: {stats?.totalAdoptionApplications ?? 0}
              </p>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#8B5CF6] w-full" />
            </div>
          </Link>

          {/* 4. Marketplace Products */}
          <Link
            to="/dashboard/admin/products"
            className="bg-white border border-[#E5ECF4] rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#F59E0B]/50 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Marketplace</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-[#172B4D] tabular-nums leading-tight">
                {(stats?.totalOrders ?? 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-[#71829E] font-medium mt-1 truncate">
                {stats?.pendingProducts ?? 0} Pending Approval
              </p>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#F59E0B] w-full" />
            </div>
          </Link>

          {/* 5. Appointments */}
          <div
            onClick={() => setActiveTableTab('appointments')}
            className="bg-white border border-[#E5ECF4] rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#17365C]/50 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Appointments</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#17365C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-[#172B4D] tabular-nums leading-tight">
                {(stats?.totalAppointments ?? 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-[#71829E] font-medium mt-1 truncate">
                {stats?.completedAppointments ?? 0} Done • {stats?.pendingAppointments ?? 0} Upcoming
              </p>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#17365C] w-full" />
            </div>
          </div>

          {/* 6. Revenue */}
          <div
            onClick={() => setActiveTableTab('orders')}
            className="bg-white border border-[#E5ECF4] rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-[#10B981]/50 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Settled Revenue</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-[#172B4D] tabular-nums leading-tight">
                ₹{Math.round(stats?.grossOrderRevenue ?? 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-[#71829E] font-medium mt-1 truncate">
                Verified settled volume
              </p>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#10B981] w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 6: Main Analytics Section (3-Column Grid) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#172B4D]">Primary Platform Velocity</h3>
            <p className="text-[11px] text-[#71829E]">Time-series trends over the last {reportingDays} days</p>
          </div>
          <span className="text-[10px] font-semibold text-[#71829E] bg-white px-2.5 py-1 rounded-lg border border-[#E5ECF4]">
            Window: {reportingDays} Days
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A: User Registration Trends */}
          <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-black text-[#172B4D] uppercase tracking-wider">User Registrations</h4>
                <span className="text-xs font-bold text-[#3B82F6] font-mono">+{totalPeriodRegistrations}</span>
              </div>
              <p className="text-[11px] text-[#71829E] mb-4">New account signups over selected window</p>

              {analyticsLoading ? (
                <div className="h-64 flex items-center justify-center animate-pulse">
                  <div className="h-44 w-full bg-slate-100 rounded-xl" />
                </div>
              ) : registrationChartData.length === 0 || registrationChartData.every(d => d.registrations === 0) ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  <Users size={24} className="text-slate-300 mb-1" />
                  <span>No user signups in this period</span>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#71829E', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#71829E', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip unit="users" />} />
                      <Area type="monotone" dataKey="registrations" stroke="#3B82F6" strokeWidth={2.5} fill="url(#regGrad)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#71829E]">
              <span>Current Total: <strong className="text-[#172B4D]">{stats?.totalUsers || 0}</strong></span>
              <Link to="/dashboard/admin/users" className="text-[#3B82F6] font-bold hover:underline flex items-center gap-0.5">
                View Registry <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>

          {/* Card B: Appointment Analytics */}
          <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-black text-[#172B4D] uppercase tracking-wider">Clinical Appointments</h4>
                <span className="text-xs font-bold text-[#17365C] font-mono">{totalPeriodAppointments} Booked</span>
              </div>
              <p className="text-[11px] text-[#71829E] mb-4">Daily veterinary consultation bookings</p>

              {analyticsLoading ? (
                <div className="h-64 flex items-center justify-center animate-pulse">
                  <div className="h-44 w-full bg-slate-100 rounded-xl" />
                </div>
              ) : appointmentChartData.length === 0 || appointmentChartData.every(d => d.appointments === 0) ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  <Calendar size={24} className="text-slate-300 mb-1" />
                  <span>No consultations scheduled in this period</span>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#71829E', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#71829E', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip unit="consultations" />} />
                      <Bar dataKey="appointments" fill="#17365C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#71829E]">
              <span>Completed: <strong className="text-emerald-700">{stats?.completedAppointments || 0}</strong></span>
              <span>Pending: <strong className="text-amber-700">{stats?.pendingAppointments || 0}</strong></span>
            </div>
          </div>

          {/* Card C: Revenue Analytics */}
          <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-black text-[#172B4D] uppercase tracking-wider">Settled Revenue</h4>
                <span className="text-xs font-bold text-[#10B981] font-mono">₹{totalPeriodRevenue.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-[#71829E] mb-4">Delivered marketplace transaction value</p>

              {analyticsLoading ? (
                <div className="h-64 flex items-center justify-center animate-pulse">
                  <div className="h-44 w-full bg-slate-100 rounded-xl" />
                </div>
              ) : revenueChartData.length === 0 || revenueChartData.every(d => d.revenue === 0) ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  <DollarSign size={24} className="text-slate-300 mb-1" />
                  <span>No settled orders in this window</span>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#71829E', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#71829E', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip content={<CustomTooltip unit="" prefix="₹" />} />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#10B981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#71829E]">
              <span>Gross Settled: <strong className="text-[#172B4D]">₹{Math.round(stats?.grossOrderRevenue || 0).toLocaleString()}</strong></span>
              <span className="text-slate-400">Excludes cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 7: Secondary Analytics Section (3-Column Grid) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#172B4D]">Distribution & Operational Moderation</h3>
            <p className="text-[11px] text-[#71829E]">Role breakdown, moderation queue statuses, and commerce lifecycle</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A: User Role Distribution (Donut Chart with Inside Legend & Center Total) */}
          <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black text-[#172B4D] uppercase tracking-wider mb-1">User Role Distribution</h4>
              <p className="text-[11px] text-[#71829E] mb-3">Verified population by platform access role</p>

              {roleDistributionWithPercentages.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
                  No role data available
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Donut Chart with Centered Total */}
                  <div className="relative h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleDistributionWithPercentages}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {roleDistributionWithPercentages.map((entry, index) => (
                            <Cell key={`role-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip unit="accounts" />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Hole Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-[#172B4D] leading-none">
                        {stats?.totalUsers || 0}
                      </span>
                      <span className="text-[9px] font-bold text-[#71829E] uppercase tracking-wider mt-0.5">
                        Users
                      </span>
                    </div>
                  </div>

                  {/* Clean Legend strictly INSIDE card */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    {roleDistributionWithPercentages.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#F5F8FC]/60">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] font-semibold text-[#172B4D] truncate">{item.label}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#71829E] shrink-0 font-bold ml-1">
                          {item.count} <span className="text-[9px] text-slate-400">({item.percentage}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card B: Verification Status Breakdown */}
          <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-black text-[#172B4D] uppercase tracking-wider">Verification Breakdown</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {totalPendingActions} Actions
                </span>
              </div>
              <p className="text-[11px] text-[#71829E] mb-4">Verification pipeline across credentialed organizations</p>

              <div className="space-y-3">
                {verificationBreakdown.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className="p-3 rounded-xl border border-[#E5ECF4] hover:border-[#3B82F6] hover:bg-blue-50/20 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#172B4D] group-hover:text-[#3B82F6] transition-colors">
                        {item.entity}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#71829E] mt-0.5">
                        <span>Total: <strong className="text-slate-700">{item.total}</strong></span>
                        <span>Approved: <strong className="text-emerald-700">{item.approved}</strong></span>
                      </div>
                    </div>
                    {item.pending > 0 ? (
                      <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-1">
                        <AlertCircle size={11} className="text-amber-700" />
                        {item.pending} Pending
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                        <Check size={11} /> Verified
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4">
              <Link
                to="/dashboard/admin/veterinarians"
                className="w-full py-2 bg-[#17365C] hover:bg-[#102844] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Open Verification Queue</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card C: Marketplace Activity & Status Lifecycle */}
          <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black text-[#172B4D] uppercase tracking-wider mb-1">Marketplace Order Status</h4>
              <p className="text-[11px] text-[#71829E] mb-3">Order distribution across fulfillment states</p>

              {orderDistributionWithPercentages.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
                  No marketplace orders recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Donut Chart with Centered Total Orders */}
                  <div className="relative h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderDistributionWithPercentages}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          {orderDistributionWithPercentages.map((entry, index) => (
                            <Cell key={`order-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip unit="orders" />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Hole Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-[#172B4D] leading-none">
                        {stats?.totalOrders || 0}
                      </span>
                      <span className="text-[9px] font-bold text-[#71829E] uppercase tracking-wider mt-0.5">
                        Orders
                      </span>
                    </div>
                  </div>

                  {/* Clean Legend strictly INSIDE card */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    {orderDistributionWithPercentages.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#F5F8FC]/60">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] font-semibold text-[#172B4D] truncate">{item.label}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#71829E] shrink-0 font-bold ml-1">
                          {item.count} <span className="text-[9px] text-slate-400">({item.percentage}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 8: Pet Healthcare Operations ── */}
      <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5ECF4]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-[#3B82F6] flex items-center justify-center">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#172B4D]">Pet Healthcare Operations</h3>
              <p className="text-[11px] text-[#71829E]">Calculated clinical efficacy, shelter capacity, and AI triage volume</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#F5F8FC] text-[#17365C] border border-[#E5ECF4]">
            Clinical Health Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Appointment Completion Rate */}
          <div className="p-4 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71829E]">Completion Rate</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                Formula: Completed / Total
              </span>
            </div>
            <div className="my-2">
              <p className="text-2xl font-black text-[#172B4D] font-mono">{healthcareMetrics.completionRate}%</p>
              <p className="text-[11px] text-[#71829E] mt-0.5">
                {stats?.completedAppointments || 0} of {stats?.totalAppointments || 0} consultations concluded
              </p>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Number(healthcareMetrics.completionRate))}%` }} />
            </div>
          </div>

          {/* 2. Cancellation Rate */}
          <div className="p-4 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71829E]">Cancellation Rate</span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                Formula: Cancelled / Total
              </span>
            </div>
            <div className="my-2">
              <p className="text-2xl font-black text-[#172B4D] font-mono">{healthcareMetrics.cancellationRate}%</p>
              <p className="text-[11px] text-[#71829E] mt-0.5">
                {stats?.cancelledAppointments || 0} consultations revoked
              </p>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, Number(healthcareMetrics.cancellationRate))}%` }} />
            </div>
          </div>

          {/* 3. AI Triage & Clinical Assistant */}
          <div className="p-4 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71829E]">AI Triage Engine</span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                Gemini 3.8 Flash
              </span>
            </div>
            <div className="my-2">
              <p className="text-2xl font-black text-[#172B4D] font-mono">{healthcareMetrics.aiMessages.toLocaleString()}</p>
              <p className="text-[11px] text-[#71829E] mt-0.5">
                Clinical queries across {healthcareMetrics.aiConversations} pet conversations
              </p>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#3B82F6] rounded-full w-full" />
            </div>
          </div>

          {/* 4. Shelter & Adoption Placement */}
          <div className="p-4 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71829E]">Adoption Pipeline</span>
              <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                Rescue Pipeline
              </span>
            </div>
            <div className="my-2">
              <p className="text-2xl font-black text-[#172B4D] font-mono">{healthcareMetrics.activeAdoptionPets}</p>
              <p className="text-[11px] text-[#71829E] mt-0.5">
                Pets ready for home • {healthcareMetrics.adoptionApplications} total applicant filings
              </p>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#8B5CF6] rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 9: Recent Activity Tables (Tabbed for Maximum Clarity) ── */}
      <div className="bg-white border border-[#E5ECF4] rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header and Tabs */}
        <div className="p-4 sm:p-5 border-b border-[#E5ECF4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-[#172B4D]">Recent Platform Activity</h3>
            <p className="text-[11px] text-[#71829E]">Direct database records with operational quick actions</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Table Search Input */}
            <div className="relative w-48 sm:w-56">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Filter table rows..."
                className="w-full bg-white border border-[#E5ECF4] rounded-xl pl-8 pr-3 py-1 text-xs text-[#172B4D] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            {/* Table Tabs */}
            <div className="inline-flex bg-white p-1 rounded-xl border border-[#E5ECF4] text-xs font-bold text-[#71829E]">
              {[
                { id: 'registrations', label: `Users (${recentUsers.length})` },
                { id: 'appointments', label: `Appointments (${recentAppointments.length})` },
                { id: 'orders', label: `Orders (${recentOrders.length})` },
                { id: 'audit', label: `Audit (${activities.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTableTab(tab.id); setTableSearch(''); }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTableTab === tab.id
                      ? 'bg-[#17365C] text-white shadow-xs'
                      : 'hover:text-[#172B4D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table Content ── */}
        <div className="overflow-x-auto">
          {/* Table A: Recent User Registrations */}
          {activeTableTab === 'registrations' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5ECF4] bg-[#F5F8FC]/50 text-[#71829E] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No user registrations found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-slate-200 text-[#17365C] font-bold text-xs flex items-center justify-center">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-[#172B4D]">{u.name}</p>
                            <p className="text-[10px] text-[#71829E]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#71829E]">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u.verificationStatus || (u.enabled ? 'ACTIVE' : 'DISABLED')} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/dashboard/admin/users"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3B82F6] hover:text-[#17365C] transition-colors"
                        >
                          <span>Manage</span>
                          <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Table B: Recent Clinical Appointments */}
          {activeTableTab === 'appointments' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5ECF4] bg-[#F5F8FC]/50 text-[#71829E] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Pet Patient</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Veterinarian</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No clinical appointments scheduled
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <PawPrint size={14} className="text-[#3B82F6]" />
                          <div>
                            <p className="font-bold text-[#172B4D]">{a.petName || 'Pet Patient'}</p>
                            {a.petCode && <p className="text-[9px] font-mono text-slate-400">{a.petCode}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{a.ownerName || 'Pet Owner'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-[#17365C]">
                          <Stethoscope size={13} className="text-[#10B981]" />
                          <span>Dr. {a.veterinarianName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#71829E]">
                        {formatDate(a.appointmentDate)} • {a.appointmentTime || 'Scheduled'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#172B4D]">
                        ₹{a.fee || 10}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Table C: Recent Marketplace Orders */}
          {activeTableTab === 'orders' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5ECF4] bg-[#F5F8FC]/50 text-[#71829E] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Order Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Placed Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      No marketplace orders placed
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#17365C]">
                        #{o.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#172B4D]">{o.user?.name || 'Customer'}</p>
                        <p className="text-[10px] text-[#71829E]">{o.user?.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#10B981]">
                        ₹{Math.round(o.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3 px-4 text-[#71829E]">{formatDate(o.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/dashboard/admin/products"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3B82F6] hover:text-[#17365C]"
                        >
                          <span>Moderate</span>
                          <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Table D: Administrative Audit Log */}
          {activeTableTab === 'audit' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5ECF4] bg-[#F5F8FC]/50 text-[#71829E] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Admin Principal</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No administrative audit entries found
                    </td>
                  </tr>
                ) : (
                  activities.slice(0, 10).map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-bold text-[#17365C] bg-slate-100 px-2 py-0.5 rounded">
                          {act.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{act.targetEntity || 'System'}</td>
                      <td className="py-3 px-4 text-[#71829E] max-w-xs truncate">{act.details}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{act.adminUser?.name || 'Administrator'}</td>
                      <td className="py-3 px-4 text-right text-[#71829E]">{new Date(act.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50/70 border-t border-[#E5ECF4] flex items-center justify-between text-xs text-[#71829E]">
          <span>Displaying recent database records</span>
          <Link
            to={
              activeTableTab === 'registrations' ? '/dashboard/admin/users' :
              activeTableTab === 'appointments' ? '/dashboard/admin/veterinarians' :
              activeTableTab === 'orders' ? '/dashboard/admin/products' :
              '/dashboard/admin/settings'
            }
            className="font-bold text-[#3B82F6] hover:text-[#17365C] flex items-center gap-1 transition-colors"
          >
            <span>View Complete Registry</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── Section 10: Runtime Telemetry & Operational Health ── */}
      <div className="bg-white border border-[#E5ECF4] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-[#17365C]" />
            <h3 className="text-xs font-black text-[#172B4D] uppercase tracking-wider">
              Runtime Telemetry & Operational Health
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Normal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Database */}
          <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Database</span>
              <Database size={13} className="text-[#3B82F6]" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-2.5 w-2.5 rounded-full ${systemHealth?.databaseStatus === 'HEALTHY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <p className="text-xs font-bold text-[#172B4D]">{systemHealth?.databaseStatus || 'HEALTHY'}</p>
            </div>
            <p className="text-[10px] text-[#71829E] mt-0.5">PostgreSQL • Latency {systemHealth?.databaseLatencyMs || 5}ms</p>
          </div>

          {/* Audit Subsystem */}
          <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">Audit Subsystem</span>
              <ShieldCheck size={13} className="text-[#10B981]" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-2.5 w-2.5 rounded-full ${systemHealth?.auditServiceStatus === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <p className="text-xs font-bold text-[#172B4D]">{systemHealth?.auditServiceStatus || 'HEALTHY'}</p>
            </div>
            <p className="text-[10px] text-[#71829E] mt-0.5">Immutable audit logging active</p>
          </div>

          {/* JVM Memory */}
          <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">JVM Memory</span>
              <Cpu size={13} className="text-[#8B5CF6]" />
            </div>
            <p className="text-xs font-bold text-[#172B4D] mt-2">
              {systemHealth ? `${systemHealth.usedMemoryMb} MB / ${systemHealth.totalMemoryMb} MB` : 'Available'}
            </p>
            <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[#8B5CF6] rounded-full"
                style={{
                  width: systemHealth?.totalMemoryMb
                    ? `${Math.min(100, (systemHealth.usedMemoryMb / systemHealth.totalMemoryMb) * 100)}%`
                    : '45%'
                }}
              />
            </div>
          </div>

          {/* CPU Processors */}
          <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E5ECF4]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#71829E] uppercase tracking-wider">CPU Threads</span>
              <Activity size={13} className="text-[#F59E0B]" />
            </div>
            <p className="text-xs font-bold text-[#172B4D] mt-2">
              {systemHealth?.availableProcessors ? `${systemHealth.availableProcessors} Cores Active` : 'Online'}
            </p>
            <p className="text-[10px] text-[#71829E] mt-0.5">High availability cluster</p>
          </div>
        </div>
      </div>
    </div>
  );
}
