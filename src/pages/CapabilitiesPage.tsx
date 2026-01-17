import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { GetStartedModal } from '../components/GetStartedModal';
import { SEO } from '../components/SEO';
import { Button } from '../components/Button';
import { IntegrationsSection } from '../components/IntegrationsSection';
import { CapabilityCard } from '../components/CapabilityCard';
import { ArrowRight } from 'lucide-react';

interface CapabilitiesPageProps {
  onGetStartedClick: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

/**
 * Capabilities Page
 * 
 * A confidence amplifier that answers: "Yes – they've done this before, and they'll handle it for me."
 * 
 * Structure:
 * - Hero (simple, no buttons)
 * - Integrations (familiar tools → trust)
 * - Capabilities grid (plain-language capabilities)
 * - Subtle proof (optional depth)
 * - CTA (soft call to Discovery)
 */
export function CapabilitiesPage({ onGetStartedClick, isModalOpen, onModalClose }: CapabilitiesPageProps) {
  // Capability data - exactly as specified
  const capabilities = [
    {
      title: 'Content & CMS',
      description: 'Websites that are easy to update, scale, and maintain – without breaking things.',
      includes: [
        'Blogs, pages, case studies',
        'Rich text, images, media',
        'Content imports and migrations'
      ],
      inPractice: 'Example: importing years of content from an existing platform into a clean, modern CMS.'
    },
    {
      title: 'Accounts & Authentication',
      description: 'Secure login systems for teams, customers, or members – designed around how people actually use them.',
      includes: [
        'Admin access',
        'Customer accounts',
        'Preferences and profiles',
        'Device-aware sessions'
      ]
    },
    {
      title: 'Automation & Monitoring',
      description: 'Systems that quietly watch, check, and report – so problems are caught early.',
      includes: [
        'Site health checks',
        'Uptime and performance monitoring',
        'Alerts and logs'
      ]
    },
    {
      title: 'Email & Communication',
      description: 'Email systems that send reliably, scale safely, and give you real insight into what\'s working.',
      includes: [
        'Campaigns and templates',
        'Analytics and reporting',
        'Deliverability setup and warming'
      ]
    },
    {
      title: 'Integrations & Data',
      description: 'We connect your website to the services and data sources your business depends on.',
      includes: [
        'Payments',
        'Media platforms',
        'Maps, locations, and scoring',
        'External APIs'
      ]
    },
    {
      title: 'Custom Logic & AI',
      description: 'When off-the-shelf tools aren\'t enough, we build the logic ourselves.',
      includes: [
        'Scoring systems',
        'Personalization',
        'AI summaries and insights',
        'Subscription rules and timing'
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Capabilities - DoneWell"
        description="Everything we build is custom – but never complicated to use. See how we connect the tools you already use and automate the ones you shouldn't have to think about."
        url="https://donewellco.com/capabilities"
      />
      <Header onGetStartedClick={onGetStartedClick} />
      
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-semibold text-[--color-forest-700] mb-6 leading-tight">
            Capabilities
          </h1>
          <p className="text-xl md:text-2xl text-[--color-stone-700] leading-relaxed max-w-2xl mx-auto">
            Everything we build is custom – but never complicated to use.
          </p>
        </div>
      </section>

      {/* Integrations Section */}
      <IntegrationsSection 
        introText="We regularly work with the tools below – and connect them in ways that fit your business, not a template."
        showHeader={false}
        showCTA={false}
        backgroundColor="bg-[--color-sage-50]"
      />

      {/* Capabilities Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <CapabilityCard
                key={index}
                title={capability.title}
                description={capability.description}
                includes={capability.includes}
                inPractice={capability.inPractice}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Subtle Proof Section */}
      <section className="py-16 bg-[--color-sage-50]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg md:text-xl text-[--color-stone-700] leading-relaxed italic">
            Most of our work starts as a simple question –<br />
            "Can this system do X?"
          </p>
          <p className="text-lg md:text-xl text-[--color-stone-700] leading-relaxed mt-4">
            If it can't, we design one that can.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <Button 
              variant="primary" 
              size="large" 
              onClick={onGetStartedClick}
            >
              Start with a free consult
            </Button>
          </div>
          <div>
            <a 
              href="/how-we-work" 
              className="inline-flex items-center gap-2 text-[--color-forest-700] hover:text-[--color-forest-800] transition-colors font-medium"
            >
              Learn how we work
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <GetStartedModal isOpen={isModalOpen} onClose={onModalClose} />
    </div>
  );
}
