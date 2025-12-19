import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface Project {
  id: string;
  title: string;
  slug: string;
  keyframeImage: string;
  shortDescription: string;
  badge: string;
  metricValue: string;
  metricLabel: string;
  showOnWorkPage: boolean;
  showOnHomepage: boolean;
  order: number;
  
  // New rich text fields
  summary?: string;
  problem?: string;
  objective?: string;
  ourActions?: string;
  results?: string;
  
  // Result metrics (array of metrics for the results section)
  resultMetrics?: Array<{
    value: string;
    title: string;
    description: string;
  }>;
  
  // Live website URL
  liveWebsiteUrl?: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a 
      href={`/projects/${project.slug}`}
      className="group block bg-white rounded-[8px] overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-xl)] transition-all duration-300 border border-[--color-stone-200]"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-[--color-stone-100]">
        <img 
          src={project.keyframeImage} 
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Metric */}
        {project.metricValue && (
          <div className="absolute bottom-4 right-4 bg-[--color-forest-700] text-white px-4 py-2 rounded-lg">
            <div className="text-2xl">{project.metricValue}</div>
            <div className="text-xs opacity-90">{project.metricLabel}</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <h4 className="group-hover:text-[--color-forest-700] transition-colors">
            {project.title}
          </h4>
          {/* Badge */}
          {project.badge && (
            <div className="px-3 py-1 bg-[--color-sage-100] rounded-full text-xs tracking-wide text-[--color-forest-700] font-medium whitespace-nowrap">
              {project.badge}
            </div>
          )}
        </div>
        <p className="text-[--color-stone-600] mb-4 leading-relaxed pt-[0px] pr-[0px] pb-[16px] pl-[0px]">
          {project.shortDescription}
        </p>
        <div className="flex items-center gap-2 text-[--color-forest-600] group-hover:gap-3 transition-all">
          <span className="text-sm">View Project</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </a>
  );
}