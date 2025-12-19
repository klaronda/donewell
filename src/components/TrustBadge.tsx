import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
}

export function TrustBadge({ icon, text }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-[var(--shadow-md)] border border-[--color-sage-200]">
      <div className="text-[--color-forest-600]">
        {icon}
      </div>
      <span className="text-sm text-[--color-stone-800]">{text}</span>
    </div>
  );
}