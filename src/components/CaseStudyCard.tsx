import React from 'react';
import { Button } from './Button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CaseStudyCardProps {
  image: string;
  title: string;
  description: string;
}

export function CaseStudyCard({ image, title, description }: CaseStudyCardProps) {
  return (
    <div className="bg-white rounded-[--radius-xl] overflow-hidden shadow-[--shadow-md] hover:shadow-[--shadow-xl] transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video w-full overflow-hidden bg-[--color-sand-100]">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 rounded-[8px]"
        />
      </div>
      <div className="p-6">
        <h4 className="mb-2 pt-[0px] pr-[0px] pb-[8px] pl-[0px]">{title}</h4>
        <p className="text-[--color-stone-700] mb-5 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">{description}</p>
        <Button variant="secondary" size="medium">
          View Project
        </Button>
      </div>
    </div>
  );
}