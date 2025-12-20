import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { ProcessCard } from '../components/ProcessCard';
import { CaseStudyCard } from '../components/CaseStudyCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { TrustBadge } from '../components/TrustBadge';
import { GetStartedModal } from '../components/GetStartedModal';
import { SEO } from '../components/SEO';
import { 
  Lightbulb, 
  FileText, 
  Hammer, 
  Rocket, 
  CheckCircle2,
  Shield,
  Award,
  Zap,
  Users
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAdmin } from '../contexts/AdminContext';

interface HomePageProps {
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function HomePage({ onGetStartedClick, isModalOpen, onModalClose }: HomePageProps) {
  const { projects, testimonials, metrics } = useAdmin();
  
  // Get homepage projects (featured)
  const featuredProjects = projects
    .filter(p => p.showOnHomepage)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  
  // Get homepage testimonials
  const featuredTestimonials = testimonials
    .filter(t => t.showOnHomepage)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  
  // Get metrics
  const sortedMetrics = [...metrics].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen">
      <SEO 
        description="We turn your vision into professional websites and apps that your customers will love — without the tech headaches. Average 14-day delivery."
        url="https://donewellco.com"
      />
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* HERO SECTION - Enhanced for Conversion */}
      <section className="relative bg-gradient-to-br from-[--color-sage-50] via-white to-[--color-forest-50] overflow-hidden">
        <div className="max-w-7xl mx-auto px-[24px] md:py-28 py-[64px] pt-[40px] pr-[24px] pb-[64px] pl-[24px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[--color-sage-100] to-[--color-forest-100] rounded-full mb-6 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#1a4d2e]"></div>
                <span className="text-sm tracking-wide text-[--color-forest-700]">
                  ⚡ Projects Launched in 14 Days or Less
                </span>
              </div>
              <h1 className="mb-6 bg-gradient-to-br from-[--color-navy-900] via-[--color-forest-800] to-[--color-sage-700] bg-clip-text text-transparent">
                Your Idea. Built Right. Delivered Fast.
              </h1>
              <p className="text-xl text-[--color-stone-800] mb-6 leading-relaxed px-[0px] py-[24px] mx-auto my-[12px] max-w-2xl text-left">
                We turn your vision into professional websites and apps that your customers will love — without the tech headaches.
              </p>
              
              {/* Trust Signals */}
              <div className="flex flex-wrap gap-3 mb-8">
                <TrustBadge icon={<CheckCircle2 size={18} />} text="100% Client Satisfaction" />
                <TrustBadge icon={<Shield size={18} />} text="30-Day Support Included" />
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button variant="primary" size="large" onClick={onGetStartedClick}>
                  Get Started Free →
                </Button>
                <a href="/work">
                  <Button variant="secondary" size="large">
                    See Live Projects
                  </Button>
                </a>
              </div>
              
              {/* Social Proof Line */}
              <div className="flex items-center gap-3 text-sm text-[--color-stone-700]">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90JTIwd29tYW58ZW58MXx8fHwxNzY1OTgwNDc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" loading="lazy" width={32} height={32} />
                  <img src="https://images.unsplash.com/photo-1723537742563-15c3d351dbf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90JTIwbWFufGVufDF8fHx8MTc2NTk2MjQ2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" loading="lazy" width={32} height={32} />
                  <img src="https://images.unsplash.com/photo-1762522926157-bcc04bf0b10a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjU5ODA0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" loading="lazy" width={32} height={32} />
                </div>
                <span><strong className="text-[--color-stone-900]">50+ entrepreneurs</strong> launched their ideas with DoneWell</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] lg:h-[500px] rounded-[var(--radius-xl)] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-white">
                <ImageWithFallback 
                  src="https://udiskjjuszutgpvkogzw.supabase.co/storage/v1/object/public/site-assets/Homepage/Hero.avif"
                  alt="Modern website design"
                  className="w-full h-full object-cover rounded-[8px]"
                  loading="eager"
                  width={800}
                  height={500}
                />
              </div>
              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] border border-[--color-stone-200] rounded-[8px]">
                <div className="text-4xl bg-gradient-to-br from-[#1a4d2e] to-[#4a6f5a] bg-clip-text text-transparent mb-1">99%</div>
                <div className="text-sm text-[--color-stone-700]">Average Site Performance</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[--color-sage-200] rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-[--color-forest-100] rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      </section>
      
      {/* STATS BAR */}
      <section className="py-16 bg-gradient-to-r from-[#255741] to-[#345a45]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            {sortedMetrics.map(metric => (
              <div key={metric.id} className="text-center">
                <div className="text-3xl md:text-6xl mb-2">{metric.value}</div>
                <div className="text-sm md:text-base text-white opacity-90">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* THE DONEWELL PROCESS */}
      <section className="py-24 bg-white" id="process">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm tracking-wider text-[--color-forest-700] mb-4">
              OUR PROVEN PROCESS
            </div>
            <h2 className="mb-6">From Idea to Launch in 4 Simple Steps</h2>
            <div className="flex justify-center">
              <p className="text-xl text-[--color-stone-600] max-w-2xl pt-4" style={{ textAlign: 'center' }}>
                A clear, proven path that takes you from concept to a live website — with zero stress.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProcessCard
              number="1"
              title="Discovery"
              description="We meet 1:1 to understand your idea, business goals, and customer needs."
              icon={<Lightbulb size={24} strokeWidth={1.5} />}
            />
            <ProcessCard
              number="2"
              title="Blueprint"
              description="We craft a clear plan and produce a working prototype you can react to."
              icon={<FileText size={24} strokeWidth={1.5} />}
            />
            <ProcessCard
              number="3"
              title="Build"
              description="We develop your site or app using modern tools, fast timelines, and thoughtful details."
              icon={<Hammer size={24} strokeWidth={1.5} />}
            />
            <ProcessCard
              number="4"
              title="Live"
              description="We launch your project and support you during your first 30 days, so everything runs smoothly."
              icon={<Rocket size={24} strokeWidth={1.5} />}
            />
          </div>
        </div>
      </section>
      
      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-[--color-sand-50]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white rounded-full text-sm tracking-wider text-[--color-stone-600] mb-4">
              CLIENT SUCCESS STORIES
            </div>
            <h2 className="mb-6">What Our Clients Say</h2>
            <div className="flex justify-center">
              <p className="text-xl text-[--color-stone-700] max-w-2xl pt-4" style={{ textAlign: 'center' }}>
                Real results from real entrepreneurs who trusted us with their vision.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTestimonials.map(testimonial => (
              <TestimonialCard
                key={testimonial.id}
                quote={testimonial.quote}
                author={testimonial.name}
                role={testimonial.role}
                company={testimonial.company}
                image={testimonial.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* CASE STUDY PREVIEW SECTION */}
      <section className="py-24 bg-white" id="work">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm tracking-wider text-[--color-stone-700] mb-4">
              RECENT LAUNCHES
            </div>
            <h2 className="mb-6">Projects That Drove Real Results</h2>
            <div className="flex justify-center">
              <p className="text-xl text-[--color-stone-700] max-w-2xl pt-4" style={{ textAlign: 'center' }}>
                See how we've helped entrepreneurs launch, grow, and succeed online.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map(project => (
              <CaseStudyCard
                key={project.id}
                image={project.keyframeImage}
                title={project.title}
                description={project.shortDescription}
                slug={project.slug}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* WHY CHOOSE US */}
      <section className="py-24 bg-gradient-to-br from-[--color-sage-50] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white rounded-full text-sm tracking-wider text-[--color-stone-600] mb-4 border border-[--color-stone-200]">
              WHY DONEWELL
            </div>
            <h2 className="mb-6">The Smart Choice for Non-Technical Founders</h2>
            <div className="flex justify-center">
              <p className="text-xl text-[--color-stone-600] max-w-2xl pt-4" style={{ textAlign: 'center' }}>
                We remove the complexity and deliver results you can measure.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[--color-stone-200] rounded-[8px]">
              <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br from-[--color-forest-100] to-[--color-sage-100] flex items-center justify-center mb-4">
                <Zap className="text-[--color-forest-600]" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 pt-[0px] pr-[0px] pb-[8px] pl-[0px]">Lightning Fast Delivery</h3>
              <p className="text-[--color-stone-600] leading-relaxed">
                Average 14-day delivery. No months-long waits. We move fast without cutting corners.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[--color-stone-200] rounded-[8px]">
              <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br from-[--color-forest-100] to-[--color-sage-100] flex items-center justify-center mb-4">
                <Users className="text-[--color-forest-600]" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 pt-[0px] pr-[0px] pb-[8px] pl-[0px]">Built For Non-Tech People</h3>
              <p className="text-[--color-stone-600] leading-relaxed">
                Clear communication, zero jargon. You'll understand every step of the process.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[--color-stone-200] rounded-[8px]">
              <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br from-[--color-forest-100] to-[--color-sage-100] flex items-center justify-center mb-4">
                <Award className="text-[--color-forest-600]" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 pt-[0px] pr-[0px] pb-[8px] pl-[0px]">Premium Quality</h3>
              <p className="text-[--color-stone-600] leading-relaxed">
                Beautiful design meets solid code. Your site will look great and perform flawlessly.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA BANNER */}
      <section className="py-24 bg-sage-50 relative overflow-hidden" id="contact">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-forest-700 mb-6">Ready to Launch Your Idea?</h2>
          
          <p className="text-xl text-stone-700 mb-4 pt-[24px] pr-[0px] pb-[0px] pl-[0px]">
            Book a free 30-minute consultation and see how we can bring your vision to life.
          </p>
          
          <p className="text-stone-600 mb-10 pt-[0px] pr-[0px] pb-[24px] pl-[0px]">
            No sales pressure. Just honest advice about your project.
          </p>
          
          <div className="mb-8">
            <Button variant="primary" size="large" onClick={onGetStartedClick}>
              Book Your Free Consultation →
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center text-sm px-4 text-stone-600">
            <span>✓ Free consultation</span>
            <span>✓ No commitment</span>
            <span>✓ Get a project roadmap</span>
          </div>
        </div>
      </section>
      
      <Footer />
      <GetStartedModal isOpen={isModalOpen} onClose={onModalClose} />
    </div>
  );
}