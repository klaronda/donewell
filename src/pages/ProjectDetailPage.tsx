import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProjectCard } from '../components/ProjectCard';
import { MetricCard, Metric } from '../components/MetricCard';
import { GetStartedModal } from '../components/GetStartedModal';
import { ArrowLeft } from 'lucide-react';

interface ProjectDetailPageProps {
  projectSlug: string;
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

// Mock project detail data
const mockProjectDetail = {
  title: 'Strategy Consulting Platform',
  slug: 'strategy-consulting-platform',
  badge: 'Web Design',
  heroImage: 'https://images.unsplash.com/photo-1759143545924-0ea00615a054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2NTMzMjI3OHww&ixlib=rb-4.1.0&q=80&w=1080',
  overview: `
    <p>Chen Consulting needed a professional online presence to attract enterprise clients and showcase their strategic advisory services. The founder had the expertise but lacked the technical knowledge to build a converting website.</p>
    <p>We partnered with them to create a premium consulting platform that positions them as industry leaders and generates qualified leads on autopilot.</p>
  `,
  problem: `
    <p>Sarah Chen had built a successful consulting practice through referrals, but wanted to scale beyond her immediate network. Her existing website was outdated, difficult to navigate, and didn't communicate her value proposition clearly.</p>
    <ul>
      <li>No clear service offerings or pricing transparency</li>
      <li>Poor mobile experience driving away potential clients</li>
      <li>No lead capture system or consultation booking</li>
      <li>Slow load times (4.5s average) hurting SEO rankings</li>
    </ul>
  `,
  objective: `
    <p>Create a high-converting consulting website that:</p>
    <ul>
      <li>Clearly communicates value and differentiators</li>
      <li>Generates qualified leads through strategic CTAs</li>
      <li>Provides seamless mobile experience</li>
      <li>Loads in under 1 second for optimal SEO</li>
      <li>Integrates calendar booking for consultations</li>
    </ul>
  `,
  actions: `
    <h4>Discovery & Strategy</h4>
    <p>We conducted stakeholder interviews and competitive analysis to understand Chen Consulting's unique positioning and target audience needs.</p>
    
    <h4>Design System</h4>
    <p>Created a premium design language with professional photography, clean typography, and trust-building elements like client logos and testimonials.</p>
    
    <h4>Development</h4>
    <p>Built with modern React and optimized for performance. Integrated Calendly for booking and implemented advanced SEO best practices.</p>
    
    <h4>Content Strategy</h4>
    <p>Rewrote all messaging to focus on client outcomes rather than service descriptions. Created case study templates for ongoing content.</p>
  `,
  results: `
    <p>The new website launched in 12 days and immediately started generating results. Within the first 30 days:</p>
  `,
  metrics: [
    {
      id: '1',
      value: '12',
      title: 'New Clients',
      description: 'Booked in the first month through the website',
      size: '1x1' as const
    },
    {
      id: '2',
      value: '98',
      title: 'Performance Score',
      description: 'Google Lighthouse rating for speed and SEO',
      size: '1x1' as const
    },
    {
      id: '3',
      value: '0.8s',
      title: 'Load Time',
      description: 'Average page load (down from 4.5s)',
      size: '1x1' as const
    },
    {
      id: '4',
      value: '47%',
      title: 'Conversion Rate',
      description: 'Visitors who booked a consultation call',
      size: '1x1' as const
    },
    {
      id: '5',
      value: '450%',
      title: 'ROI in 60 Days',
      description: 'Revenue generated vs. project investment',
      size: '2x1' as const
    }
  ]
};

export function ProjectDetailPage({ projectSlug, onGetStartedClick, isModalOpen, onModalClose }: ProjectDetailPageProps) {
  const project = mockProjectDetail;
  
  // Mock related projects
  const relatedProjects = [
    {
      id: '2',
      title: 'Creative Agency Rebrand',
      slug: 'creative-agency-rebrand',
      keyframeImage: 'https://images.unsplash.com/photo-1613988753173-8db625c972c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwZGVzaWduJTIwbGFwdG9wfGVufDF8fHx8MTc2NTQ1Mjg3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      shortDescription: 'Complete website redesign that increased inbound leads by 340% in 60 days.',
      badge: 'Redesign',
      metricValue: '340%',
      metricLabel: 'Lead Increase',
      showOnWorkPage: true,
      showOnHomepage: true,
      order: 2
    },
    {
      id: '3',
      title: 'Wellness App Prototype',
      slug: 'wellness-app-prototype',
      keyframeImage: 'https://images.unsplash.com/photo-1630734242356-a6f858790740?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc2NTQzMjI1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      shortDescription: 'Interactive prototype that secured $200K seed funding and validated product-market fit.',
      badge: 'App Design',
      metricValue: '$200K',
      metricLabel: 'Funding Raised',
      showOnWorkPage: true,
      showOnHomepage: true,
      order: 3
    }
  ];

  return (
    <div className="min-h-screen">
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
          <div className="aspect-video rounded-[--radius-xl] overflow-hidden shadow-[--shadow-xl] border-4 border-white">
            <img 
              src={project.heroImage} 
              alt={project.title}
              className="w-full h-full object-cover rounded-[8px]"
            />
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-[32px] bg-white pt-[32px] pr-[0px] pb-[64px] pl-[0px] px-[0px]">
        <div className="max-w-4xl mx-auto px-6">
          {/* Overview */}
          <div className="mb-12">
            <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Overview</h2>
            <div 
              className="prose prose-lg max-w-none text-[--color-stone-700]"
              dangerouslySetInnerHTML={{ __html: project.overview }}
            />
          </div>

          {/* Problem */}
          <div className="mb-12">
            <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">The Challenge</h2>
            <div 
              className="prose prose-lg max-w-none text-[--color-stone-700]"
              dangerouslySetInnerHTML={{ __html: project.problem }}
            />
          </div>

          {/* Objective */}
          <div className="mb-12">
            <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Our Objective</h2>
            <div 
              className="prose prose-lg max-w-none text-[--color-stone-700]"
              dangerouslySetInnerHTML={{ __html: project.objective }}
            />
          </div>

          {/* Actions */}
          <div className="mb-12">
            <h2 className="mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">What We Did</h2>
            <div 
              className="prose prose-lg max-w-none text-[--color-stone-700]"
              dangerouslySetInnerHTML={{ __html: project.actions }}
            />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-gradient-to-br from-[--color-sage-50] to-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="mb-4 text-left pt-[0px] pr-[0px] pb-[16px] pl-[0px]">The Results</h2>
          <div 
            className="prose prose-lg max-w-3xl mx-auto text-center mb-12 text-[--color-stone-700] text-left"
            dangerouslySetInnerHTML={{ __html: project.results }}
          />
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {project.metrics.map(metric => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      </section>

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
      <section className="py-20 bg-gradient-to-br from-[--color-forest-700] to-[--color-sage-700] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Ready for Results Like These?</h2>
          <p className="text-xl text-[--color-sage-100] mb-8 pt-[0px] pr-[0px] pb-[24px] pl-[0px]">
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