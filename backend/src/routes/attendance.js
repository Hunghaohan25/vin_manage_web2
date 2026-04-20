import { Router } from 'express';
import Attendance from '../models/Attendance.js';
import SystemSetting from '../models/SystemSetting.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const DEFAULT_SHIFT_CONFIGS = {
    internal_0800: { code: 'internal_0800', name: 'Internal 08:00-17:30', start: '08:00', end: '17:30' },
    internal_0900: { code: 'internal_0900', name: 'Internal 09:00-18:00', start: '09:00', end: '18:00' },
    customer_ca1: { code: 'customer_ca1', name: 'Customer Shift 1 (08:30-17:30)', start: '08:30', end: '17:30' },
    customer_ca2: { code: 'customer_ca2', name: 'Customer Shift 2 (09:00-18:00)', start: '09:00', end: '18:00' },
};

const DEFAULT_LUNCH_BREAK = { start: '12:30', end: '13:00' };

function getLocalDateString(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

function timeToHHmm(timeString) {
    if (!timeString || typeof timeString !== 'string') return null;
    const [h, m] = timeString.split(':');
    if (!h || !m) return null;
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

function nowTimeString(now = new Date()) {
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}:00`;
}

function resolveShiftCodeByCheckIn(checkInMinutes, shift1CutoffMinutes) {
    return checkInMinutes < shift1CutoffMinutes ? 'customer_ca1' : 'customer_ca2';
}

function resolveStatusByCheckIn(checkInMinutes, lateThresholdMinutes) {
    return checkInMinutes > lateThresholdMinutes ? 'Late' : 'On-time';
}

function getWorkedHours(checkInTime, checkOutTime, lunchBreak) {
    const [inH, inM] = checkInTime.split(':').map(Number);
    const [outH, outM] = checkOutTime.split(':').map(Number);

    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;
    if (outMinutes <= inMinutes) return 0;

    const totalMinutes = outMinutes - inMinutes;
    const lunchStart = toMinutes(lunchBreak.start);
    const lunchEnd = toMinutes(lunchBreak.end);

    const overlapStart = Math.max(inMinutes, lunchStart);
    const overlapEnd = Math.min(outMinutes, lunchEnd);
    const lunchOverlap = Math.max(0, overlapEnd - overlapStart);

    return parseFloat(((totalMinutes - lunchOverlap) / 60).toFixed(2));
}

async function getRuntimeConfigs() {
    const settings = await SystemSetting.findOne({ order: [['id', 'ASC']] });
    if (!settings) {
        const defaultShift1Start = DEFAULT_SHIFT_CONFIGS.customer_ca1.start;
        const defaultShift2Start = DEFAULT_SHIFT_CONFIGS.customer_ca2.start;
        return {
            shifts: DEFAULT_SHIFT_CONFIGS,
            lunchBreak: DEFAULT_LUNCH_BREAK,
            checkInRules: {
                shift1Cutoff: toMinutes(defaultShift1Start),
                lateThreshold: toMinutes(defaultShift2Start),
            },
        };
    }

    const shift1Start = timeToHHmm(settings.shift1_start) || DEFAULT_SHIFT_CONFIGS.customer_ca1.start;
    const shift1End = timeToHHmm(settings.shift1_end) || DEFAULT_SHIFT_CONFIGS.customer_ca1.end;
    const shift2Start = timeToHHmm(settings.shift2_start) || DEFAULT_SHIFT_CONFIGS.customer_ca2.start;
    const shift2End = timeToHHmm(settings.shift2_end) || DEFAULT_SHIFT_CONFIGS.customer_ca2.end;
    const lunchStart = timeToHHmm(settings.lunch_start) || DEFAULT_LUNCH_BREAK.start;
    const lunchEnd = timeToHHmm(settings.lunch_end) || DEFAULT_LUNCH_BREAK.end;
    const shift1Cutoff = toMinutes(shift1Start);
    const lateThreshold = toMinutes(shift2Start);

    return {
        shifts: {
            ...DEFAULT_SHIFT_CONFIGS,
            customer_ca1: {
                ...DEFAULT_SHIFT_CONFIGS.customer_ca1,
                name: `Customer Shift 1 (${shift1Start}-${shift1End})`,
                start: shift1Start,
                end: shift1End,
            },
            customer_ca2: {
                ...DEFAULT_SHIFT_CONFIGS.customer_ca2,
                name: `Customer Shift 2 (${shift2Start}-${shift2End})`,
                start: shift2Start,
                end: shift2End,
            },
        },
        lunchBreak: {
            start: lunchStart,
            end: lunchEnd,
        },
        checkInRules: {
            shift1Cutoff,
            lateThreshold,
        },
    };
}

function buildAttendanceResponse(record, runtimeConfig) {
    const raw = record.toJSON();
    let shiftCode = raw.shift_code;
    let shift = runtimeConfig.shifts[shiftCode] || runtimeConfig.shifts.customer_ca1;

    let status = raw.status;
    if (raw.check_in_time) {
        const [inH, inM] = raw.check_in_time.split(':').map(Number);
        const checkInMinutes = inH * 60 + inM;
        shiftCode = resolveShiftCodeByCheckIn(checkInMinutes, runtimeConfig.checkInRules.shift1Cutoff);
        shift = runtimeConfig.shifts[shiftCode] || shift;
        status = resolveStatusByCheckIn(checkInMinutes, runtimeConfig.checkInRules.lateThreshold);
    }

    let workingHours = raw.working_hours;
    if (raw.check_in_time && raw.check_out_time) {
        workingHours = getWorkedHours(raw.check_in_time, raw.check_out_time, runtimeConfig.lunchBreak);
    }

    return {
        ...raw,
        shift_code: shiftCode,
        status,
        working_hours: workingHours,
        shift,
    };
}

// POST /api/attendance/checkin
router.post('/checkin', authenticate, async (req, res) => {
    try {
        const runtimeConfig = await getRuntimeConfigs();
        const today = getLocalDateString();
        const existing = await Attendance.findOne({
            where: { employee_id: req.user.id, date: today },
        });
        if (existing) return res.status(400).json({ message: 'Already checked in today' });

        const now = new Date();
        const checkInMinutes = now.getHours() * 60 + now.getMinutes();
        const shiftCode = resolveShiftCodeByCheckIn(checkInMinutes, runtimeConfig.checkInRules.shift1Cutoff);
        const selectedShift = runtimeConfig.shifts[shiftCode] || runtimeConfig.shifts.customer_ca1;
        const isLate = resolveStatusByCheckIn(checkInMinutes, runtimeConfig.checkInRules.lateThreshold) === 'Late';
        const timeStr = nowTimeString(now);

        const record = await Attendance.create({
            employee_id: req.user.id,
            date: today,
            shift_code: selectedShift.code,
            check_in_time: timeStr,
            status: isLate ? 'Late' : 'On-time',
        });

        res.json(buildAttendanceResponse(record, runtimeConfig));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/attendance/checkout
router.post('/checkout', authenticate, async (req, res) => {
    try {
        const runtimeConfig = await getRuntimeConfigs();
        const today = getLocalDateString();
        const record = await Attendance.findOne({
            where: { employee_id: req.user.id, date: today },
        });
        if (!record) return res.status(400).json({ message: 'Must check in first' });
        if (record.check_out_time) return res.status(400).json({ message: 'Already checked out' });

        const now = new Date();
        const timeStr = nowTimeString(now);
        const hours = getWorkedHours(record.check_in_time, timeStr, runtimeConfig.lunchBreak);

        record.check_out_time = timeStr;
        record.working_hours = hours;
        await record.save();

        res.json(buildAttendanceResponse(record, runtimeConfig));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/attendance/history  (own records)
router.get('/history', authenticate, async (req, res) => {
    try {
        const runtimeConfig = await getRuntimeConfigs();
        const records = await Attendance.findAll({
            where: { employee_id: req.user.id },
            order: [['date', 'DESC']],
        });
        res.json(records.map((record) => buildAttendanceResponse(record, runtimeConfig)));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/attendance/team  (manager/admin)
router.get('/team', authenticate, async (req, res) => {
    try {
        const runtimeConfig = await getRuntimeConfigs();
        const where = {};
        if (req.query.date) where.date = req.query.date;
        if (req.query.employee_id) where.employee_id = req.query.employee_id;

        const records = await Attendance.findAll({
            where,
            include: [{ model: User, as: 'employee', attributes: ['id', 'name', 'avatar', 'department'] }],
            order: [['date', 'DESC']],
            limit: 200,
        });
        res.json(records.map((record) => buildAttendanceResponse(record, runtimeConfig)));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/attendance/today  (own today record)
router.get('/today', authenticate, async (req, res) => {
    try {
        const runtimeConfig = await getRuntimeConfigs();
        const today = getLocalDateString();
        const record = await Attendance.findOne({
            where: { employee_id: req.user.id, date: today },
        });
        if (!record) return res.json(null);
        res.json(buildAttendanceResponse(record, runtimeConfig));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
