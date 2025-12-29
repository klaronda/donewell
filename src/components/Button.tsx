import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'medium' | 'large';
  onClick?: () => void;
  href?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  href
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center transition-all duration-200 cursor-pointer";
  
  const variantStyles = {
    primary: "bg-[#1a4d2e] text-white hover:bg-[#153d25] shadow-[--shadow-md] hover:shadow-[--shadow-lg] border-0",
    secondary: "bg-white text-[#1a4d2e] border border-[#1a4d2e] hover:bg-[#4a6f5a] hover:text-white"
  };
  
  const sizeStyles = {
    medium: "px-8 py-3 text-base rounded-lg",
    large: "px-10 py-4 text-lg rounded-lg"
  };
  
  const className = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;
  
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}