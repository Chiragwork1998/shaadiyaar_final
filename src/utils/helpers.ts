import { format, parseISO, isValid } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) { // 1 crore or more
    const crores = amount / 10000000;
    if (crores >= 100) {
      return `₹${Math.round(crores)}Cr`;
    } else {
      return `₹${(crores).toFixed(1)}Cr`;
    }
  } else if (amount >= 100000) { // 1 lakh or more
    const lakhs = amount / 100000;
    if (lakhs >= 100) {
      return `₹${Math.round(lakhs)}L`;
    } else {
      return `₹${(lakhs).toFixed(1)}L`;
    }
  } else if (amount >= 1000) { // 1 thousand or more
    const thousands = amount / 1000;
    return `₹${(thousands).toFixed(1)}K`;
  } else {
    return `₹${Math.round(amount)}`;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'dd MMM, yyyy');
    }
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

export const LEAD_TYPES = [
  { value: 'Hot Lead', label: 'Hot Lead' },
  { value: 'Warm Lead', label: 'Warm Lead' },
  { value: 'Cold Lead', label: 'Cold Lead' },
] as const;

export const LEAD_STATUSES = [
  { value: 'new', label: 'New Lead', dotColor: 'bg-primary', triggerStyle: 'bg-primary/10 text-primary hover:bg-primary/20' },
  { value: 'contacted', label: 'Contacted', dotColor: 'bg-deep-indigo', triggerStyle: 'bg-deep-indigo/10 text-deep-indigo hover:bg-deep-indigo/20' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', dotColor: 'bg-navy-dark', triggerStyle: 'bg-navy-dark/10 text-navy-dark hover:bg-navy-dark/20' }, 
  { value: 'proposal_sent', label: 'Proposal Sent', dotColor: 'bg-yellow-400', triggerStyle: 'bg-yellow-400/10 text-yellow-700 hover:bg-yellow-400/20 dark:text-yellow-500' },
  { value: 'negotiating', label: 'Negotiating', dotColor: 'bg-orange-400', triggerStyle: 'bg-orange-400/10 text-orange-700 hover:bg-orange-400/20 dark:text-orange-500' }, 
  { value: 'booked', label: 'Booked', dotColor: 'bg-theme-green', triggerStyle: 'bg-theme-green/10 text-theme-green hover:bg-theme-green/20' },
  { value: 'cancelled', label: 'Cancelled', dotColor: 'bg-destructive', triggerStyle: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
  { value: 'completed', label: 'Completed', dotColor: 'bg-muted-foreground', triggerStyle: 'bg-muted text-muted-foreground hover:bg-muted/80' }
] as const;

export const getLeadTypeStyle = (type: string): string => {
  const styles: { [key: string]: string } = {
    'Hot Lead': 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400',
    'Warm Lead': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400',
    'Cold Lead': 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-400' 
  };
  return styles[type] || 'bg-accent text-muted-foreground';
};

export const getStatusDotColor = (status: string | undefined | null): string => {
  if (!status) return 'bg-muted-foreground';
  const statusItem = LEAD_STATUSES.find(s => s.value === status.toLowerCase());
  return statusItem?.dotColor || 'bg-muted-foreground';
};

export const getLeadStatusTriggerStyle = (status: string | undefined | null): string => {
  if (!status) return 'bg-input text-foreground hover:bg-input/80';
  const statusItem = LEAD_STATUSES.find(s => s.value === status.toLowerCase());
  return statusItem?.triggerStyle || 'bg-input text-foreground hover:bg-input/80';
};

export const getStatusText = (status: string): string => {
  const statusItem = LEAD_STATUSES.find(s => s.value === status.toLowerCase());
  return statusItem?.label || status;
};