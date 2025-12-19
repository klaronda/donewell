import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
}

export function TestimonialCard({ quote, author, role, company, image }: TestimonialCardProps) {
  return (
    <div className="bg-white p-8 rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[--color-stone-200] h-full flex flex-col rounded-[8px]">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} fill="currentColor" className="text-[--color-amber-400]" />
        ))}
      </div>
      <p className="text-[--color-stone-800] mb-6 leading-relaxed flex-grow">
        "{quote}"
      </p>
      <div className="flex items-center gap-4">
        <img 
          src={image} 
          alt={author}
          className="w-12 h-12 rounded-full object-cover"
          loading="lazy"
          width={48}
          height={48}
        />
        <div>
          <div className="text-[--color-stone-900]">{author}</div>
          <div className="text-sm text-[--color-stone-600]">{role}, {company}</div>
        </div>
      </div>
    </div>
  );
}