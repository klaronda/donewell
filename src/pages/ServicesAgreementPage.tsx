import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GetStartedModal } from '../components/GetStartedModal';
import { SEO } from '../components/SEO';

interface ServicesAgreementPageProps {
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export function ServicesAgreementPage({ onGetStartedClick, isModalOpen, onModalClose }: ServicesAgreementPageProps) {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Services Agreement - DoneWell"
        description="DoneWell Services Agreement governing all professional services provided by DoneWell."
        url="https://donewellco.com/services-agreement"
        noindex={true}
      />
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* Hero Section */}
      <section className="bg-[#295841] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-white rounded-full text-sm tracking-wider text-[--color-stone-600] mb-6 border border-[--color-stone-200]">
              OUR AGREEMENT
            </div>
            <h1 className="mb-6 pt-[0px] pr-[0px] pb-[24px] pl-[0px] !text-white">DoneWell Services Agreement</h1>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed !text-white italic opacity-90">
              Last updated: December 2025
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                This Services Agreement ("Agreement") is entered into between <strong>DoneWell</strong> ("DoneWell," "we," or "us") and the client ("Client," "you").
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                This Agreement governs all professional services provided by DoneWell unless otherwise agreed in writing.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                By signing this Agreement <strong>or by submitting payment for services</strong>, Client acknowledges that they have read, understood, and agree to these terms.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">1. Services Overview</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                DoneWell provides professional design, development, and launch services for websites and related digital products.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Services are delivered in phases, which may include:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Discovery & Roadmap Services</li>
                <li>Build & Launch Services</li>
              </ul>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                The specific scope, timeline, and pricing for each project are outlined in a written <strong>Project Roadmap or Proposal</strong> ("Roadmap").
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">2. Discovery & Roadmap Services</h2>
              
              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">2.1 Discovery Fee</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Discovery & Roadmap services are provided for a fixed fee (currently <strong>$650</strong>, unless otherwise stated).
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                The Discovery fee:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Is paid before Discovery services begin</li>
                <li>Covers professional consultation, planning, and recommendations</li>
                <li>Does not obligate either party to proceed with Build services</li>
              </ul>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">2.2 Nature of Discovery</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Discovery services are advisory in nature. Outputs may include strategy, structure, recommendations, and planning materials. Discovery outputs are not final deliverables unless explicitly stated.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">2.3 Credit Toward Build</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                If Client proceeds with Build services, the Discovery fee will be credited toward the total project investment as outlined in the Roadmap.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                If Client chooses not to proceed, the Discovery fee is non-refundable and covers time and expertise provided.
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">3. Project Roadmap & Scope</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                After Discovery, DoneWell provides a written Roadmap that outlines:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Final scope for the initial project phase</li>
                <li>What is included and not included</li>
                <li>Timeline and pricing</li>
                <li>Optional add-ons or future phases</li>
              </ul>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                The Roadmap serves as the <strong>reference document</strong> for the project scope.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Work outside the approved Roadmap is considered out of scope and may require a separate quote or future phase.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">4. Build & Launch Services</h2>
              
              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">4.1 Commencement of Build</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Build services begin only after:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Delivery of the Roadmap, and</li>
                <li>Receipt of the required <strong>Build Deposit</strong></li>
              </ul>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">4.2 Build Deposit</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Unless otherwise stated, the Build Deposit is <strong>50% of the remaining project balance</strong> after Discovery credit.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Submission of the Build Deposit:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Approves the Roadmap</li>
                <li>Authorizes Build services to begin</li>
                <li>Confirms acceptance of this Agreement</li>
              </ul>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                No additional signatures are required.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">5. Payments & Timing</h2>
              
              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">5.1 Payment Schedule</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Unless otherwise stated in the Roadmap:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Discovery fee is due before Discovery begins</li>
                <li>Build Deposit is due before Build begins</li>
                <li>Final payment is due before launch, domain connection, or delivery of final assets</li>
              </ul>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">5.2 Payment Method</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                All payments are processed via Stripe or another approved payment method.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Stripe receipts serve as confirmation of payment and approval of the applicable project phase.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">5.3 Non-Payment</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                If payment is not received when due:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Work may pause</li>
                <li>Timelines may shift</li>
                <li>Launch, domain transfer, or asset delivery may be withheld until payment is complete</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">6. Client Responsibilities</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Client agrees to:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Provide timely feedback (typically within 2 business days unless otherwise agreed)</li>
                <li>Supply required content or approvals</li>
                <li>Designate a single point of contact</li>
              </ul>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Delays in feedback or materials may pause the project timeline.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">7. Revisions & Changes</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Unless otherwise stated:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Reasonable revisions are included within the approved scope</li>
                <li>Revisions must align with the Roadmap</li>
                <li>New features, major changes, or expanded scope are handled separately</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">8. Intellectual Property</h2>
              
              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">8.1 Ownership Transfer</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Upon receipt of full payment:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Client receives ownership of final, delivered project work created specifically for the project</li>
              </ul>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">8.2 Pre-Existing Materials</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                DoneWell retains ownership of:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Tools, frameworks, templates, systems, and reusable code</li>
                <li>Processes developed independently of the project</li>
              </ul>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                DoneWell grants Client a non-exclusive license to use such materials as incorporated into the final deliverables.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">9. Pauses & Termination</h2>
              
              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">9.1 Client-Initiated Termination</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Client may pause or terminate the project at any time. Fees paid are non-refundable for work already completed.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">9.2 DoneWell-Initiated Termination</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                DoneWell may pause or terminate the project if:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Payments are not made</li>
                <li>Communication breaks down</li>
                <li>Client actions prevent reasonable progress</li>
              </ul>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Client remains responsible for fees for work completed to date.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">10. Relationship</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                DoneWell operates as an independent contractor. Nothing in this Agreement creates a partnership, joint venture, or employment relationship.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">11. Governing Law</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Until DoneWell's business is formally established in Texas, this Agreement is governed by the laws of the state in which DoneWell principally operates.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Once established, this Agreement shall be governed by the laws of the <strong>State of Texas</strong>, without regard to conflict of laws principles.
              </p>
            </div>

            {/* Section 12 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">12. Entire Agreement</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                This Agreement, together with any Roadmap or Proposal referenced herein, constitutes the entire understanding between the parties.
              </p>
            </div>

            {/* Section 13 */}
            <div className="mb-16">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">13. Acceptance</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                By signing below <strong>or by submitting payment for services</strong>, Client agrees to this Services Agreement.
              </p>
            </div>

            {/* Exhibit A */}
            <div className="mb-16 pt-8 border-t border-[--color-stone-300]">
              <h2 className="text-[--color-forest-700] mb-4 pt-[24px] pr-[0px] pb-[16px] pl-[0px]">Exhibit A – Legal Terms Addendum</h2>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                This Legal Terms Addendum ("Addendum") forms part of the DoneWell Services Agreement.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">A1. Limitation of Liability</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                To the maximum extent permitted by law, DoneWell's total liability arising from or related to services provided under this Agreement shall not exceed the total amount paid by Client for the services in question.
              </p>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                DoneWell shall not be liable for indirect, incidental, consequential, or special damages, including lost profits or business interruption.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">A2. Indemnification</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-4">
                Client agrees to indemnify and hold harmless DoneWell from claims arising from:
              </p>
              <ul className="text-lg text-[--color-stone-700] leading-relaxed space-y-2 list-disc list-outside ml-6 pl-4 mb-6">
                <li>Client-provided content</li>
                <li>Client's use of the deliverables</li>
                <li>Client's violation of applicable laws or third-party rights</li>
              </ul>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">A3. Third-Party Services</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                DoneWell is not responsible for failures, changes, or outages related to third-party platforms, hosting providers, software, or services.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">A4. Force Majeure</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                Neither party shall be liable for delays or failure to perform due to events beyond reasonable control, including natural disasters, outages, or acts of government.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">A5. Severability</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                If any provision of this Agreement is found unenforceable, the remaining provisions shall remain in full force and effect.
              </p>

              <h3 className="text-[--color-forest-700] mb-4 text-xl font-semibold">A6. Entire Agreement</h3>
              <p className="text-lg text-[--color-stone-700] leading-relaxed mb-6">
                This Agreement and Addendum represent the entire agreement between the parties and supersede all prior discussions or understandings.
              </p>
            </div>

            {/* Footer */}
            <div className="mb-24 pt-8 border-t border-[--color-stone-300] text-center">
              <p className="text-lg text-[--color-forest-700] font-semibold mb-2">DoneWell</p>
              <p className="text-base text-[--color-stone-600] italic">
                Design. Build. Launch – done well.
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
