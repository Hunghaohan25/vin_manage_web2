import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../employee/EmployeeDashboard';
import { Filter } from 'lucide-react';

function formatHoursToHHmmss(hours: number | null) {
  if (hours === null || Number.isNaN(hours)) return '—';

  const totalSeconds = Math.max(0, Math.round(hours * 3600));
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatShiftLabel(shiftCode?: string, shiftName?: string) {
  if (shiftName) return shiftName;
  if (shiftCode === 'customer_ca1') return 'Shift 1';
  if (shiftCode === 'customer_ca2') return 'Shift 2';
  return '—';
}

const TeamAttendancePage: React.FC = () => {
  const { fetchTeamAttendance, attendance, fetchEmployees, employees } = useAuth();
  const [dateFilter, setDateFilter] = useState('');
  const [empFilter, setEmpFilter] = useState('');

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    fetchTeamAttendance(dateFilter || undefined, empFilter || undefined);
  }, [dateFilter, empFilter, fetchTeamAttendance]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Team Attendance</h1>
        <p className="text-surface-500 mt-1">View and filter your team's attendance records.</p>
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 text-surface-500">
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-45">
            <label className="block text-xs font-medium text-surface-500 mb-1">Date</label>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
          </div>
          <div className="flex-1 min-w-45">
            <label className="block text-xs font-medium text-surface-500 mb-1">Employee</label>
            <select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all">
              <option value="">All Employees</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setDateFilter(''); setEmpFilter(''); }}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-surface-500 border border-surface-200 hover:bg-surface-100 transition-colors">Reset</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-800">Records</h2>
          <span className="text-sm text-surface-400">{attendance.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium whitespace-nowrap">Employee</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Shift</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Check-in</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Check-out</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Hours</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {attendance.map((a) => (
                <tr key={a.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-accent-400 text-xs font-bold text-white shrink-0">
                        {(a.employee?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-surface-700 whitespace-nowrap">{a.employee?.name ?? `#${a.employee_id}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{a.date}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{formatShiftLabel(a.shift_code, a.shift?.name)}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{a.check_in_time ?? '—'}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{a.check_out_time ?? '—'}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{formatHoursToHHmmss(a.working_hours)}</td>
                  <td className="px-6 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-surface-400">No records match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamAttendancePage;
