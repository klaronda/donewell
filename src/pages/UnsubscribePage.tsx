import React, { useEffect, useState } from 'react';

export function UnsubscribePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [isSuppressed, setIsSuppressed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get email from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');

    if (!emailParam) {
      setError('No email address provided');
      setIsLoading(false);
      return;
    }

    setEmail(emailParam);

    // Call suppress-email function immediately
    const suppressEmail = async () => {
      try {
        // Use the Supabase project URL (same pattern as other functions)
        const supabaseUrl = 'https://udiskjjuszutgpvkogzw.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/suppress-email?email=${encodeURIComponent(emailParam)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to suppress email');
        }

        const data = await response.json();
        if (data.success) {
          setIsSuppressed(true);
        } else {
          throw new Error(data.error || 'Failed to suppress email');
        }
      } catch (err) {
        console.error('Error suppressing email:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    suppressEmail();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">
        {isLoading ? (
          <div className="bg-white rounded-[8px] p-12 text-center">
            <p className="text-[--color-stone-700]">Processing your request...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[8px] p-12 text-center">
            <h1 className="text-2xl font-semibold text-[--color-forest-700] mb-4">Error</h1>
            <p className="text-[--color-stone-700] mb-4">{error}</p>
            <p className="text-sm text-[--color-stone-600]">
              Please contact us at{' '}
              <a href="mailto:hello@donewellco.com" className="text-[--color-forest-700] hover:underline">
                hello@donewellco.com
              </a>{' '}
              if you need assistance.
            </p>
          </div>
        ) : isSuppressed ? (
          <div className="bg-white rounded-[8px] p-12">
            <h1 className="text-3xl font-semibold text-[--color-forest-700] mb-6">You're all set</h1>
            
            <div className="prose prose-lg max-w-none text-[--color-stone-700] leading-relaxed mb-8">
              <p className="mb-4">
                You've been removed from our outreach list, and you won't receive further emails like this from us.
              </p>
              <p className="mb-4">
                We only reach out when we've taken time to review a site and think the note could be useful. That said, your inbox is yours — and we respect that.
              </p>
              <p className="mb-8">
                If you ever want a second set of eyes on a website or a new idea you're working on, that's what we do.
              </p>
            </div>

            <div className="border-t border-[--color-stone-200] pt-8 mt-8">
              <p className="text-[--color-stone-700] mb-2">—</p>
              <p className="text-[--color-stone-900] font-semibold mb-1">Kevin</p>
              <p className="text-[--color-stone-700]">DoneWell Design Co</p>
            </div>

            <div className="mt-12 pt-8 border-t border-[--color-stone-100]">
              <p className="text-sm text-[--color-stone-500] text-center">
                Helping businesses design, build, and launch clear, fast websites — without complexity.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
