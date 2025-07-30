import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'pink' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
}) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    pink: 'bg-rose-100 text-rose-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  
  const iconClass = colorMap[color];
  
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconClass}`}>{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <motion.dd
              className="text-2xl font-semibold text-gray-900"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {value}
            </motion.dd>
          </dl>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4">
          <div className={`flex items-center text-sm ${
            trend.value >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="font-medium">
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="ml-2 text-gray-500">{trend.label}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatCard;