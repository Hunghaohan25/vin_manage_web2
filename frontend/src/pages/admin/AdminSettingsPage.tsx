import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface AttendanceSetting {
  shift1_start: string;
  shift1_end: string;
  shift2_start: string;
  shift2_end: string;
  lunch_start: string;
  lunch_end: string;
}

const emptySettings: AttendanceSetting = {
  shift1_start: '08:30',
  shift1_end: '17:30',
  shift2_start: '09:00',
  shift2_end: '18:00',
  lunch_start: '12:30',
  lunch_end: '13:00',
};

function toInputTime(value: string) {
  if (!value) return '';
  const [h, m] = value.split(':');
  if (!h || !m) return '';
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

const AdminSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<AttendanceSetting>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/settings/attendance');
        setSettings({
          shift1_start: toInputTime(res.data.shift1_start),
          shift1_end: toInputTime(res.data.shift1_end),
          shift2_start: toInputTime(res.data.shift2_start),
          shift2_end: toInputTime(res.data.shift2_end),
          lunch_start: toInputTime(res.data.lunch_start),
          lunch_end: toInputTime(res.data.lunch_end),
        });
      } catch {
        setFlash('Unable to load settings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (!currentUser) return null;

  if (currentUser.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-danger-200 bg-danger-50 p-6 text-danger-700">
        You do not have permission to access this page.
      </div>
    );
  }

  const updateField = (field: keyof AttendanceSetting, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setFlash('');
    try {
      await api.put('/settings/attendance', settings);
      setFlash('Settings saved successfully.');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save settings.';
      setFlash(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Attendance Settings</h1>
        <p className="text-surface-500 mt-1">Configure customer shifts for late check-in and working-hours calculation.</p>
      </div>

      {flash && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          {flash}
        </div>
      )}

      <div className="rounded-2xl border border-surface-200/60 bg-white shadow-sm p-6 space-y-6">
        {loading ? (
          <p className="text-surface-500">Loading settings...</p>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-surface-800">Shift 1</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-surface-600">
                  Start time
                  <input
                    type="time"
                    value={settings.shift1_start}
                    onChange={(e) => updateField('shift1_start', e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-surface-600">
                  End time
                  <input
                    type="time"
                    value={settings.shift1_end}
                    onChange={(e) => updateField('shift1_end', e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-surface-800">Shift 2</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-surface-600">
                  Start time
                  <input
                    type="time"
                    value={settings.shift2_start}
                    onChange={(e) => updateField('shift2_start', e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-surface-600">
                  End time
                  <input
                    type="time"
                    value={settings.shift2_end}
                    onChange={(e) => updateField('shift2_end', e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-surface-800">Lunch break</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-surface-600">
                  Break start
                  <input
                    type="time"
                    value={settings.lunch_start}
                    onChange={(e) => updateField('lunch_start', e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-surface-600">
                  Break end
                  <input
                    type="time"
                    value={settings.lunch_end}
                    onChange={(e) => updateField('lunch_end', e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2"
                  />
                </label>
              </div>
            </section>

            <div className="pt-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
