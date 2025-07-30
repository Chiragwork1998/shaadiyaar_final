import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Lead } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface BudgetChartProps {
  leads: Lead[];
}

const BudgetChart: React.FC<BudgetChartProps> = ({ leads }) => {
  // Group leads by budget ranges
  const budgetRanges = [
    { min: 0, max: 5000, label: 'Under $5K' },
    { min: 5000, max: 10000, label: '$5K - $10K' },
    { min: 10000, max: 20000, label: '$10K - $20K' },
    { min: 20000, max: 30000, label: '$20K - $30K' },
    { min: 30000, max: 50000, label: '$30K - $50K' },
    { min: 50000, max: Infinity, label: 'Over $50K' },
  ];
  
  const groupedLeads = budgetRanges.map((range) => {
    const count = leads.filter((lead) => {
      const budget = lead.numeric_budget || 0;
      return budget >= range.min && budget < range.max;
    }).length;
    
    return {
      ...range,
      count,
    };
  });
  
  const maxCount = Math.max(...groupedLeads.map((group) => group.count));
  
  // Calculate the total revenue
  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.numeric_budget || 0), 0);
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Budget Distribution</h3>
        <p className="text-sm text-gray-500">
          Total: <span className="font-medium">{formatCurrency(totalRevenue)}</span>
        </p>
      </div>
      
      <div className="space-y-4">
        {groupedLeads.map((group, index) => (
          <div key={group.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-500">{group.label}</span>
              <span className="text-sm font-medium text-gray-900">{group.count} leads</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-rose-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: maxCount > 0 ? `${(group.count / maxCount) * 100}%` : '0%' }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BudgetChart;