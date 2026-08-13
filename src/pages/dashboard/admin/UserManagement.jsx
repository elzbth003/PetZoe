import React, { useEffect, useState } from 'react';
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
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
