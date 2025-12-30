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
              This page explains how projects move from idea to launch, including how discovery, planning, and build phases work.
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
                  This is a no-pressure conversation to see if we're a good fit.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  We'll talk about:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>Your business and goals</li>
                  <li>What you're hoping to build</li>
                  <li>What's working and what's not</li>
                  <li>A rough ballpark range for the project</li>
                </ul>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-2">
                  There's no obligation here.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  If it feels like a fit, we'll recommend moving into Discovery.
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
                <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">How Discovery Works</h3>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  Before the session, you'll receive a short checklist to help you think through priorities (no need for perfect answers).
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  During our 60-minute working session, we:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>Define the primary goal of the site</li>
                  <li>Identify must-have vs. nice-to-have features</li>
                  <li>Clarify audience, messaging, and tone</li>
                  <li>Sketch a rough site structure together</li>
                  <li>Surface optional add-ons or future phases</li>
                </ul>
                <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">Discovery Deposit</h3>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  To schedule Discovery, we ask for a <strong>$650 Discovery & Roadmap deposit</strong>.
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>This deposit holds the session</li>
                  <li>If we move forward together, it is fully credited into your project</li>
                  <li>If you decide not to continue, you keep the roadmap and ideas, and the deposit simply covers the session</li>
                </ul>
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
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  After Discovery, you'll receive a written roadmap that includes:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>Final scope for the initial MVP</li>
                  <li>What is included and not included</li>
                  <li>Optional add-ons or future phases</li>
                  <li>Timeline and final pricing</li>
                </ul>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  This roadmap becomes our <strong>shared plan and reference</strong> for the build.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  At this point, you decide whether to move forward.
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
                  <h2 className="text-[--color-forest-700] mb-4 pt-[0px] pr-[0px] pb-[16px] pl-[0px]">Build Authorization & Deposit</h2>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  Before any design or development begins:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>We confirm the scope outlined in the roadmap</li>
                  <li>A <strong>50% project deposit</strong> (minus your Discovery credit) is collected</li>
                </ul>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  Work begins once this deposit is received.
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
                    <strong>Delivered within ~3 business days</strong>
                  </p>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  We translate the roadmap into a working prototype that focuses on structure, layout, and direction.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  You'll receive:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>A clickable prototype</li>
                  <li>1–2 focused feedback rounds</li>
                </ul>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  This ensures we're aligned on direction before we build.
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
                    <strong>~7–10 business days (depending on scope)</strong>
                  </p>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  We turn the approved blueprint into a production-ready site. This includes:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>Full site build and integrations</li>
                  <li>Performance optimization</li>
                  <li>SEO fundamentals (metadata, sitemap, search setup)</li>
                  <li>URL routing and redirects</li>
                  <li>Lighthouse testing and cleanup</li>
                  <li>Open Graph setup, favicon, and final QA</li>
                </ul>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  You'll review the site on a private preview link.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  Feedback at this stage is for:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>Bug fixes</li>
                  <li>Small visual or copy tweaks</li>
                </ul>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  New features or major changes are handled separately.
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
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  Once the build is approved, the <strong>final balance is due</strong>.
                </p>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                  After payment clears:
                </p>
                <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                  <li>We connect the domain</li>
                  <li>The site is launched</li>
                </ul>
                <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                  We do not move a site to a live domain until final payment is complete.
                </p>
              </div>
            </div>

            {/* After Launch */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">After Launch — Ongoing Support (Optional)</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-2">
                Some clients want continued monitoring, updates, and care.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Others prefer to take the site and run with it.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Both options are supported.
              </p>
            </div>

            {/* Important Notes */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">A Few Important Notes</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed mb-2">
                    <strong>Content</strong>
                  </p>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed">
                    We don't act as a copywriting service. Initial placeholder copy may be generated for layout, but final content approval is yours.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed mb-2">
                    <strong>Scope Changes</strong>
                  </p>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed">
                    Anything added after Discovery is quoted separately or scheduled as a future phase.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed mb-2">
                    <strong>Pauses</strong>
                  </p>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed">
                    If feedback is delayed, timelines pause and the project may be deprioritized until it resumes.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed mb-2">
                    <strong>Ownership & Decisions</strong>
                  </p>
                  <p className="text-lg text-[--color-stone-700] leading-relaxed">
                    We handle structure, performance, and setup. You approve direction and make final decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Why This Works */}
            <div className="mb-24">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">Why This Process Works</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                This approach protects clarity on both sides:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>You always know what you're paying for</li>
                <li>Scope and timelines stay predictable</li>
                <li>There are no surprises at launch</li>
              </ul>
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
