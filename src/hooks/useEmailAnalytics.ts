import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface EmailAnalyticsRow {
  email_draft_id: string;
  lead_id: string | null;
  company_name: string | null;
  recipient_email: string | null;
  subject: string | null;
  sent_at: string | null;
  resend_message_id: string | null;
  sent_count: number;
  delivered_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  complaint_count: number;
  first_delivered_at: string | null;
  first_opened_at: string | null;
  first_clicked_at: string | null;
}

export interface SubjectStats {
  subject: string;
  sendCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  complaintCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  emails: EmailAnalyticsRow[];
}

export function useEmailAnalytics() {
  const [analytics, setAnalytics] = useState<EmailAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('email_analytics')
        .select('*')
        .order('sent_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAnalytics((data as EmailAnalyticsRow[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch email analytics'));
      console.error('Error fetching email analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Group analytics by subject line
  const bySubject: SubjectStats[] = Object.values(
    analytics.reduce((acc, email) => {
      const subject = email.subject || 'No Subject';
      
      if (!acc[subject]) {
        acc[subject] = {
          subject,
          sendCount: 0,
          deliveredCount: 0,
          openCount: 0,
          clickCount: 0,
          bounceCount: 0,
          complaintCount: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          complaintRate: 0,
          emails: [],
        };
      }
      
      acc[subject].sendCount += 1;
      acc[subject].deliveredCount += email.delivered_count > 0 ? 1 : 0;
      acc[subject].openCount += email.open_count > 0 ? 1 : 0;
      acc[subject].clickCount += email.click_count > 0 ? 1 : 0;
      acc[subject].bounceCount += email.bounce_count > 0 ? 1 : 0;
      acc[subject].complaintCount += email.complaint_count > 0 ? 1 : 0;
      acc[subject].emails.push(email);
      
      return acc;
    }, {} as Record<string, SubjectStats>)
  ).map((stats) => ({
    ...stats,
    openRate: stats.deliveredCount > 0 ? (stats.openCount / stats.deliveredCount) * 100 : 0,
    clickRate: stats.deliveredCount > 0 ? (stats.clickCount / stats.deliveredCount) * 100 : 0,
    bounceRate: stats.sendCount > 0 ? (stats.bounceCount / stats.sendCount) * 100 : 0,
    complaintRate: stats.sendCount > 0 ? (stats.complaintCount / stats.sendCount) * 100 : 0,
  })).sort((a, b) => b.sendCount - a.sendCount);

  // Calculate overall stats
  const overallStats = analytics.reduce(
    (acc, email) => ({
      total: acc.total + 1,
      delivered: acc.delivered + (email.delivered_count > 0 ? 1 : 0),
      opened: acc.opened + (email.open_count > 0 ? 1 : 0),
      clicked: acc.clicked + (email.click_count > 0 ? 1 : 0),
      bounced: acc.bounced + (email.bounce_count > 0 ? 1 : 0),
      complained: acc.complained + (email.complaint_count > 0 ? 1 : 0),
    }),
    { total: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 }
  );

  const openRate = overallStats.delivered > 0 ? (overallStats.opened / overallStats.delivered) * 100 : 0;
  const clickRate = overallStats.delivered > 0 ? (overallStats.clicked / overallStats.delivered) * 100 : 0;
  const bounceRate = overallStats.total > 0 ? (overallStats.bounced / overallStats.total) * 100 : 0;
  const complaintRate = overallStats.total > 0 ? (overallStats.complained / overallStats.total) * 100 : 0;

  return {
    analytics,
    bySubject,
    loading,
    error,
    refetch: fetchAnalytics,
    stats: {
      ...overallStats,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      bounceRate: Math.round(bounceRate * 10) / 10,
      complaintRate: Math.round(complaintRate * 10) / 10,
    },
  };
}

