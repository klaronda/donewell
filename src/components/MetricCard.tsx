import React from 'react';

export interface Metric {
  id: string;
  value: string;
  title: string;
  description: string;
  size: '1x1' | '2x1';
}

interface MetricCardProps {
  metric: Metric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const isWide = metric.size === '2x1';
  
  return (
    <div 
      className="bg-gradient-to-br from-[--color-sage-50] to-white p-8 rounded-[var(--radius-xl)] border border-[--color-stone-200] bg-[rgb(255,255,255)] rounded-[8px]"
    >
      <div className="text-5xl md:text-6xl bg-gradient-to-br from-[#1a4d2e] to-[#4a6f5a] bg-clip-text text-transparent mb-3">
        {metric.value}
      </div>
      <h4 className="mb-2 text-[--color-navy-800]">
        {metric.title}
      </h4>
      <p className="text-[--color-stone-600]">
        {metric.description}
      </p>
    </div>
  );
}