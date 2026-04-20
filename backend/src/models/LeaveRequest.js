import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const LeaveRequest = sequelize.define('LeaveRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    leave_type: {
        type: DataTypes.ENUM('Annual Leave', 'Sick Leave', 'Personal Leave', 'Unpaid Leave'),
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending',
    },
    approved_by: {
        type: DataTypes.INTEGER,
        defaultValue: null,
    },
    approved_at: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
}, {
    tableName: 'leave_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

LeaveRequest.belongsTo(User, { foreignKey: 'employee_id', as: 'employee', onDelete: 'CASCADE' });
LeaveRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approver', onDelete: 'SET NULL' });

export default LeaveRequest;
