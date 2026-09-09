import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Users, Search, CheckCircle, XCircle, MoreVertical, 
  User as UserIcon, Calendar, Mail, Phone, Shield, ShieldAlert, X
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, pendingVerification: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  
  // UI States
  const [actionMenuId, setActionMenuId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // For Drawer
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, user: null, targetStatus: null });

  const { showToast } = useToast();
  const { user: currentUser } = useAuth(); // to prevent deactivating self visually

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, summaryRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getUserSummary()
      ]);
      setUsers(usersRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      showToast("Failed to fetch user data", "error");
    } finally {
      setLoading(false);
    }
  };

  const executeStatusChange = async () => {
    const { user, targetStatus } = confirmModal;
    try {
      await adminApi.toggleUserStatus(user.id, targetStatus);
      showToast(`User ${targetStatus ? 'activated' : 'deactivated'} successfully.`, "success");
      
      // Update local state without full reload
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: targetStatus } : u));
      
      // Update summary based on change
      setSummary(prev => ({
        ...prev,
        activeUsers: targetStatus ? prev.activeUsers + 1 : prev.activeUsers - 1,
        inactiveUsers: targetStatus ? prev.inactiveUsers - 1 : prev.inactiveUsers + 1
      }));

      // Update drawer if open
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => ({ ...prev, enabled: targetStatus }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setConfirmModal({ isOpen: false, user: null, targetStatus: null });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? u.enabled : !u.enabled);
    const vStatus = u.verificationStatus || 'NOT_SUBMITTED';
    const matchesVerification = verificationFilter === 'All' || vStatus === verificationFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  });

  const getRoleBadgeColor = (role) => {
    if (role === 'Admin') return 'bg-purple-100 text-purple-700';
    if (role === 'Veterinarian') return 'bg-blue-100 text-blue-700';
    if (role === 'Marketplace Seller') return 'bg-orange-100 text-orange-700';
    if (role === 'Shelter Manager') return 'bg-teal-100 text-teal-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">User Management</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage users, roles, verification and account access.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Users', value: summary.activeUsers, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive Users', value: summary.inactiveUsers, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Pending Review', value: summary.pendingVerification, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium text-slate-700"
          />
        </div>
        
        <div className="flex w-full lg:w-auto gap-3 flex-wrap md:flex-nowrap">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:w-40 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Pet Owner">Pet Owner</option>
            <option value="Veterinarian">Veterinarian</option>
            <option value="Shelter Manager">Shelter Manager</option>
            <option value="Marketplace Seller">Marketplace Seller</option>
            <option value="Admin">Admin</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-32 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select 
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="flex-1 md:w-40 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="NOT_SUBMITTED">Not Submitted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">No users found matching filters.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                          <p className="text-xs font-medium text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${
                        user.verificationStatus === 'APPROVED' ? 'text-emerald-600' :
                        user.verificationStatus === 'PENDING' ? 'text-amber-600' :
                        user.verificationStatus === 'REJECTED' ? 'text-rose-600' :
                        'text-slate-400'
                      }`}>
                        {(user.verificationStatus || 'NOT_SUBMITTED').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.enabled ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className="text-xs font-bold text-slate-700">{user.enabled ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {/* Action Menu Dropdown */}
                      {actionMenuId === user.id && (
                        <div 
                          className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-20 text-left animate-in fade-in zoom-in-95 duration-100"
                          onMouseLeave={() => setActionMenuId(null)}
                        >
                          <button 
                            onClick={() => { setSelectedUser(user); setActionMenuId(null); }}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left"
                          >
                            View Profile
                          </button>
                          
                          {user.role !== 'Admin' && (!currentUser || currentUser.email !== user.email) && (
                            <>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button 
                                onClick={() => {
                                  setConfirmModal({ isOpen: true, user, targetStatus: !user.enabled });
                                  setActionMenuId(null);
                                }}
                                className={`w-full px-4 py-2.5 text-xs font-semibold text-left transition-colors ${
                                  user.enabled ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {user.enabled ? 'Deactivate User' : 'Activate User'}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className={`text-lg font-black mb-2 ${confirmModal.targetStatus === false ? 'text-rose-600' : 'text-emerald-600'}`}>
              {confirmModal.targetStatus === false ? 'Deactivate User?' : 'Activate User?'}
            </h3>
            <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
              {confirmModal.targetStatus === false 
                ? `Are you sure you want to deactivate ${confirmModal.user?.name}? This will prevent the user from accessing PetZoe while preserving their existing records.`
                : `Are you sure you want to reactivate the account for ${confirmModal.user?.name}? They will regain access to the platform.`}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, user: null, targetStatus: null })}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={executeStatusChange}
                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors text-xs ${
                  confirmModal.targetStatus === false ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModal.targetStatus === false ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Drawer (Right Side) */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedUser(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">User Profile</h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-600">
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedUser.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{selectedUser.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <Mail size={16} className="text-slate-400" /> {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <Phone size={16} className="text-slate-400" /> {selectedUser.phone || 'Not provided'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</h4>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500 flex items-center gap-2"><Calendar size={16}/> Joined Date</span>
                    <span className="font-bold text-slate-800">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500 flex items-center gap-2"><Shield size={16}/> Verification</span>
                    <span className="font-bold text-slate-800">{(selectedUser.verificationStatus || 'NOT_SUBMITTED').replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500 flex items-center gap-2"><UserIcon size={16}/> Status</span>
                    <span className={`font-bold ${selectedUser.enabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedUser.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.role !== 'Admin' && (!currentUser || currentUser.email !== selectedUser.email) && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Actions</h4>
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, user: selectedUser, targetStatus: !selectedUser.enabled })}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-colors border ${
                      selectedUser.enabled 
                        ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {selectedUser.enabled ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                  <p className="text-[10px] font-medium text-slate-500 text-center px-4 leading-relaxed">
                    {selectedUser.enabled 
                      ? "Deactivating will immediately revoke this user's access to the platform." 
                      : "Activating will restore this user's ability to log in and use the platform."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Users, Search, CheckCircle, XCircle } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.filter(u => u.role !== 'Admin'));
    } catch (err) {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await adminApi.toggleUserStatus(id, !currentStatus);
      showToast(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, "success");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none"
          />
        </div>
        
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none bg-white"
        >
          <option value="All">All Roles</option>
          <option value="Pet Owner">Pet Owner</option>
          <option value="Veterinarian">Veterinarian</option>
          <option value="Shelter Manager">Shelter Manager</option>
          <option value="Marketplace Seller">Marketplace Seller</option>

        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Verification</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        user.verificationStatus === 'APPROVED' ? 'bg-slate-200 text-slate-700' :
                        user.verificationStatus === 'PENDING' ? 'bg-slate-150 text-slate-600' :
                        (!user.verificationStatus || user.verificationStatus === 'NOT_SUBMITTED') ? 'bg-slate-100 text-slate-500' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {(user.verificationStatus ?? 'NOT_SUBMITTED').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.enabled ? (
                        <span className="flex items-center gap-1 text-slate-600 text-xs font-bold">
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                          <XCircle size={14} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {user.role !== 'Admin' && (
                        <button
                          onClick={() => toggleStatus(user.id, user.enabled)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            user.enabled 
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {user.enabled ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
