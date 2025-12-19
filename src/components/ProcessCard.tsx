import React from 'react';

interface ProcessCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ProcessCard({ number, title, description, icon }: ProcessCardProps) {
  return (
    <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300 flex flex-col items-start border border-[--color-stone-200] rounded-[8px]">
      <div className="flex items-start gap-4 mb-4 w-full">
        <div className="w-12 h-12 flex-shrink-0 rounded-[var(--radius-md)] bg-gradient-to-br from-[--color-sage-100] to-[--color-forest-100] flex items-center justify-center text-[--color-forest-700]">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm tracking-wider text-[--color-forest-700] mb-2">
            STEP {number}
          </div>
          <h4 className="mb-3">{title}</h4>
          <p className="text-[--color-stone-700]">{description}</p>
        </div>
      </div>
    </div>
  );
}