import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CapabilityCardProps {
  title: string;
  description: string;
  includes: string[];
  inPractice?: string;
}

/**
 * CapabilityCard - Reusable card component for capability sections
 * 
 * Features:
 * - Title and description
 * - Bullet list of included items
 * - Optional expandable "In practice" section (collapsed by default)
 * - Clean, non-technical language
 * - Reusable for case studies later
 */
export function CapabilityCard({ title, description, includes, inPractice }: CapabilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-[--color-stone-200] p-6 hover:shadow-md transition-shadow duration-300">
      {/* Title */}
      <h3 className="text-xl font-semibold text-[--color-forest-700] mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[--color-stone-700] leading-relaxed mb-4">
        {description}
      </p>

      {/* Includes List */}
      <div className="mb-4">
        <ul className="space-y-2">
          {includes.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-[--color-stone-600]">
              <span className="text-[--color-forest-600]">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* In Practice Section (Expandable) */}
      {inPractice && (
        <div className="border-t border-[--color-stone-200] pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-left text-sm font-medium text-[--color-forest-700] hover:text-[--color-forest-800] transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`practice-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span>What this looks like in practice</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'transform rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
          <div
            id={`practice-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-96 mt-3' : 'max-h-0'
            }`}
          >
            <p className="text-sm text-[--color-stone-600] leading-relaxed italic">
              {inPractice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
