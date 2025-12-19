import React from 'react';

interface StatCardProps {
  number: string;
  label: string;
  sublabel?: string;
}

export function StatCard({ number, label, sublabel }: StatCardProps) {
  return (
    <div className="text-center">
      <div className="text-5xl md:text-6xl bg-gradient-to-br from-[--color-forest-600] to-[--color-sage-600] bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-[--color-stone-700]">{label}</div>
      {sublabel && <div className="text-sm text-[--color-stone-500] mt-1">{sublabel}</div>}
    </div>
  );
}
