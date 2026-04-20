import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const SystemSetting = sequelize.define('SystemSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    shift1_start: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '08:30:00',
    },
    shift1_end: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '17:30:00',
    },
    shift2_start: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '09:00:00',
    },
    shift2_end: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '18:00:00',
    },
    lunch_start: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '12:30:00',
    },
    lunch_end: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '13:00:00',
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'system_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default SystemSetting;