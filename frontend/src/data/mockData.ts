import { format, subDays, startOfDay } from 'date-fns';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'employee' | 'manager' | 'admin';
    department: string;
    avatar: string;
    created_at: string;
}

export interface AttendanceRecord {
    id: string;
    employee_id: string;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    working_hours: number | null;
    status: 'On-time' | 'Late' | 'Absent';
    created_at: string;
}

export interface LeaveRequest {
    id: string;
    employee_id: string;
    leave_type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Unpaid Leave';
    start_date: string;
    end_date: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    created_at: string;
    approved_by: string | null;
    approved_at: string | null;
}

// ── Users ──────────────────────────────────────────────
export const users: User[] = [
    {
        id: 'u1',
        name: 'Nguyen Van An',
        email: 'an.nguyen@vingroup.net',
        password: '123456',
        role: 'employee',
        department: 'Engineering',
        avatar: 'NVA',
        created_at: '2025-01-15',
    },
    {
        id: 'u2',
        name: 'Tran Thi Bich',
        email: 'bich.tran@vingroup.net',
        password: '123456',
        role: 'employee',
        department: 'Engineering',
        avatar: 'TTB',
        created_at: '2025-02-20',
    },
    {
        id: 'u3',
        name: 'Le Hoang Cuong',
        email: 'cuong.le@vingroup.net',
        password: '123456',
        role: 'employee',
        department: 'Engineering',
        avatar: 'LHC',
        created_at: '2025-03-10',
    },
    {
        id: 'mgr1',
        name: 'Pham Minh Duc',
        email: 'duc.pham@vingroup.net',
        password: '123456',
        role: 'manager',
        department: 'Engineering',
        avatar: 'PMD',
        created_at: '2024-06-01',
    },
    {
        id: 'admin1',
        name: 'Vo Thi Admin',
        email: 'admin@vingroup.net',
        password: '123456',
        role: 'admin',
        department: 'IT',
        avatar: 'VTA',
        created_at: '2024-01-01',
    },
];

// ── Helpers ────────────────────────────────────────────
function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmtTime(h: number, m: number) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Seed Attendance (past 14 work days) ────────────────
function generateAttendance(): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const employeeIds = ['u1', 'u2', 'u3'];
    const today = startOfDay(new Date());
    let id = 1;

    for (let d = 1; d <= 20; d++) {
        const date = subDays(today, d);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

        for (const empId of employeeIds) {
            const isAbsent = Math.random() < 0.08;
            if (isAbsent) {
                records.push({
                    id: `att-${id++}`,
                    employee_id: empId,
                    date: format(date, 'yyyy-MM-dd'),
                    check_in_time: null,
                    check_out_time: null,
                    working_hours: null,
                    status: 'Absent',
                    created_at: format(date, 'yyyy-MM-dd'),
                });
                continue;
            }

            const isLate = Math.random() < 0.25;
            const inH = isLate ? 9 : rand(7, 8);
            const inM = isLate ? rand(1, 55) : rand(0, 59);
            const outH = rand(17, 19);
            const outM = rand(0, 59);
            const hours = parseFloat(((outH + outM / 60) - (inH + inM / 60)).toFixed(1));

            records.push({
                id: `att-${id++}`,
                employee_id: empId,
                date: format(date, 'yyyy-MM-dd'),
                check_in_time: fmtTime(inH, inM),
                check_out_time: fmtTime(outH, outM),
                working_hours: hours,
                status: isLate ? 'Late' : 'On-time',
                created_at: format(date, 'yyyy-MM-dd'),
            });
        }
    }

    return records.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Seed Leave Requests ────────────────────────────────
function generateLeaveRequests(): LeaveRequest[] {
    const types: LeaveRequest['leave_type'][] = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Unpaid Leave'];
    return [
        {
            id: 'lv1',
            employee_id: 'u1',
            leave_type: 'Annual Leave',
            start_date: '2026-03-20',
            end_date: '2026-03-22',
            reason: 'Family vacation trip to Da Nang.',
            status: 'Pending',
            created_at: '2026-03-12',
            approved_by: null,
            approved_at: null,
        },
        {
            id: 'lv2',
            employee_id: 'u2',
            leave_type: 'Sick Leave',
            start_date: '2026-03-10',
            end_date: '2026-03-11',
            reason: 'Flu symptoms and doctor appointment.',
            status: 'Approved',
            created_at: '2026-03-09',
            approved_by: 'mgr1',
            approved_at: '2026-03-09',
        },
        {
            id: 'lv3',
            employee_id: 'u3',
            leave_type: 'Personal Leave',
            start_date: '2026-03-25',
            end_date: '2026-03-25',
            reason: 'Personal errand – house closing appointment.',
            status: 'Pending',
            created_at: '2026-03-13',
            approved_by: null,
            approved_at: null,
        },
        {
            id: 'lv4',
            employee_id: 'u1',
            leave_type: types[rand(0, 3)],
            start_date: '2026-02-15',
            end_date: '2026-02-16',
            reason: 'Personal matters.',
            status: 'Rejected',
            created_at: '2026-02-13',
            approved_by: 'mgr1',
            approved_at: '2026-02-14',
        },
        {
            id: 'lv5',
            employee_id: 'u2',
            leave_type: 'Unpaid Leave',
            start_date: '2026-04-01',
            end_date: '2026-04-03',
            reason: 'Extended travel abroad.',
            status: 'Pending',
            created_at: '2026-03-14',
            approved_by: null,
            approved_at: null,
        },
    ];
}

export const initialAttendance = generateAttendance();
export const initialLeaveRequests = generateLeaveRequests();
