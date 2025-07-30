import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  isIconOnly?: boolean;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon,
  isIconOnly = false,
  title,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-200';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-steel-blue-light to-steel-blue-main hover:from-steel-blue-main hover:to-steel-blue-dark text-primary-foreground shadow-sm',
    secondary: 'bg-steel-blue-main hover:bg-steel-blue-dark text-primary-foreground',
    outline: 'border border-border hover:bg-accent text-accent-foreground',
    danger: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground',
    ghost: 'hover:bg-accent text-accent-foreground',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };
  
  let computedSizeStyles = sizeStyles[size];
  if (isIconOnly && size !== 'icon') {
    computedSizeStyles = `p-2 ${sizeStyles[size].replace(/px-\d+/g, '').replace(/py-\d+/g, '').trim()}`;
  }
  if (isIconOnly && !icon && children && typeof children !== 'string') {
    computedSizeStyles = sizeStyles.icon;
  }
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variantStyles[variant]} ${computedSizeStyles} ${disabledStyles} ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </motion.button>
  );
};

export { Button };