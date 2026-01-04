import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSiteDetails } from '../../hooks/useClientSubscriptions';
import {
  MonitoredSite,
  HealthEvent,
  Incident,
  ErrorLog,
  CheckResult,
  SeverityLevel,
  IncidentStatus,
} from '../../types/database';

type TabType = 'events' | 'incidents' | 'errors';

interface SiteDetailViewProps {
  site: MonitoredSite;
  onBack: () => void;
}

function getResultBadge(result: CheckResult) {
  switch (result) {
    case 'ok':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
          <CheckCircle2 size={10} />
          OK
        </span>
      );
    case 'warn':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
          <AlertTriangle size={10} />
          Warn
        </span>
      );
    case 'fail':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
          <XCircle size={10} />
          Fail
        </span>
      );
  }
}

function getSeverityBadge(severity: SeverityLevel) {
  const colors = {
    'sev-1': 'bg-red-100 text-red-700 border-red-200',
    'sev-2': 'bg-orange-100 text-orange-700 border-orange-200',
    'sev-3': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-medium uppercase ${colors[severity]}`}>
      {severity}
    </span>
  );
}

function getIncidentStatusBadge(status: IncidentStatus) {
  const styles = {
    open: 'bg-red-100 text-red-700',
    monitoring: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateFull(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function SiteDetailView({ site, onBack }: SiteDetailViewProps) {
  const { healthEvents, incidents, errorLogs, loading, refetch } = useSiteDetails(site.id);
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleErrorExpanded = (id: string) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-[--color-stone-600] hover:bg-[--color-stone-100] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[--color-forest-700]">{site.siteName}</h2>
          <a
            href={site.primaryDomain}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[--color-stone-600] hover:text-[--color-forest-700] transition-colors"
          >
            {site.primaryDomain} ↗
          </a>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-[--color-stone-600] hover:bg-[--color-stone-100] rounded-lg transition-colors"
          title="Refresh (auto-refreshes every 30s)"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="bg-white rounded-lg border border-[--color-stone-200] overflow-hidden">
            <div className="flex border-b border-[--color-stone-200]">
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'events'
                    ? 'bg-[--color-sage-50] text-[--color-forest-700] border-b-2 border-[--color-forest-700]'
                    : 'text-[--color-stone-600] hover:bg-[--color-stone-50]'
                }`}
              >
                Health Events ({healthEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('incidents')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'incidents'
                    ? 'bg-[--color-sage-50] text-[--color-forest-700] border-b-2 border-[--color-forest-700]'
                    : 'text-[--color-stone-600] hover:bg-[--color-stone-50]'
                }`}
              >
                Incidents ({openIncidents.length} open)
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'errors'
                    ? 'bg-[--color-sage-50] text-[--color-forest-700] border-b-2 border-[--color-forest-700]'
                    : 'text-[--color-stone-600] hover:bg-[--color-stone-50]'
                }`}
              >
                Error Logs ({errorLogs.length})
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[--color-forest-700]" />
                </div>
              ) : activeTab === 'events' ? (
                <HealthEventsTab events={healthEvents} />
              ) : activeTab === 'incidents' ? (
                <IncidentsTab incidents={incidents} />
              ) : (
                <ErrorLogsTab
                  errors={errorLogs}
                  expandedErrors={expandedErrors}
                  toggleErrorExpanded={toggleErrorExpanded}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Site Info Card */}
          <div className="bg-white rounded-lg border border-[--color-stone-200] p-4 space-y-4">
            <h3 className="font-semibold text-[--color-forest-700]">Site Information</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Globe size={16} className="text-[--color-stone-400] mt-0.5" />
                <div>
                  <p className="text-[--color-stone-500]">Site ID</p>
                  <p className="font-mono text-[--color-forest-700]">{site.siteId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-4 h-4 flex items-center justify-center text-[--color-stone-400] text-xs">🌍</span>
                <div>
                  <p className="text-[--color-stone-500]">Environment</p>
                  <p className="capitalize text-[--color-forest-700]">{site.environment}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[--color-stone-400] mt-0.5" />
                <div>
                  <p className="text-[--color-stone-500]">Client Email</p>
                  <p className="text-[--color-forest-700]">{site.clientEmail || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[--color-stone-400] mt-0.5" />
                <div>
                  <p className="text-[--color-stone-500]">Internal Email</p>
                  <p className="text-[--color-forest-700]">{site.internalEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-[--color-stone-400] mt-0.5" />
                <div>
                  <p className="text-[--color-stone-500]">Created</p>
                  <p className="text-[--color-forest-700]">{formatDate(site.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-lg border border-[--color-stone-200] p-4 space-y-4">
            <h3 className="font-semibold text-[--color-forest-700]">Subscription</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[--color-stone-500] mb-1">Tier</p>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                    site.subscriptionTier === 'care'
                      ? 'bg-purple-100 text-purple-700'
                      : site.subscriptionTier === 'essentials'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-[--color-stone-100] text-[--color-stone-600]'
                  }`}
                >
                  {site.subscriptionTier}
                </span>
              </div>

              {site.trialStartDate && (
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-[--color-stone-400] mt-0.5" />
                  <div>
                    <p className="text-[--color-stone-500]">Trial Period</p>
                    <p className="text-[--color-forest-700]">
                      {formatDate(site.trialStartDate)} → {site.trialEndDate ? formatDate(site.trialEndDate) : '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secrets Card */}
          {site.siteSecret && (
            <div className="bg-white rounded-lg border border-[--color-stone-200] p-4 space-y-4">
              <h3 className="font-semibold text-[--color-forest-700]">Secrets</h3>

              <div className="text-sm">
                <p className="text-[--color-stone-500] mb-1">DONEWELL_LOG_SECRET</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[--color-stone-100] px-2 py-1 rounded font-mono text-xs truncate">
                    {showSecret ? site.siteSecret : '••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-1.5 text-[--color-stone-500] hover:bg-[--color-stone-100] rounded transition-colors"
                    title={showSecret ? 'Hide' : 'Reveal'}
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(site.siteSecret!, 'secret')}
                    className="p-1.5 text-[--color-stone-500] hover:bg-[--color-stone-100] rounded transition-colors"
                    title="Copy"
                  >
                    {copiedField === 'secret' ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Health Events Tab Component
function HealthEventsTab({ events }: { events: HealthEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-[--color-stone-500]">
        No health events recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[--color-stone-200]">
            <th className="text-left py-2 px-2 font-medium text-[--color-stone-600]">Time</th>
            <th className="text-left py-2 px-2 font-medium text-[--color-stone-600]">Check</th>
            <th className="text-left py-2 px-2 font-medium text-[--color-stone-600]">Result</th>
            <th className="text-right py-2 px-2 font-medium text-[--color-stone-600]">Latency</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-[--color-stone-100] hover:bg-[--color-stone-50]">
              <td className="py-2 px-2 text-[--color-stone-600]">{formatDate(event.checkedAt)}</td>
              <td className="py-2 px-2">
                <span className="font-mono text-xs bg-[--color-stone-100] px-1.5 py-0.5 rounded">
                  {event.checkType || '—'}
                </span>
              </td>
              <td className="py-2 px-2">{getResultBadge(event.result)}</td>
              <td className="py-2 px-2 text-right text-[--color-stone-600]">
                {event.latencyMs ? `${event.latencyMs}ms` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Incidents Tab Component
function IncidentsTab({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-[--color-stone-500]">
        No incidents recorded. 🎉
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className={`p-4 rounded-lg border ${
            incident.status === 'resolved'
              ? 'bg-[--color-stone-50] border-[--color-stone-200]'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getSeverityBadge(incident.severity)}
                {getIncidentStatusBadge(incident.status)}
              </div>
              <h4 className="font-medium text-[--color-forest-700]">{incident.title}</h4>
              {incident.description && (
                <p className="text-sm text-[--color-stone-600] mt-1">{incident.description}</p>
              )}
            </div>
            <div className="text-right text-xs text-[--color-stone-500]">
              <p>Created: {formatDate(incident.createdAt)}</p>
              {incident.resolvedAt && <p>Resolved: {formatDate(incident.resolvedAt)}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Error Logs Tab Component
function ErrorLogsTab({
  errors,
  expandedErrors,
  toggleErrorExpanded,
}: {
  errors: ErrorLog[];
  expandedErrors: Set<string>;
  toggleErrorExpanded: (id: string) => void;
}) {
  if (errors.length === 0) {
    return (
      <div className="text-center py-8 text-[--color-stone-500]">
        No error logs received.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((error) => {
        const isExpanded = expandedErrors.has(error.id);
        return (
          <div
            key={error.id}
            className="border border-[--color-stone-200] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleErrorExpanded(error.id)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-[--color-stone-50] transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-[--color-stone-400]" />
              ) : (
                <ChevronRight size={16} className="text-[--color-stone-400]" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-mono">
                    {error.errorType}
                  </span>
                  <span className="text-xs text-[--color-stone-500]">{formatDate(error.receivedAt)}</span>
                </div>
                <p className="text-sm text-[--color-forest-700] truncate mt-1">{error.message}</p>
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 pt-0">
                <div className="bg-[--color-stone-100] rounded p-3 space-y-2 text-xs">
                  {error.url && (
                    <div>
                      <span className="text-[--color-stone-500]">URL:</span>{' '}
                      <span className="font-mono">{error.url}</span>
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <span className="text-[--color-stone-500]">Stack trace:</span>
                      <pre className="mt-1 font-mono text-[--color-stone-700] whitespace-pre-wrap overflow-x-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {error.userAgent && (
                    <div>
                      <span className="text-[--color-stone-500]">User Agent:</span>{' '}
                      <span className="font-mono">{error.userAgent}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

