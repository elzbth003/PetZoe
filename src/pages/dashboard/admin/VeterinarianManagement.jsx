import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Stethoscope, Search, Filter, MoreVertical, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SelectDropdown from '../../../components/ui/SelectDropdown';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
    RESUBMISSION_REQUIRED: 'bg-orange-100 text-orange-700 border-orange-200',
    NOT_SUBMITTED: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.NOT_SUBMITTED}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default function VeterinarianManagement() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { showToast } = useToast();

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getVeterinarians();
      setVets(response.data);
    } catch (err) {
      showToast('Failed to load veterinarians', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredVets = vets.filter(vet => {
    const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vet.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || vet.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Stethoscope size={24} className="text-slate-500" />
            Veterinarian Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage veterinarian applications</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
            />
          </div>
          <div className="w-52 shrink-0">
            <SelectDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              icon={Filter}
              size="sm"
              buttonClassName="bg-white border-slate-200 text-xs font-semibold"
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending Review', badge: 'Pending' },
                { value: 'UNDER_REVIEW', label: 'Under Review', badge: 'Review' },
                { value: 'RESUBMISSION_REQUIRED', label: 'Resubmission Req', badge: 'Action' },
                { value: 'APPROVED', label: 'Approved', badge: 'Active' },
                { value: 'REJECTED', label: 'Rejected', badge: 'Alert' }
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
              <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="p-4 border-b border-slate-100">Veterinarian</th>
                <th className="p-4 border-b border-slate-100">Specialization</th>
                <th className="p-4 border-b border-slate-100">Experience</th>
                <th className="p-4 border-b border-slate-100">Status</th>
                <th className="p-4 border-b border-slate-100">Submitted Date</th>
                <th className="p-4 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">Loading veterinarians...</td>
                </tr>
              ) : filteredVets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No veterinarians found.</td>
                </tr>
              ) : (
                filteredVets.map(vet => (
                  <tr key={vet.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{vet.name}</div>
                      <div className="text-xs text-slate-500">{vet.email}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{vet.specialization || 'General Practice'}</td>
                    <td className="p-4 text-slate-600">{vet.experience ? `${vet.experience} years` : 'N/A'}</td>
                    <td className="p-4">
                      <StatusBadge status={vet.verificationStatus} />
                    </td>
                    <td className="p-4 text-slate-600">
                      {vet.profileSubmittedAt ? new Date(vet.profileSubmittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        to={`/dashboard/admin/veterinarians/${vet.userId}`}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Review Profile"
                      >
                        <Eye size={18} />
                      </Link>
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
