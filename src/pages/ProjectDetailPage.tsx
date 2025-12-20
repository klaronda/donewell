import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProjectCard } from '../components/ProjectCard';
import { MetricCard, Metric } from '../components/MetricCard';
import { GetStartedModal } from '../components/GetStartedModal';
import { SEO } from '../components/SEO';
import { ProjectDetailSkeleton } from '../components/ProjectDetailSkeleton';
import { useAdmin } from '../contexts/AdminContext';
import { ArrowLeft } from 'lucide-react';

interface ProjectDetailPageProps {
  projectSlug: string;
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function ProjectDetailPage({ projectSlug, onGetStartedClick, isModalOpen, onModalClose }: ProjectDetailPageProps) {
  const { projects, loading } = useAdmin();
  
  // Show skeleton loader while loading
  if (loading) {
    return <ProjectDetailSkeleton onGetStartedClick={onGetStartedClick} />;
  }
  
  // Find project by slug
  const project = projects.find(p => p.slug === projectSlug);
  
  // Get related projects (exclude current, show on work page, limit to 3)
  const relatedProjects = projects
    .filter(p => p.slug !== projectSlug && p.showOnWorkPage)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  // If project not found after loading completes, show error state
  if (!project) {
    return (
      <div className="min-h-screen">
        <SEO 
          title="Project Not Found"
          description="The project you're looking for doesn't exist."
          url="https://donewellco.com/projects/not-found"
        />
        <Header onGetStartedClick={onGetStartedClick} />
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="mb-4">Project Not Found</h1>
            <p className="text-[--color-stone-600] mb-8">The project you're looking for doesn't exist.</p>
            <a 
              href="/work" 
              className="inline-flex items-center gap-2 text-[--color-forest-700] hover:text-[--color-forest-800] transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Work</span>
            </a>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Transform result metrics to MetricCard format
  const resultMetrics: Metric[] = project.resultMetrics?.map((rm, index) => ({
    id: `result-${index}`,
    value: rm.value,
    title: rm.title,
    description: rm.description,
    size: '1x1' as const,
  })) || [];

  return (
    <div className="min-h-screen">
      <SEO 
        title={project.title}
        description={project.shortDescription || `Learn about ${project.title} - a project by DoneWell.`}
        image={project.keyframeImage}
        url={`https://donewellco.com/projects/${project.slug}`}
        type="article"
      />
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* Back Navigation */}
      <section className="bg-white border-b border-[--color-stone-200] py-4">
        <div className="max-w-7xl mx-auto px-6">
          <a 
            href="/work" 
            className="inline-flex items-center gap-2 text-[--color-stone-700] hover:text-[--color-forest-700] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Work</span>
          </a>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[--color-sage-50] to-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1.5 bg-white rounded-full text-xs tracking-wide text-[--color-forest-700] border border-[--color-stone-200]">
              {project.badge}
            </span>
          </div>
          <h1 className="mb-8 pt-[0px] pr-[0px] pb-[24px] pl-[0px]">{project.title}</h1>
          <div className="aspect-video rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xl)] border-4 border-white">
            <img 
              src={project.keyframeImage} 
              alt={project.title}
              className="w-full h-full object-cover rounded-[8px]"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-[32px] bg-white pt-[32px] pr-[0px] pb-[64px] pl-[0px] px-[0px]">
        <div className="max-w-4xl mx-auto px-6">
          {/* Overview */}
          {project.summary && (
            <div className="mb-12">
              <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Overview</h2>
              <div 
                className="prose prose-lg max-w-none text-[--color-stone-700] mb-6"
                dangerouslySetInnerHTML={{ __html: project.summary }}
              />
              {project.liveWebsiteUrl && (
                <a
                  href={project.liveWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143d24] transition-colors"
                >
                  View Experience Live
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Problem */}
          {project.problem && (
            <div className="mb-12">
              <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">The Challenge</h2>
              <div 
                className="prose prose-lg max-w-none text-[--color-stone-700]"
                dangerouslySetInnerHTML={{ __html: project.problem }}
              />
            </div>
          )}

          {/* Objective */}
          {project.objective && (
            <div className="mb-12">
              <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Our Objective</h2>
              <div 
                className="prose prose-lg max-w-none text-[--color-stone-700]"
                dangerouslySetInnerHTML={{ __html: project.objective }}
              />
            </div>
          )}

          {/* Actions */}
          {project.ourActions && (
            <div className="mb-12">
              <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">What We Did</h2>
              <div 
                className="prose prose-lg max-w-none text-[--color-stone-700]"
                dangerouslySetInnerHTML={{ __html: project.ourActions }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {project.results && (
        <section className="py-16 bg-gradient-to-br from-[--color-sage-50] to-white">
          <div className="max-w-5xl mx-auto px-6">
          <h2 className="mb-4 text-left pt-[0px] pr-[0px] pb-[16px] pl-[0px]">The Results</h2>
          <div 
            className="prose prose-lg max-w-3xl text-left mb-12 text-stone-700"
            dangerouslySetInnerHTML={{ __html: project.results }}
          />
            
            {/* Metrics Grid */}
            {resultMetrics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resultMetrics.map(metric => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related Projects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-left mb-8 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">More Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sage-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-forest-700 mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Ready for Results Like These?</h2>
          <p className="text-xl text-stone-700 mb-8 pt-[0px] pr-[0px] pb-[24px] pl-[0px]">
            Let's discuss how we can deliver similar outcomes for your project.
          </p>
          <button 
            onClick={onGetStartedClick}
            className="px-8 py-4 bg-[#1B4D2E] text-white rounded-lg hover:bg-[#143d24] transition-colors"
          >
            Get Started Free →
          </button>
        </div>
      </section>

      <Footer />
      <GetStartedModal isOpen={isModalOpen} onClose={onModalClose} />
    </div>
  );
}