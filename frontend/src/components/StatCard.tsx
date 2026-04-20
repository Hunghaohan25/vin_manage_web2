import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  blue: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600 bg-primary-100',
    value: 'text-primary-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-success-600 bg-green-100',
    value: 'text-success-600',
  },
  orange: {
    bg: 'bg-amber-50',
    icon: 'text-warning-600 bg-amber-100',
    value: 'text-warning-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-danger-600 bg-red-100',
    value: 'text-danger-600',
  },
  purple: {
    bg: 'bg-violet-50',
    icon: 'text-accent-600 bg-violet-100',
    value: 'text-accent-600',
  },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border border-surface-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow animate-fade-in`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.icon}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-surface-500 truncate">{label}</p>
          <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
          {trend && <p className="text-xs text-surface-400 mt-0.5">{trend}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
