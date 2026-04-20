import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { Users, Shield, UserCheck, UserX } from 'lucide-react';
import UserAvatar from '../../components/UserAvatar';

const AdminDashboard: React.FC = () => {
  const { managedUsers, leaveRequests, fetchUsers, fetchAllLeaves } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchAllLeaves();
  }, [fetchUsers, fetchAllLeaves]);

  const employees = managedUsers.filter((u) => u.role === 'employee');
  const managers = managedUsers.filter((u) => u.role === 'manager');
  const inactiveUsers = managedUsers.filter((u) => (u as any).status === 'Inactive').length;
  const pendingLeaves = leaveRequests.filter((lr) => lr.status === 'Pending').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Admin Dashboard</h1>
        <p className="text-surface-500 mt-1">System overview and user management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 stagger">
        <StatCard icon={Users} label="Total Users" value={managedUsers.length} color="blue" />
        <StatCard icon={UserCheck} label="Employees" value={employees.length} color="green" />
        <StatCard icon={Shield} label="Managers" value={managers.length} color="purple" />
        <StatCard icon={UserX} label="Inactive" value={inactiveUsers} color="red" />
        <StatCard icon={UserX} label="Pending Leaves" value={pendingLeaves} trend="System-wide" color="orange" />
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-800">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {managedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} />
                      <span className="font-medium text-surface-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-surface-500">{u.email}</td>
                  <td className="px-6 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-3 text-surface-500">{u.department}</td>
                  <td className="px-6 py-3 text-surface-400">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, string> = {
    employee: 'bg-primary-50 text-primary-600',
    manager: 'bg-accent-400/15 text-accent-600',
    admin: 'bg-danger-400/15 text-danger-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[role] ?? 'bg-surface-100 text-surface-600'}`}>
      {role}
    </span>
  );
};

export default AdminDashboard;
