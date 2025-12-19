import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GetStartedModal } from '../components/GetStartedModal';
import { SEO } from '../components/SEO';
import { CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function AboutPage({ onGetStartedClick, isModalOpen, onModalClose }: AboutPageProps) {
  return (
    <div className="min-h-screen">
      <SEO 
        title="About DoneWell - Helping People Bring Their Ideas to Life"
        description="DoneWell exists to help people bring their ideas to life — thoughtfully, professionally, and without unnecessary complexity. We believe good digital work starts with understanding."
        url="https://donewellco.com/about"
      />
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* Hero Section */}
      <section className="bg-[#295841] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-white rounded-full text-sm tracking-wider text-[--color-stone-600] mb-6 border border-[--color-stone-200]">
              ABOUT US
            </div>
            <h1 className="mb-6 pt-[0px] pr-[0px] pb-[24px] pl-[0px] !text-white">About DoneWell</h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed !text-white">
              DoneWell exists to help people bring their ideas to life — thoughtfully, professionally, 
              and without unnecessary complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-8">
              Many of our clients are experts in what they do, but don't want to become experts in 
              websites, apps, or technology just to get their business off the ground. They want something 
              that looks professional, works reliably, and reflects the quality of their work.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-24">
              That's where we come in.
            </p>

            <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Our Approach</h2>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
              We believe good digital work starts with understanding — not templates.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-8">
              Every project begins with a conversation. We take the time to understand your business, 
              your goals, and your customers, then design and build a solution that fits your needs today 
              while leaving room to grow tomorrow.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-8">
              Our process is simple and structured:
            </p>

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="bg-[--color-sage-50] rounded-[8px] border border-[--color-sage-200] pt-[24px] pr-[24px] pb-[0px] pl-[24px]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="text-[--color-forest-700] mb-2">Discovery</h3>
                    <p className="text-[--color-stone-700] mt-[0px] mr-[0px] mb-[12px] ml-[0px]">
                      We clarify your idea, your challenges, and what success looks like.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[--color-sage-50] rounded-[8px] border border-[--color-sage-200] pt-[24px] pr-[24px] pb-[0px] pl-[24px]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="text-[--color-forest-700] mb-2">Blueprint</h3>
                    <p className="text-[--color-stone-700] mt-[0px] mr-[0px] mb-[12px] ml-[0px]">
                      We translate that understanding into a clear plan and prototype.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[--color-sage-50] rounded-[8px] border border-[--color-sage-200] pt-[24px] pr-[24px] pb-[0px] pl-[24px]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="text-[--color-forest-700] mb-2">Build</h3>
                    <p className="text-[--color-stone-700] mt-[0px] mr-[0px] mb-[12px] ml-[0px]">
                      We design and develop your site or application with care and attention to detail.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[--color-sage-50] rounded-[8px] border border-[--color-sage-200] pt-[24px] pr-[24px] pb-[0px] pl-[24px]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="text-[--color-forest-700] mb-2">Live</h3>
                    <p className="text-[--color-stone-700] mt-[0px] mr-[0px] mb-[12px] ml-[0px]">
                      We launch confidently and support you as your project goes live.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-24 italic">
              No buzzwords. No over-engineering. Just thoughtful work, done well.
            </p>

            <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">Who We Work With</h2>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
              DoneWell works primarily with professionals and small businesses who want a reliable 
              partner they can trust.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
              That includes consultants, lawyers, therapists, real estate professionals, creators, 
              and founders — especially those starting something new or upgrading an existing website 
              that no longer reflects the quality of their work.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-[48px] mt-[0px] mr-[0px] ml-[0px]">
              Our clients value clarity, professionalism, and getting things done right the first time.
            </p>

            <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">Experience You Can Rely On</h2>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
              DoneWell is led by a designer and builder with deep experience in UX, product design, 
              and modern development workflows.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
              Behind the scenes, our work draws from years of experience designing and shipping real 
              products, improving complex systems, and helping teams and businesses turn ideas into 
              working solutions. We combine design thinking, technical execution, and practical business 
              sense — so projects don't just look good, they work.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-24">
              We use modern tools and processes to move efficiently, but we never lose sight of the 
              human side of the work.
            </p>

            <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">Why "DoneWell"</h2>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
              The name reflects our philosophy.
            </p>
            <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
              We believe quality comes from care, not shortcuts. From listening closely, making good 
              decisions early, and following through. When something is done well, it earns trust — 
              and trust is the foundation of any successful partnership.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sage-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-forest-700 mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Let's Get Started</h2>
          <p className="text-xl text-stone-700 mb-4">
            If you have an idea you'd like to explore, or a website that needs improvement, we'd love to talk.
          </p>
          <p className="text-lg text-stone-600 mb-8 pt-[0px] pr-[0px] pb-[24px] pl-[0px]">
            You don't need a perfect plan — just a place to start.
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