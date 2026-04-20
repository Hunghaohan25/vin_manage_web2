import React, { useState, useEffect } from 'react';
import { ShiftCode, useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatusBadge } from './EmployeeDashboard';
import { LogIn, LogOut, Clock, CalendarDays } from 'lucide-react';

const DEFAULT_SHIFT_OPTIONS: Array<{ code: ShiftCode; label: string }> = [
  { code: 'customer_ca1', label: 'Shift 1 (08:30 - 17:30)' },
  { code: 'customer_ca2', label: 'Shift 2 (09:00 - 18:00)' },
  { code: 'internal_0800', label: 'Internal (08:00 - 17:30)' },
  { code: 'internal_0900', label: 'Internal (09:00 - 18:00)' },
];

const AttendancePage: React.FC = () => {
  const { currentUser, attendance, fetchAttendance, checkIn, checkOut, todayRecord, fetchTodayRecord } = useAuth();
  const [flash, setFlash] = useState('');
  const [selectedShift, setSelectedShift] = useState<ShiftCode>('customer_ca1');
  const [shiftOptions, setShiftOptions] = useState<Array<{ code: ShiftCode; label: string }>>(DEFAULT_SHIFT_OPTIONS);

  useEffect(() => {
    fetchTodayRecord();
    fetchAttendance();
  }, [fetchTodayRecord, fetchAttendance]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/settings/attendance');
        const s1Start = (res.data.shift1_start || '08:30:00').slice(0, 5);
        const s1End = (res.data.shift1_end || '17:30:00').slice(0, 5);
        const s2Start = (res.data.shift2_start || '09:00:00').slice(0, 5);
        const s2End = (res.data.shift2_end || '18:00:00').slice(0, 5);
        setShiftOptions([
          { code: 'customer_ca1', label: `Shift 1 (${s1Start} - ${s1End})` },
          { code: 'customer_ca2', label: `Shift 2 (${s2Start} - ${s2End})` },
          { code: 'internal_0800', label: 'Internal (08:00 - 17:30)' },
          { code: 'internal_0900', label: 'Internal (09:00 - 18:00)' },
        ]);
      } catch {
        setShiftOptions(DEFAULT_SHIFT_OPTIONS);
      }
    };

    loadSettings();
  }, []);

  if (!currentUser) return null;

  const canCheckIn = !todayRecord;
  const canCheckOut = !!todayRecord && !!todayRecord.check_in_time && !todayRecord.check_out_time;

  const handleCheckIn = async () => {
    const rec = await checkIn(selectedShift);
    if (rec) {
      setFlash(`✅ Checked in at ${rec.check_in_time} — ${rec.status}`);
      fetchAttendance();
      setTimeout(() => setFlash(''), 4000);
    }
  };

  const handleCheckOut = async () => {
    const rec = await checkOut();
    if (rec) {
      setFlash(`✅ Checked out at ${rec.check_out_time} — ${rec.working_hours}h`);
      fetchAttendance();
      setTimeout(() => setFlash(''), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Attendance</h1>
        <p className="text-surface-500 mt-1">Check in, check out, and view your attendance history.</p>
      </div>

      {flash && (
        <div className="rounded-xl bg-success-400/10 border border-success-400/30 px-5 py-3 text-sm font-medium text-success-600 animate-scale-in">
          {flash}
        </div>
      )}

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-800">Today</h2>
            <p className="text-xs text-surface-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <InfoBox icon={<LogIn size={18} />} label="Check-in" value={todayRecord?.check_in_time ?? '—'} />
          <InfoBox icon={<LogOut size={18} />} label="Check-out" value={todayRecord?.check_out_time ?? '—'} />
          <InfoBox icon={<Clock size={18} />} label="Hours" value={todayRecord?.working_hours ? `${todayRecord.working_hours}h` : '—'} />
        </div>

        {!todayRecord && (
          <div className="mb-6">
            <label className="block text-xs text-surface-500 mb-2">Shift to apply for check-in</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value as ShiftCode)}
              className="w-full sm:w-[320px] rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 focus:border-primary-400 focus:outline-none"
            >
              {shiftOptions.map((shift) => (
                <option key={shift.code} value={shift.code}>{shift.label}</option>
              ))}
            </select>
          </div>
        )}

        {todayRecord && (
          <div className="mb-6">
            <span className="text-sm text-surface-500 mr-2">Status:</span>
            <StatusBadge status={todayRecord.status} />
            {todayRecord.shift && (
              <span className="ml-3 text-xs text-surface-500">
                {todayRecord.shift.name}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleCheckIn} disabled={!canCheckIn}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-success-500 to-success-600 shadow-lg shadow-success-500/20 hover:shadow-success-500/40 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <LogIn size={18} /> Check In
          </button>
          <button onClick={handleCheckOut} disabled={!canCheckOut}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <LogOut size={18} /> Check Out
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-800">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-6 py-3 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Check-in</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Check-out</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Working Hours</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {attendance.map((a) => (
                <tr key={a.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-surface-700 whitespace-nowrap">{a.date}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{a.check_in_time ?? '—'}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{a.check_out_time ?? '—'}</td>
                  <td className="px-6 py-3 text-surface-600 whitespace-nowrap">{a.working_hours ? `${a.working_hours}h` : '—'}</td>
                  <td className="px-6 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-surface-400">No attendance records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InfoBox: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-xl bg-surface-50 p-4 flex items-center gap-3">
    <div className="text-primary-500">{icon}</div>
    <div>
      <p className="text-xs text-surface-400">{label}</p>
      <p className="text-lg font-bold text-surface-800">{value}</p>
    </div>
  </div>
);

export default AttendancePage;
