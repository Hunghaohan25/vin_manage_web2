import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

// ── Types (kept for frontend compatibility) ──────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  avatar: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  shift_code: 'internal_0800' | 'internal_0900' | 'customer_ca1' | 'customer_ca2';
  check_in_time: string | null;
  check_out_time: string | null;
  working_hours: number | null;
  status: 'On-time' | 'Late' | 'Absent';
  shift?: {
    code: 'internal_0800' | 'internal_0900' | 'customer_ca1' | 'customer_ca2';
    name: string;
    start: string;
    end: string;
  };
  employee?: { id: number; name: string; avatar: string | null; department: string };
}

export type ShiftCode = 'internal_0800' | 'internal_0900' | 'customer_ca1' | 'customer_ca2';

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Unpaid Leave';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  approved_by: number | null;
  approved_at: string | null;
  employee?: { id: number; name: string; avatar: string | null };
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // Attendance
  attendance: AttendanceRecord[];
  fetchAttendance: () => Promise<void>;
  fetchTeamAttendance: (date?: string, employeeId?: string) => Promise<void>;
  checkIn: (shiftCode?: ShiftCode) => Promise<AttendanceRecord | null>;
  checkOut: () => Promise<AttendanceRecord | null>;
  todayRecord: AttendanceRecord | null;
  fetchTodayRecord: () => Promise<void>;
  // Leave
  leaveRequests: LeaveRequest[];
  fetchMyLeaves: () => Promise<void>;
  fetchAllLeaves: () => Promise<void>;
  createLeaveRequest: (data: { leave_type: string; start_date: string; end_date: string; reason: string }) => Promise<LeaveRequest>;
  approveLeave: (id: number) => Promise<void>;
  rejectLeave: (id: number) => Promise<void>;
  // User management (admin)
  managedUsers: User[];
  fetchUsers: () => Promise<void>;
  addUser: (formData: FormData) => Promise<User>;
  updateUser: (id: number, formData: FormData) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  // Helpers
  getUserById: (id: number) => User | undefined;
  allUsers: User[];
  employees: User[];
  fetchEmployees: () => Promise<void>;
  apiBaseUrl: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [managedUsers, setManagedUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);

  // Restore session from token
  useEffect(() => {
    const token = localStorage.getItem('vinhrm_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => setCurrentUser(res.data))
        .catch(() => { localStorage.removeItem('vinhrm_token'); localStorage.removeItem('vinhrm_user'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Auth ───────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('vinhrm_token', res.data.token);
      localStorage.setItem('vinhrm_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vinhrm_token');
    localStorage.removeItem('vinhrm_user');
    setCurrentUser(null);
    setAttendance([]);
    setLeaveRequests([]);
    setManagedUsers([]);
    setTodayRecord(null);
  }, []);

  // ── Attendance ─────────────────────────────────────────
  const fetchTodayRecord = useCallback(async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayRecord(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await api.get('/attendance/history');
      setAttendance(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchTeamAttendance = useCallback(async (date?: string, employeeId?: string) => {
    try {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      if (employeeId) params.employee_id = employeeId;
      const res = await api.get('/attendance/team', { params });
      setAttendance(res.data);
    } catch { /* ignore */ }
  }, []);

  const checkIn = useCallback(async (shiftCode?: ShiftCode) => {
    try {
      const res = await api.post('/attendance/checkin', shiftCode ? { shift_code: shiftCode } : {});
      setTodayRecord(res.data);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  const checkOut = useCallback(async () => {
    try {
      const res = await api.post('/attendance/checkout');
      setTodayRecord(res.data);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  // ── Leave ──────────────────────────────────────────────
  const fetchMyLeaves = useCallback(async () => {
    try {
      const res = await api.get('/leave/my');
      setLeaveRequests(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchAllLeaves = useCallback(async () => {
    try {
      const res = await api.get('/leave/all');
      setLeaveRequests(res.data);
    } catch { /* ignore */ }
  }, []);

  const createLeaveRequest = useCallback(async (data: { leave_type: string; start_date: string; end_date: string; reason: string }) => {
    const res = await api.post('/leave', data);
    setLeaveRequests((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const approveLeave = useCallback(async (id: number) => {
    const res = await api.put(`/leave/${id}/approve`);
    setLeaveRequests((prev) => prev.map((lr) => (lr.id === id ? res.data : lr)));
  }, []);

  const rejectLeave = useCallback(async (id: number) => {
    const res = await api.put(`/leave/${id}/reject`);
    setLeaveRequests((prev) => prev.map((lr) => (lr.id === id ? res.data : lr)));
  }, []);

  // ── User Management (Admin) ────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setManagedUsers(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get('/users/employees');
      setEmployees(res.data);
    } catch { /* ignore */ }
  }, []);

  const addUser = useCallback(async (formData: FormData) => {
    const res = await api.post('/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setManagedUsers((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const updateUser = useCallback(async (id: number, formData: FormData) => {
    const res = await api.put(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setManagedUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    await api.delete(`/users/${id}`);
    setManagedUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const getUserById = useCallback(
    (id: number) => managedUsers.find((u) => u.id === id) || employees.find((u) => u.id === id),
    [managedUsers, employees],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        attendance,
        fetchAttendance,
        fetchTeamAttendance,
        checkIn,
        checkOut,
        todayRecord,
        fetchTodayRecord,
        leaveRequests,
        fetchMyLeaves,
        fetchAllLeaves,
        createLeaveRequest,
        approveLeave,
        rejectLeave,
        managedUsers,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
        allUsers: managedUsers,
        employees,
        fetchEmployees,
        apiBaseUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
