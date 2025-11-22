import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gov-900";
  
  const variants = {
    primary: "bg-gov-accent text-gov-900 hover:bg-yellow-500 focus:ring-gov-accent",
    secondary: "bg-gov-700 text-gray-100 hover:bg-gov-600 focus:ring-gov-600",
    danger: "bg-gov-danger text-white hover:bg-red-600 focus:ring-red-500",
    success: "bg-gov-success text-white hover:bg-emerald-600 focus:ring-emerald-500",
    ghost: "bg-transparent text-gray-300 hover:bg-gov-800 hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};