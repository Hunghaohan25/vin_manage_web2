import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../employee/EmployeeDashboard';
import { Check, X, ClipboardCheck, AlertCircle } from 'lucide-react';

const LeaveApprovalPage: React.FC = () => {
  const { leaveRequests, fetchAllLeaves, approveLeave, rejectLeave } = useAuth();
  const [flash, setFlash] = useState('');
  const [tab, setTab] = useState<'Pending' | 'All'>('Pending');

  useEffect(() => { fetchAllLeaves(); }, [fetchAllLeaves]);

  const shown = tab === 'Pending' ? leaveRequests.filter((lr) => lr.status === 'Pending') : leaveRequests;

  const handleApprove = async (id: number) => {
    await approveLeave(id);
    setFlash('✅ Leave request approved.');
    setTimeout(() => setFlash(''), 3000);
  };

  const handleReject = async (id: number) => {
    await rejectLeave(id);
    setFlash('❌ Leave request rejected.');
    setTimeout(() => setFlash(''), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Leave Approval</h1>
        <p className="text-surface-500 mt-1">Review and manage employee leave requests.</p>
      </div>

      {flash && (
        <div className="rounded-xl bg-primary-50 border border-primary-200 px-5 py-3 text-sm font-medium text-primary-700 animate-scale-in">{flash}</div>
      )}

      <div className="flex gap-2">
        {(['Pending', 'All'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${tab === t ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white text-surface-500 border border-surface-200 hover:bg-surface-50'}`}>
            {t === 'Pending' && <AlertCircle size={14} className="inline mr-1.5 -mt-0.5" />}
            {t === 'All' && <ClipboardCheck size={14} className="inline mr-1.5 -mt-0.5" />}
            {t} {t === 'Pending' && `(${leaveRequests.filter((l) => l.status === 'Pending').length})`}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium whitespace-nowrap">Employee</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Leave Type</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Period</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Reason</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {shown.map((lr) => (
                <tr key={lr.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xs font-bold text-white shrink-0">
                        {(lr.employee?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-surface-700 whitespace-nowrap">{lr.employee?.name ?? `#${lr.employee_id}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{lr.leave_type}</td>
                  <td className="px-6 py-3 text-surface-500 whitespace-nowrap">{lr.start_date} → {lr.end_date}</td>
                  <td className="px-6 py-3 text-surface-500 max-w-[200px] truncate">{lr.reason}</td>
                  <td className="px-6 py-3"><StatusBadge status={lr.status} /></td>
                  <td className="px-6 py-3">
                    {lr.status === 'Pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(lr.id)}
                          className="flex items-center gap-1 rounded-lg bg-success-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-success-600 transition-colors shadow-sm">
                          <Check size={14} /> Approve
                        </button>
                        <button onClick={() => handleReject(lr.id)}
                          className="flex items-center gap-1 rounded-lg bg-danger-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger-600 transition-colors shadow-sm">
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : <span className="text-xs text-surface-400">—</span>}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-surface-400">{tab === 'Pending' ? 'No pending leave requests.' : 'No leave requests found.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
