import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sequelize from './config/db.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';
import LeaveRequest from './models/LeaveRequest.js';

const seedUsers = [
    { name: 'Vo Thi Admin', email: 'admin@vingroup.net', password: '123456', role: 'admin', department: 'IT' },
    { name: 'Nguyen Van Minh', email: 'minh.nv@vingroup.net', password: '123456', role: 'manager', department: 'Engineering' },
    { name: 'Tran Thi Lan', email: 'lan.tt@vingroup.net', password: '123456', role: 'manager', department: 'HR' },
    { name: 'Le Van Huy', email: 'huy.lv@vingroup.net', password: '123456', role: 'employee', department: 'Engineering' },
    { name: 'Pham Thi Mai', email: 'mai.pt@vingroup.net', password: '123456', role: 'employee', department: 'Engineering' },
    { name: 'Hoang Van Duc', email: 'duc.hv@vingroup.net', password: '123456', role: 'employee', department: 'HR' },
    { name: 'Dang Thi Ngoc', email: 'ngoc.dt@vingroup.net', password: '123456', role: 'employee', department: 'Marketing' },
    { name: 'Bui Van Tuan', email: 'tuan.bv@vingroup.net', password: '123456', role: 'employee', department: 'Engineering' },
    { name: 'Ngo Thi Hanh', email: 'hanh.nt@vingroup.net', password: '123456', role: 'employee', department: 'Finance' },
    { name: 'Vu Van Long', email: 'long.vv@vingroup.net', password: '123456', role: 'employee', department: 'IT' },
];

function randomTime(minH, maxH) {
    const h = minH + Math.floor(Math.random() * (maxH - minH));
    const m = Math.floor(Math.random() * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

function workdays(count) {
    const days = [];
    const d = new Date();
    while (days.length < count) {
        d.setDate(d.getDate() - 1);
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

async function seed() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');

        // Seed users
        const createdUsers = [];
        for (const u of seedUsers) {
            const [user, created] = await User.findOrCreate({
                where: { email: u.email },
                defaults: {
                    name: u.name,
                    password: await bcrypt.hash(u.password, 10),
                    role: u.role,
                    department: u.department,
                    status: Math.random() > 0.1 ? 'Active' : 'Inactive',
                },
            });
            createdUsers.push(user);
            console.log(`${created ? '🆕' : '✅'} User: ${u.name} (${u.role})`);
        }

        // Seed attendance for employees (last 15 workdays)
        const employeeUsers = createdUsers.filter((u) => u.role === 'employee');
        const days = workdays(15);

        let attCount = 0;
        for (const emp of employeeUsers) {
            for (const date of days) {
                const [, created] = await Attendance.findOrCreate({
                    where: { employee_id: emp.id, date },
                    defaults: {
                        check_in_time: randomTime(8, 10),
                        check_out_time: randomTime(17, 19),
                        working_hours: parseFloat((7 + Math.random() * 2).toFixed(1)),
                        status: Math.random() > 0.2 ? 'On-time' : 'Late',
                    },
                });
                if (created) attCount++;
            }
        }
        console.log(`📅 Attendance records created: ${attCount}`);

        // Seed leave requests
        const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Unpaid Leave'];
        const statuses = ['Pending', 'Approved', 'Rejected'];
        const managers = createdUsers.filter((u) => u.role === 'manager' || u.role === 'admin');

        let leaveCount = 0;
        for (const emp of employeeUsers) {
            const numLeaves = 2 + Math.floor(Math.random() * 3); // 2-4 leave requests per employee
            for (let i = 0; i < numLeaves; i++) {
                const startOffset = 5 + Math.floor(Math.random() * 30);
                const duration = 1 + Math.floor(Math.random() * 4);
                const start = new Date();
                start.setDate(start.getDate() - startOffset);
                const end = new Date(start);
                end.setDate(end.getDate() + duration);

                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const approver = status !== 'Pending' ? managers[Math.floor(Math.random() * managers.length)] : null;

                await LeaveRequest.findOrCreate({
                    where: { employee_id: emp.id, start_date: start.toISOString().split('T')[0] },
                    defaults: {
                        leave_type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
                        end_date: end.toISOString().split('T')[0],
                        reason: ['Family event', 'Medical appointment', 'Personal matters', 'Vacation trip', 'Home repair', 'Study leave'][Math.floor(Math.random() * 6)],
                        status,
                        approved_by: approver?.id || null,
                        approved_at: approver ? new Date() : null,
                    },
                });
                leaveCount++;
            }
        }
        console.log(`📝 Leave requests created: ${leaveCount}`);

        console.log('\n🎉 Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
