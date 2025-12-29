import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProjectCard } from '../components/ProjectCard';
import { GetStartedModal } from '../components/GetStartedModal';
import { useAdmin } from '../contexts/AdminContext';

interface WorkPageProps {
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function WorkPage({ onGetStartedClick, isModalOpen, onModalClose }: WorkPageProps) {
  const { projects } = useAdmin();
  
  const visibleProjects = projects
    .filter(p => p.showOnWorkPage)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen">
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[--color-sage-50] via-white to-[--color-forest-50] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-white rounded-full text-sm tracking-wider text-[--color-stone-600] mb-6 border border-[--color-stone-200]">
              OUR WORK
            </div>
            <h1 className="mb-6">Live Projects That Drive Results</h1>
            <p className="text-xl text-[--color-stone-700] max-w-2xl mx-auto pt-[8px] pr-[0px] pb-[0px] pl-[0px]">
              Every project we build is designed to help entrepreneurs launch faster, 
              attract customers, and grow their business.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {visibleProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[--color-stone-600] text-xl">
                No projects to display yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[--color-forest-700] to-[--color-sage-700] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-white mb-6 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Ready to See Your Project Here?</h2>
          <p className="text-xl text-[--color-sage-100] mb-8 pt-[0px] pr-[0px] pb-[24px] pl-[0px]">
            Let's bring your vision to life with the same quality and speed.
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