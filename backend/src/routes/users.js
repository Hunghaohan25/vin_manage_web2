import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

// Multer config for avatar upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/avatars'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${Date.now()}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(null, ext && mime);
    },
});

const router = Router();

// GET /api/users  (manager/admin)
router.get('/', authenticate, requireRole('admin', 'manager'), async (req, res) => {
    try {
        const where = {};
        if (req.user.role === 'manager') {
            where.role = 'employee';
        }
        const users = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/employees  (manager/admin – list employees for dropdowns)
router.get('/employees', authenticate, async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: 'employee' },
            attributes: ['id', 'name', 'avatar', 'department'],
            order: [['name', 'ASC']],
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/users  (manager/admin create user)
router.post('/', authenticate, requireRole('admin', 'manager'), upload.single('avatar'), async (req, res) => {
    try {
        const { name, email, password, role, department, status } = req.body;

        // Restriction for manager
        if (req.user.role === 'manager' && role && role !== 'employee') {
            return res.status(403).json({ message: 'Managers can only create employee accounts' });
        }
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });

        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(400).json({ message: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        const user = await User.create({
            name, email, password: hashed,
            role: role || 'employee',
            department: department || '',
            avatar: avatarPath,
            status: status || 'Active',
        });

        const { password: _, ...userData } = user.toJSON();
        res.status(201).json(userData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/users/:id  (manager/admin update user)
router.put('/:id', authenticate, requireRole('admin', 'manager'), upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Restriction for manager: can only edit employees
        if (req.user.role === 'manager' && user.role !== 'employee') {
            return res.status(403).json({ message: 'Managers can only edit employee accounts' });
        }

        // Restriction for manager: cannot change role to non-employee
        const { name, email, password, role, department, status } = req.body;
        if (req.user.role === 'manager' && role && role !== 'employee') {
            return res.status(403).json({ message: 'Managers can only assign employee role' });
        }
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department !== undefined) user.department = department;
        if (status) user.status = status;
        if (password) user.password = await bcrypt.hash(password, 10);
        if (req.file) user.avatar = `/uploads/avatars/${req.file.filename}`;

        await user.save();
        const { password: _, ...userData } = user.toJSON();
        res.json(userData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/users/:id  (manager/admin)
router.delete('/:id', authenticate, requireRole('admin', 'manager'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Restriction for manager: can only delete employees
        if (req.user.role === 'manager' && user.role !== 'employee') {
            return res.status(403).json({ message: 'Managers can only delete employee accounts' });
        }
        if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });

        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
