import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import sequelize from './config/db.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';
import LeaveRequest from './models/LeaveRequest.js';
import SystemSetting from './models/SystemSetting.js';

import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim());
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Database Sync & Admin Seed ─────────────────────────
async function start() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Sync all models (create/alter tables)
        await sequelize.sync({ alter: true });
        console.log('✅ Tables synced');

        // Seed default admin if not exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@vingroup.net';
        const existing = await User.findOne({ where: { email: adminEmail } });
        if (!existing) {
            const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || '123456', 10);
            await User.create({
                name: 'Vo Thi Admin',
                email: adminEmail,
                password: hashed,
                role: 'admin',
                department: 'IT',
            });
            console.log(`✅ Admin user seeded: ${adminEmail}`);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

start();
