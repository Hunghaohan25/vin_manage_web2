import { Router } from 'express';
import SystemSetting from '../models/SystemSetting.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const DEFAULT_SETTINGS = {
    shift1_start: '08:30:00',
    shift1_end: '17:30:00',
    shift2_start: '09:00:00',
    shift2_end: '18:00:00',
    lunch_start: '12:30:00',
    lunch_end: '13:00:00',
};

function normalizeTime(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) return null;
    return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
}

function toMinutes(timeString) {
    const [h, m] = timeString.split(':').map(Number);
    return h * 60 + m;
}

async function getOrCreateSettings() {
    const found = await SystemSetting.findOne({ order: [['id', 'ASC']] });
    if (found) return found;
    return SystemSetting.create(DEFAULT_SETTINGS);
}

// GET /api/settings/attendance
router.get('/attendance', authenticate, requireRole('admin', 'manager'), async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/settings/attendance
router.put('/attendance', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const payload = {
            shift1_start: normalizeTime(req.body.shift1_start),
            shift1_end: normalizeTime(req.body.shift1_end),
            shift2_start: normalizeTime(req.body.shift2_start),
            shift2_end: normalizeTime(req.body.shift2_end),
            lunch_start: normalizeTime(req.body.lunch_start),
            lunch_end: normalizeTime(req.body.lunch_end),
        };

        const missing = Object.entries(payload).filter(([, value]) => !value).map(([key]) => key);
        if (missing.length) {
            return res.status(400).json({ message: `Invalid time format for: ${missing.join(', ')}` });
        }

        if (toMinutes(payload.shift1_start) >= toMinutes(payload.shift1_end)) {
            return res.status(400).json({ message: 'Shift 1 end time must be after start time' });
        }
        if (toMinutes(payload.shift2_start) >= toMinutes(payload.shift2_end)) {
            return res.status(400).json({ message: 'Shift 2 end time must be after start time' });
        }
        if (toMinutes(payload.lunch_start) >= toMinutes(payload.lunch_end)) {
            return res.status(400).json({ message: 'Lunch end time must be after lunch start time' });
        }

        const settings = await getOrCreateSettings();
        await settings.update({ ...payload, updated_by: req.user.id });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;