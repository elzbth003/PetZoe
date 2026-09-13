import React from 'react';
import NotificationCenter from '../../../components/dashboard/NotificationCenter';
import { Bell } from 'lucide-react';

export default function AdminNotifications() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Notifications Center</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage administrative notices, system alerts, and approval requests.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <NotificationCenter />
      </div>
    </div>
  );
}
