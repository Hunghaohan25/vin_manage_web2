import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from './EmployeeDashboard';
import { Plus, X, FileText, Send } from 'lucide-react';

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Unpaid Leave'] as const;

const LeaveRequestPage: React.FC = () => {
  const { currentUser, leaveRequests, fetchMyLeaves, createLeaveRequest } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [flash, setFlash] = useState('');

  useEffect(() => { fetchMyLeaves(); }, [fetchMyLeaves]);

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.start_date || !formData.end_date) { setFormError('Please select start and end dates.'); return; }
    if (formData.start_date > formData.end_date) { setFormError('Start date must be before or equal to end date.'); return; }
    if (!formData.reason.trim()) { setFormError('Reason cannot be empty.'); return; }

    try {
      await createLeaveRequest(formData);
      setShowForm(false);
      setFormData({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
      setFlash('✅ Leave request submitted successfully!');
      setTimeout(() => setFlash(''), 4000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Leave Requests</h1>
          <p className="text-surface-500 mt-1">Submit and track your leave requests.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:brightness-110 transition-all">
          <Plus size={18} /> Create Request
        </button>
      </div>

      {flash && (
        <div className="rounded-xl bg-success-400/10 border border-success-400/30 px-5 py-3 text-sm font-medium text-success-600 animate-scale-in">{flash}</div>
      )}

      {showForm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-surface-200 animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600"><FileText size={18} /></div>
                <h3 className="text-lg font-semibold text-surface-800">New Leave Request</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-100 text-surface-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Leave Type</label>
                <select value={formData.leave_type} onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all">
                  {leaveTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Start Date</label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">End Date</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Reason</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={3}
                  placeholder="Explain your reason for leave..."
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none" required />
              </div>
              {formError && <p className="text-sm text-danger-500 bg-danger-400/10 rounded-lg px-3 py-2">{formError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:brightness-110 transition-all">
                  <Send size={16} /> Submit
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-800">My Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium whitespace-nowrap">Leave Type</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Start Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">End Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Reason</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {leaveRequests.map((lr) => (
                <tr key={lr.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-surface-700 whitespace-nowrap">{lr.leave_type}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{lr.start_date}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{lr.end_date}</td>
                  <td className="px-6 py-3 text-surface-500 max-w-[200px] truncate">{lr.reason}</td>
                  <td className="px-6 py-3"><StatusBadge status={lr.status} /></td>
                  <td className="px-6 py-3 text-surface-400 whitespace-nowrap">{lr.created_at}</td>
                </tr>
              ))}
              {leaveRequests.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-surface-400">No leave requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestPage;
