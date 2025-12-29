import React from 'react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-[--radius-lg] p-8 shadow-[--shadow-md] hover:shadow-[--shadow-lg] transition-all duration-300 hover:-translate-y-1">
      <div className="w-14 h-14 rounded-[--radius-md] bg-gradient-to-br from-[--color-sage-100] to-[--color-forest-100] flex items-center justify-center text-[--color-forest-600] mb-5">
        {icon}
      </div>
      <h4 className="mb-3">{title}</h4>
      <p className="text-[--color-stone-600]">{description}</p>
    </div>
  );
}