import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface ProjectDetailSkeletonProps {
  onGetStartedClick?: () => void;
}

export function ProjectDetailSkeleton({ onGetStartedClick }: ProjectDetailSkeletonProps) {
  return (
    <div className="min-h-screen">
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* Back Navigation Skeleton */}
      <section className="bg-white border-b border-[--color-stone-200] py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </section>

      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-br from-[--color-sage-50] to-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-6">
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-12 w-3/4 bg-gray-200 rounded mb-8 animate-pulse"></div>
          <div className="aspect-video rounded-[var(--radius-xl)] overflow-hidden bg-gray-200 animate-pulse"></div>
        </div>
      </section>

      {/* Content Sections Skeleton */}
      <section className="py-[32px] bg-white pt-[32px] pr-[0px] pb-[64px] pl-[0px] px-[0px]">
        <div className="max-w-4xl mx-auto px-6">
          {/* Overview Skeleton */}
          <div className="mb-12">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-48 bg-gray-200 rounded-lg mt-6 animate-pulse"></div>
          </div>

          {/* Challenge Skeleton */}
          <div className="mb-12">
            <div className="h-8 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Objective Skeleton */}
          <div className="mb-12">
            <div className="h-8 w-36 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="mb-12">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section Skeleton */}
      <section className="py-16 bg-gradient-to-br from-[--color-sage-50] to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="space-y-3 mb-12">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-12 w-20 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Projects Skeleton */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-8 w-40 bg-gray-200 rounded mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Skeleton */}
      <section className="py-20 bg-sage-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4 mx-auto animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 rounded mb-8 mx-auto animate-pulse"></div>
          <div className="h-12 w-48 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
