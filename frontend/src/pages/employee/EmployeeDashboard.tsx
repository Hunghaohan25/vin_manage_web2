import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { CalendarCheck, Clock, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
  const { currentUser, todayRecord, fetchTodayRecord, leaveRequests, fetchMyLeaves } = useAuth();

  useEffect(() => {
    fetchTodayRecord();
    fetchMyLeaves();
  }, [fetchTodayRecord, fetchMyLeaves]);

  if (!currentUser) return null;

  const pending = leaveRequests.filter((lr) => lr.status === 'Pending').length;
  const approved = leaveRequests.filter((lr) => lr.status === 'Approved').length;

  const statusLabel = todayRecord
    ? todayRecord.check_out_time
      ? `Completed · ${todayRecord.working_hours}h`
      : `Checked in at ${todayRecord.check_in_time}`
    : 'Not checked in yet';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Good day, {currentUser.name.split(' ').pop()} 👋</h1>
        <p className="text-surface-500 mt-1">Here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard icon={CalendarCheck} label="Today's Status" value={todayRecord?.status ?? 'N/A'} trend={statusLabel} color={todayRecord?.status === 'Late' ? 'orange' : 'green'} />
        <StatCard icon={Clock} label="Working Hours" value={todayRecord?.working_hours ? `${todayRecord.working_hours}h` : '—'} color="blue" />
        <StatCard icon={FileText} label="Leave Requests" value={leaveRequests.length} trend={`${pending} pending`} color="purple" />
        <StatCard icon={CheckCircle2} label="Approved Leaves" value={approved} color="green" />
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-800">Recent Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {leaveRequests.slice(0, 5).map((lr) => (
                <tr key={lr.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-surface-700">{lr.leave_type}</td>
                  <td className="px-6 py-3 text-surface-500">{lr.start_date} → {lr.end_date}</td>
                  <td className="px-6 py-3"><StatusBadge status={lr.status} /></td>
                </tr>
              ))}
              {leaveRequests.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-surface-400">No leave requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Pending: 'bg-warning-400/15 text-warning-600',
    Approved: 'bg-success-400/15 text-success-600',
    Rejected: 'bg-danger-400/15 text-danger-600',
    'On-time': 'bg-success-400/15 text-success-600',
    Late: 'bg-warning-400/15 text-warning-600',
    Absent: 'bg-danger-400/15 text-danger-600',
  };
  const IconMap: Record<string, React.FC<{ size: number }>> = {
    Pending: AlertCircle,
    Approved: CheckCircle2,
    Rejected: XCircle,
  };
  const Icon = IconMap[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? 'bg-surface-100 text-surface-600'}`}>
      {Icon && <Icon size={13} />}
      {status}
    </span>
  );
};

export default EmployeeDashboard;
