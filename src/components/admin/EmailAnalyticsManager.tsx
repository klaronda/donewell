import React, { useState, useEffect } from 'react';
import { useEmailAnalytics, SubjectStats } from '../../hooks/useEmailAnalytics';
import { 
  Mail, 
  Send, 
  MousePointerClick, 
  AlertTriangle, 
  XCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export function EmailAnalyticsManager() {
  const { bySubject, loading, error, stats, refetch } = useEmailAnalytics();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Clear success state after 2 seconds
  useEffect(() => {
    if (refreshSuccess) {
      const timer = setTimeout(() => setRefreshSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [refreshSuccess]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshSuccess(false);
    await refetch();
    setRefreshing(false);
    setRefreshSuccess(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const toggleExpand = (subject: string) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-[--color-stone-400] mr-2" size={20} />
        <p className="text-[--color-stone-600]">Loading email analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error loading analytics: {error.message}</p>
        <button 
          type="button"
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[--color-forest-700] mb-2">Email Analytics</h2>
          <p className="text-[--color-stone-600]">
            Track performance of your audit outreach emails by subject line.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            refreshSuccess 
              ? 'bg-green-100 text-green-700' 
              : refreshing 
                ? 'bg-[--color-stone-100] text-[--color-stone-400] cursor-wait'
                : 'text-[--color-stone-600] hover:bg-[--color-stone-100] active:scale-95'
          }`}
          title="Refresh analytics data"
        >
          {refreshSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span className="text-sm">Updated</span>
            </>
          ) : (
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          )}
        </button>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[--color-stone-200] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[--color-sage-100] rounded-lg flex items-center justify-center">
              <Send className="text-[--color-forest-700]" size={20} />
            </div>
            <div>
              <p className="text-xs text-[--color-stone-500] uppercase tracking-wide">Sent</p>
              <p className="text-2xl font-bold text-[--color-forest-700]">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[--color-stone-200] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MousePointerClick className="text-green-700" size={20} />
            </div>
            <div>
              <p className="text-xs text-[--color-stone-500] uppercase tracking-wide">Click Rate</p>
              <p className="text-2xl font-bold text-green-700">{formatPercentage(stats.clickRate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[--color-stone-200] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-orange-700" size={20} />
            </div>
            <div>
              <p className="text-xs text-[--color-stone-500] uppercase tracking-wide">Bounce Rate</p>
              <p className="text-2xl font-bold text-orange-700">{formatPercentage(stats.bounceRate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[--color-stone-200] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-700" size={20} />
            </div>
            <div>
              <p className="text-xs text-[--color-stone-500] uppercase tracking-wide">Complaint Rate</p>
              <p className="text-2xl font-bold text-red-700">{formatPercentage(stats.complaintRate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* By Subject Table */}
      {bySubject.length === 0 ? (
        <div className="bg-white border border-[--color-stone-200] rounded-lg p-12 text-center">
          <Mail className="mx-auto text-[--color-stone-400] mb-4" size={48} />
          <p className="text-[--color-stone-600]">No emails sent yet.</p>
          <p className="text-sm text-[--color-stone-500] mt-2">
            Emails will appear here once they are sent via the audit outreach system.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[--color-stone-200] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[--color-stone-50] border-b border-[--color-stone-200]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[--color-stone-700] uppercase tracking-wider">
                    Subject Line
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[--color-stone-700] uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[--color-stone-700] uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[--color-stone-700] uppercase tracking-wider">
                    Bounce Rate
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[--color-stone-700] uppercase tracking-wider">
                    Complaint Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-stone-200]">
                {bySubject.map((subjectStats) => (
                  <React.Fragment key={subjectStats.subject}>
                    {/* Subject Row */}
                    <tr 
                      className="hover:bg-[--color-stone-50] cursor-pointer transition-colors"
                      onClick={() => toggleExpand(subjectStats.subject)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {expandedSubject === subjectStats.subject ? (
                            <ChevronDown className="text-[--color-stone-400] flex-shrink-0" size={16} />
                          ) : (
                            <ChevronRight className="text-[--color-stone-400] flex-shrink-0" size={16} />
                          )}
                          <span className="text-sm font-medium text-[--color-forest-700]">
                            {subjectStats.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 bg-[--color-stone-100] text-[--color-stone-700] rounded-full text-sm font-medium">
                          {subjectStats.sendCount}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <RateCell rate={subjectStats.clickRate} count={subjectStats.clickCount} total={subjectStats.deliveredCount} color="green" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <RateCell rate={subjectStats.bounceRate} count={subjectStats.bounceCount} total={subjectStats.sendCount} color="orange" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <RateCell rate={subjectStats.complaintRate} count={subjectStats.complaintCount} total={subjectStats.sendCount} color="red" />
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedSubject === subjectStats.subject && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-[--color-stone-50]">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-[--color-stone-600] uppercase tracking-wide mb-3">
                              Individual Emails ({subjectStats.emails.length})
                            </p>
                            <div className="grid gap-2">
                              {subjectStats.emails.map((email) => (
                                <div 
                                  key={email.email_draft_id}
                                  className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[--color-stone-200]"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[--color-forest-700] truncate">
                                      {email.company_name || 'Unknown Company'}
                                    </p>
                                    <p className="text-xs text-[--color-stone-500] truncate">
                                      {email.recipient_email}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 ml-4">
                                    <span className="text-xs text-[--color-stone-500]">
                                      {formatDate(email.sent_at)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {email.click_count > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                                          <MousePointerClick size={12} /> {email.click_count}
                                        </span>
                                      )}
                                      {email.bounce_count > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
                                          <XCircle size={12} /> Bounced
                                        </span>
                                      )}
                                      {email.complaint_count > 0 && (
                                        <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                                          <AlertTriangle size={12} /> Complaint
                                        </span>
                                      )}
                                      {email.click_count === 0 && email.bounce_count === 0 && email.complaint_count === 0 && email.delivered_count > 0 && (
                                        <span className="text-xs text-[--color-stone-500]">Delivered</span>
                                      )}
                                      {email.delivered_count === 0 && email.bounce_count === 0 && (
                                        <span className="text-xs text-[--color-stone-400]">Sent</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for rate cells
function RateCell({ 
  rate, 
  count, 
  total, 
  color 
}: { 
  rate: number; 
  count: number; 
  total: number; 
  color: 'blue' | 'green' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    orange: 'text-orange-700',
    red: 'text-red-700',
  };

  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-semibold ${colorClasses[color]}`}>
        {rate.toFixed(1)}%
      </span>
      <span className="text-xs text-[--color-stone-500]">
        {count}/{total}
      </span>
    </div>
  );
}

