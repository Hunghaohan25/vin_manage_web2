import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { StatusBadge } from '../employee/EmployeeDashboard';
import { Users, AlertCircle, CalendarCheck, TrendingUp } from 'lucide-react';

const ManagerDashboard: React.FC = () => {
  const { currentUser, fetchTeamAttendance, attendance, leaveRequests, fetchAllLeaves, fetchEmployees, employees } = useAuth();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchTeamAttendance(today);
    fetchAllLeaves();
    fetchEmployees();
  }, [fetchTeamAttendance, fetchAllLeaves, fetchEmployees]);

  if (!currentUser) return null;

  const pendingLeaves = leaveRequests.filter((lr) => lr.status === 'Pending');
  const onTimeToday = attendance.filter((a) => a.status === 'On-time').length;
  const lateToday = attendance.filter((a) => a.status === 'Late').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Manager Dashboard</h1>
        <p className="text-surface-500 mt-1">Overview of your team's attendance and leave status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard icon={Users} label="Total Employees" value={employees.length} color="blue" />
        <StatCard icon={AlertCircle} label="Pending Leaves" value={pendingLeaves.length} trend="Awaiting approval" color="orange" />
        <StatCard icon={CalendarCheck} label="Checked In Today" value={`${attendance.length}/${employees.length}`} color="green" />
        <StatCard icon={TrendingUp} label="On-time Today" value={onTimeToday} trend={`${lateToday} late`} color="purple" />
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-800">Today's Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Check-in</th>
                <th className="px-6 py-3 font-medium">Check-out</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xs font-bold text-white">
                        {(rec.employee?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-surface-700">{rec.employee?.name ?? `#${rec.employee_id}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-surface-600">{rec.check_in_time ?? '—'}</td>
                  <td className="px-6 py-3 text-surface-600">{rec.check_out_time ?? '—'}</td>
                  <td className="px-6 py-3"><StatusBadge status={rec.status} /></td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-surface-400">No attendance records for today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-800">Pending Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {pendingLeaves.slice(0, 5).map((lr) => (
                <tr key={lr.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-surface-700">{lr.employee?.name ?? `#${lr.employee_id}`}</td>
                  <td className="px-6 py-3 text-surface-600">{lr.leave_type}</td>
                  <td className="px-6 py-3 text-surface-500 whitespace-nowrap">{lr.start_date} → {lr.end_date}</td>
                  <td className="px-6 py-3 text-surface-500 max-w-[200px] truncate">{lr.reason}</td>
                </tr>
              ))}
              {pendingLeaves.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-surface-400">No pending leave requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
