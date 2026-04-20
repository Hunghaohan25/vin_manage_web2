import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    shift_code: {
        type: DataTypes.ENUM('internal_0800', 'internal_0900', 'customer_ca1', 'customer_ca2'),
        allowNull: false,
        defaultValue: 'customer_ca1',
    },
    check_in_time: {
        type: DataTypes.TIME,
        defaultValue: null,
    },
    check_out_time: {
        type: DataTypes.TIME,
        defaultValue: null,
    },
    working_hours: {
        type: DataTypes.FLOAT,
        defaultValue: null,
    },
    status: {
        type: DataTypes.ENUM('On-time', 'Late', 'Absent'),
        defaultValue: 'Absent',
    },
}, {
    tableName: 'attendance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['employee_id', 'date'] },
    ],
});

Attendance.belongsTo(User, { foreignKey: 'employee_id', as: 'employee', onDelete: 'CASCADE' });

export default Attendance;
