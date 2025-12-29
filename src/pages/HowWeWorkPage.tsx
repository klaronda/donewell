import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GetStartedModal } from '../components/GetStartedModal';
import { SEO } from '../components/SEO';

interface HowWeWorkPageProps {
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function HowWeWorkPage({ onGetStartedClick, isModalOpen, onModalClose }: HowWeWorkPageProps) {
  return (
    <div className="min-h-screen">
      <SEO 
        title="How We Work - DoneWell Process"
        description="We keep our process clear, structured, and human — so you always know what's happening, what decisions matter, and when things are locked."
        url="https://donewellco.com/how-we-work"
        noindex={true}
      />
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* Hero Section */}
      <section className="bg-[#295841] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-white rounded-full text-sm tracking-wider text-[--color-stone-600] mb-6 border border-[--color-stone-200]">
              OUR PROCESS
            </div>
            <h1 className="mb-6 pt-[0px] pr-[0px] pb-[24px] pl-[0px] !text-white">How We Work</h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed !text-white">
              We keep our process clear, structured, and human — so you always know what's happening, what decisions matter, and when things are locked.
            </p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed !text-white mt-4 opacity-90">
              This page explains exactly how projects move from idea to launch, including how discovery, contracts, and payments work.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            
            {/* Step 1 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 font-semibold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Free Intro Call (30 minutes)</h2>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  This is a no-pressure conversation to see if we're a good fit. We'll talk about your business and goals, what you're hoping to build, what's working and what's not, and give you a <strong>ballpark range</strong> for the project.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  There's no obligation here. If it feels like a fit, we'll recommend moving into Discovery.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 font-semibold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Discovery & Roadmap Session</h2>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  Discovery is where clarity happens — and where pricing and scope become real.
                </p>
                <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">How Discovery works</h3>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  Before the session, you'll receive a short checklist to help you think through priorities (no need for perfect answers). During our <strong>60-minute working session</strong>, we define the primary goal of the site, identify must-have vs. nice-to-have features, clarify audience, messaging, and tone, sketch a rough site structure together, and surface optional add-ons or future phases.
                </p>
                <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">Discovery deposit</h3>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  To schedule Discovery, we ask for a <strong>$650 Discovery & Roadmap deposit</strong>. This deposit holds the session. If we move forward together, it is <strong>fully credited into your project</strong>. If you decide not to continue, you keep the roadmap and ideas, and the deposit simply covers the session.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  This ensures the session has value on both sides.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 font-semibold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Roadmap & Final Scope</h2>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  After Discovery, you'll receive a written roadmap that includes the final scope for the initial MVP, what is <strong>included</strong> and <strong>not included</strong>, optional add-ons or future phases, and timeline and final pricing.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  This roadmap becomes our shared agreement. At this point, you decide whether to move forward with the build.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 font-semibold text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Build Agreement & Deposit</h2>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  Before any design or development begins, we finalize the scope, sign a simple build agreement, and collect a <strong>50% project deposit</strong> (minus your Discovery credit). Work begins once this deposit is received.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 font-semibold text-lg">
                  5
                </div>
                <div className="flex-1">
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Blueprint (Design Direction)</h2>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4 italic">
                    Delivered within ~3 business days
                  </p>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  We translate the roadmap into a working prototype that focuses on structure, layout, and direction. You'll receive a clickable prototype and 1–2 focused feedback rounds to align on direction. This ensures we're aligned before we build.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 font-semibold text-lg">
                  6
                </div>
                <div className="flex-1">
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Build</h2>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4 italic">
                    ~7–10 business days (depending on scope)
                  </p>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  We turn the approved blueprint into a production-ready site. This includes full site build and integrations, performance optimization, SEO fundamentals (metadata, sitemap, search setup), URL routing and redirects, Lighthouse testing and cleanup, Open Graph, favicon, and final QA.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  You'll review the site on a private preview link. Feedback at this stage is for bug fixes and small visual or copy tweaks. New features or major changes are handled separately.
                </p>
              </div>
            </div>

            {/* Step 7 */}
            <div className="mb-16">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[--color-forest-700] text-[--color-forest-700] flex-shrink-0 font-semibold text-lg">
                  7
                </div>
                <div className="flex-1">
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Final Payment & Launch</h2>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  Once the build is approved, the <strong>final balance is due</strong>. After payment clears, we connect the domain and launch the site.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  We do not move a site to a live domain until final payment is complete.
                </p>
              </div>
            </div>

            {/* After Launch */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">After Launch — Ongoing Support (Optional)</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Some clients want continued monitoring, updates, and care. Others prefer to take the site and run with it. Both options are supported.
              </p>
            </div>

            {/* Important Notes */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">A Few Important Notes</h2>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-4 list-disc list-outside ml-6 pl-4">
                <li><strong>Content:</strong> We don't act as a copywriting service. Initial placeholder copy may be generated for layout, but final content approval is yours.</li>
                <li><strong>Scope changes:</strong> Anything added after Discovery is quoted separately or scheduled as a future phase.</li>
                <li><strong>Pauses:</strong> If feedback is delayed, timelines pause and the project may be deprioritized until it resumes.</li>
                <li><strong>Ownership:</strong> We handle structure, performance, and setup. You approve direction and make final decisions.</li>
              </ul>
            </div>

            {/* Why This Works */}
            <div className="mb-24">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">Why This Process Works</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                This approach protects clarity on both sides: you always know what you're paying for, scope and timelines stay predictable, and there are no surprises at launch.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                If you have questions at any point, just ask — clarity is part of the service.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
      <GetStartedModal isOpen={isModalOpen} onClose={onModalClose} />
    </div>
  );
}
