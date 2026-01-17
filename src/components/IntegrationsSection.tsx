import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface IntegrationsSectionProps {
  onExploreClick?: () => void;
  exploreHref?: string;
  introText?: string;
  showHeader?: boolean;
  showCTA?: boolean;
  backgroundColor?: string;
}

/**
 * Integrations Section - Logo Grid
 * 
 * Displays 10 integration logos in a responsive grid:
 * - Desktop: 5-6 logos per row
 * - Tablet: 3-4 logos per row
 * - Mobile: 2 logos per row
 * 
 * Logos are muted (75-85% opacity) with subtle hover effects.
 * All logos include descriptive alt text for accessibility.
 */
export function IntegrationsSection({ 
  onExploreClick, 
  exploreHref,
  introText,
  showHeader = true,
  showCTA = true,
  backgroundColor = 'bg-white'
}: IntegrationsSectionProps) {
  // Logo data with descriptive alt text for accessibility
  const integrations = [
    { filename: 'stripe.png', name: 'Stripe', alt: 'Stripe payments integration' },
    { filename: 'google.png', name: 'Google', alt: 'Google services integration' },
    { filename: 'supabase.png', name: 'Supabase', alt: 'Supabase database and backend services' },
    { filename: 'resend.png', name: 'Resend', alt: 'Resend email delivery service' },
    { filename: 'wordpress.png', name: 'WordPress', alt: 'WordPress content management' },
    { filename: 'mapbox.png', name: 'Mapbox', alt: 'Mapbox mapping and location services' },
    { filename: 'spotify.png', name: 'Spotify', alt: 'Spotify music integration' },
    { filename: 'chrome.png', name: 'Chrome', alt: 'Chrome browser compatibility' },
    { filename: 'medium.png', name: 'Medium', alt: 'Medium content platform' },
    { filename: 'openweather.png', name: 'OpenWeather', alt: 'OpenWeather API integration' },
  ];

  return (
    <section className={`py-24 ${backgroundColor}`} aria-label="Integration partners">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header (optional) */}
        {showHeader && (
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-white rounded-full text-sm tracking-wider text-[--color-forest-700] mb-4 border border-[--color-stone-200]">
              INTEGRATIONS
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-[--color-forest-700] mb-6 leading-tight">
              Built to fit your business – not a template.
            </h2>
            <p className="text-xl text-[--color-stone-700] leading-relaxed">
              We design and build custom systems that connect the tools you already use, 
              and automate the ones you shouldn't have to think about.
            </p>
          </div>
        )}

        {/* Logo Grid */}
        <div className={showHeader ? 'mb-12' : 'mb-12 mt-8'}>
          {/* Custom intro text (optional) */}
          {introText && (
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <p className="text-lg text-[--color-stone-700] leading-relaxed">
                {introText}
              </p>
            </div>
          )}
          <div className="
            grid 
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            lg:grid-cols-5 
            gap-4 
            max-w-6xl 
            mx-auto
          ">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="
                  flex 
                  items-center 
                  justify-center 
                  p-5 
                  bg-white 
                  rounded-lg 
                  border 
                  border-[--color-stone-200] 
                  hover:border-[--color-sage-300] 
                  transition-all 
                  duration-300 
                  hover:shadow-sm
                  aspect-square
                "
              >
                <img
                  src={`/integration-logos/${integration.filename}`}
                  alt={integration.alt}
                  className="
                    h-[100px] 
                    w-auto 
                    object-contain 
                    opacity-80 
                    hover:opacity-100 
                    transition-opacity 
                    duration-300
                  "
                  loading="lazy"
                  height="100"
                />
              </div>
            ))}
          </div>
          
          {/* Supporting text */}
          <div className="text-center mt-8">
            <p className="text-base text-[--color-stone-600]">
              And many more – if you use it, we can connect it.
            </p>
          </div>
        </div>

        {/* CTA (optional) */}
        {showCTA && (onExploreClick || exploreHref) && (
          <div className="text-center">
            {exploreHref ? (
              <Button
                variant="primary"
                size="large"
                href={exploreHref}
              >
                Explore our capabilities
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="large"
                onClick={onExploreClick}
              >
                Explore our capabilities
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
