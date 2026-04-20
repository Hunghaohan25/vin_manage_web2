import { Router } from 'express';
import { Op } from 'sequelize';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/leave  (create)
router.post('/', authenticate, async (req, res) => {
    try {
        const { leave_type, start_date, end_date, reason } = req.body;
        if (!leave_type || !start_date || !end_date || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (start_date > end_date) {
            return res.status(400).json({ message: 'Start date must be before end date' });
        }

        // Overlap check
        const overlap = await LeaveRequest.findOne({
            where: {
                employee_id: req.user.id,
                status: { [Op.ne]: 'Rejected' },
                start_date: { [Op.lte]: end_date },
                end_date: { [Op.gte]: start_date },
            },
        });
        if (overlap) return res.status(400).json({ message: 'Overlapping leave request exists' });

        const lr = await LeaveRequest.create({
            employee_id: req.user.id,
            leave_type,
            start_date,
            end_date,
            reason,
        });
        res.status(201).json(lr);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/leave/my
router.get('/my', authenticate, async (req, res) => {
    try {
        const list = await LeaveRequest.findAll({
            where: { employee_id: req.user.id },
            order: [['created_at', 'DESC']],
        });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/leave/all  (manager/admin)
router.get('/all', authenticate, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const list = await LeaveRequest.findAll({
            include: [{ model: User, as: 'employee', attributes: ['id', 'name', 'avatar'] }],
            order: [['created_at', 'DESC']],
        });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/leave/:id/approve
router.put('/:id/approve', authenticate, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const lr = await LeaveRequest.findByPk(req.params.id);
        if (!lr) return res.status(404).json({ message: 'Not found' });
        if (lr.status !== 'Pending') return res.status(400).json({ message: 'Already processed' });

        lr.status = 'Approved';
        lr.approved_by = req.user.id;
        lr.approved_at = new Date();
        await lr.save();
        res.json(lr);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/leave/:id/reject
router.put('/:id/reject', authenticate, requireRole('manager', 'admin'), async (req, res) => {
    try {
        const lr = await LeaveRequest.findByPk(req.params.id);
        if (!lr) return res.status(404).json({ message: 'Not found' });
        if (lr.status !== 'Pending') return res.status(400).json({ message: 'Already processed' });

        lr.status = 'Rejected';
        lr.approved_by = req.user.id;
        lr.approved_at = new Date();
        await lr.save();
        res.json(lr);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
