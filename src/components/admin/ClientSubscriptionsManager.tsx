import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useClientSubscriptions } from '../../hooks/useClientSubscriptions';
import {
  MonitoredSite,
  SubscriptionTier,
  SiteStatus,
  CheckResult,
  HealthCheckType,
} from '../../types/database';
import { SiteDetailView } from './SiteDetailView';

type ViewMode = 'list' | 'detail' | 'wizard';
type FilterTier = 'all' | SubscriptionTier;
type FilterStatus = 'all' | SiteStatus;

interface WizardData {
  siteId: string;
  siteName: string;
  primaryDomain: string;
  environment: string;
  clientEmail: string;
  internalEmail: string;
  subscriptionTier: SubscriptionTier;
  trialStartDate: string;
  trialEndDate: string;
  cmsTable: string;
  formsTable: string;
  siteSecret: string;
}

const initialWizardData: WizardData = {
  siteId: '',
  siteName: '',
  primaryDomain: 'https://',
  environment: 'production',
  clientEmail: '',
  internalEmail: 'contact@donewellco.com',
  subscriptionTier: 'essentials',
  trialStartDate: '',
  trialEndDate: '',
  cmsTable: 'projects',
  formsTable: 'contact_submissions',
  siteSecret: '',
};

function getStatusBadge(result?: CheckResult) {
  if (!result) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[--color-stone-100] text-[--color-stone-600] rounded text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-[--color-stone-400]" />
        Unknown
      </span>
    );
  }

  switch (result) {
    case 'ok':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
          <CheckCircle2 size={12} />
          Healthy
        </span>
      );
    case 'warn':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
          <AlertTriangle size={12} />
          Warning
        </span>
      );
    case 'fail':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
          <XCircle size={12} />
          Failed
        </span>
      );
  }
}

function getTierBadge(tier: SubscriptionTier) {
  const colors = {
    none: 'bg-[--color-stone-100] text-[--color-stone-600]',
    essentials: 'bg-blue-100 text-blue-700',
    care: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors[tier]}`}>
      {tier}
    </span>
  );
}

export function ClientSubscriptionsManager() {
  const {
    sites,
    loading,
    refetch,
    addSite,
    deleteSite,
    addHealthChecks,
    generateSecret,
    testConnection,
  } = useClientSubscriptions();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSite, setSelectedSite] = useState<MonitoredSite | null>(null);
  const [filterTier, setFilterTier] = useState<FilterTier>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSites = sites.filter((site) => {
    if (filterTier !== 'all' && site.subscriptionTier !== filterTier) return false;
    if (filterStatus !== 'all' && site.status !== filterStatus) return false;
    return true;
  });

  const handleViewDetails = (site: MonitoredSite) => {
    setSelectedSite(site);
    setViewMode('detail');
  };

  const handleDelete = async (site: MonitoredSite) => {
    if (confirm(`Are you sure you want to delete ${site.siteName}? This will remove all health checks and events.`)) {
      setDeletingId(site.id);
      try {
        await deleteSite(site.id);
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Failed to delete site. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleTestConnection = async (domain: string) => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testConnection(domain);
    setTestResult({
      ok: result.ok,
      message: result.ok ? `Connected! Status: ${result.status}` : result.error || 'Connection failed',
    });
    setIsTesting(false);
  };

  const startWizard = () => {
    setWizardData({ ...initialWizardData, siteSecret: generateSecret() });
    setWizardStep(1);
    setTestResult(null);
    setViewMode('wizard');
  };

  const handleWizardSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create the site
      const newSite = await addSite({
        siteId: wizardData.siteId,
        siteName: wizardData.siteName,
        primaryDomain: wizardData.primaryDomain,
        environment: wizardData.environment,
        subscriptionTier: wizardData.subscriptionTier,
        status: 'active',
        siteSecret: wizardData.siteSecret,
        clientEmail: wizardData.clientEmail || undefined,
        internalEmail: wizardData.internalEmail,
        deploySuppressionMinutes: 15,
        trialStartDate: wizardData.trialStartDate || undefined,
        trialEndDate: wizardData.trialEndDate || undefined,
        cmsTable: wizardData.cmsTable || undefined,
        formsTable: wizardData.formsTable || undefined,
      });

      // Create health checks
      const checks: Array<{ checkType: HealthCheckType; target: string }> = [
        { checkType: 'uptime', target: '/' },
        { checkType: 'health_api', target: '/api/health' },
      ];
      if (wizardData.cmsTable) {
        checks.push({ checkType: 'cms', target: '/api/health/cms' });
      }
      if (wizardData.formsTable) {
        checks.push({ checkType: 'form', target: '/api/health/form-test' });
      }

      await addHealthChecks(newSite.id, checks);

      // Go to step 5 (review/output)
      setWizardStep(5);
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Failed to create site. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateEnvVars = () => {
    return `SITE_ID=${wizardData.siteId}
SITE_NAME=${wizardData.siteName}
ENVIRONMENT=${wizardData.environment}
DONEWELL_LOG_SECRET=${wizardData.siteSecret}`;
  };

  // Auto-suggest site_id from site_name
  const suggestSiteId = (siteName: string) => {
    const parts = siteName.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/);
    const initials = parts.map((p) => p[0]?.toLowerCase() || '').join('');
    return `${initials}_prod_001`;
  };

  // Auto-calculate trial end date (14 days from start)
  const calculateTrialEnd = (startDate: string) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + 14);
    return start.toISOString().split('T')[0];
  };

  if (viewMode === 'detail' && selectedSite) {
    return (
      <SiteDetailView
        site={selectedSite}
        onBack={() => {
          setViewMode('list');
          setSelectedSite(null);
        }}
      />
    );
  }

  if (viewMode === 'wizard') {
    return (
      <div className="space-y-6">
        {/* Wizard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[--color-forest-700] mb-2">
              {wizardStep === 5 ? 'Site Created!' : 'Add New Site'}
            </h2>
            <p className="text-[--color-stone-600]">
              {wizardStep === 5
                ? 'Copy the environment variables below to set up the site.'
                : `Step ${wizardStep} of 4`}
            </p>
          </div>
          {wizardStep !== 5 && (
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 text-[--color-stone-600] hover:bg-[--color-stone-100] rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress Steps */}
        {wizardStep < 5 && (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === wizardStep
                      ? 'bg-[--color-forest-700] text-white'
                      : step < wizardStep
                      ? 'bg-[--color-sage-100] text-[--color-forest-700]'
                      : 'bg-[--color-stone-100] text-[--color-stone-500]'
                  }`}
                >
                  {step < wizardStep ? <Check size={16} /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 rounded ${
                      step < wizardStep ? 'bg-[--color-sage-200]' : 'bg-[--color-stone-200]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Wizard Content */}
        <div className="bg-white border border-[--color-stone-200] rounded-lg p-6">
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[--color-forest-700]">Site Basics</h3>
              
              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={wizardData.siteName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setWizardData((prev) => ({
                      ...prev,
                      siteName: name,
                      siteId: prev.siteId || suggestSiteId(name),
                    }));
                  }}
                  placeholder="e.g., kevinlaronda.com"
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Site ID *
                </label>
                <input
                  type="text"
                  value={wizardData.siteId}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, siteId: e.target.value }))}
                  placeholder="e.g., klr_prod_001"
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
                <p className="text-xs text-[--color-stone-500] mt-1">
                  Unique identifier for this site (auto-suggested from name)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Primary Domain *
                </label>
                <input
                  type="url"
                  value={wizardData.primaryDomain}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, primaryDomain: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Environment
                </label>
                <select
                  value={wizardData.environment}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, environment: e.target.value }))}
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[--color-forest-700]">Contacts</h3>
              
              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={wizardData.clientEmail}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
                <p className="text-xs text-[--color-stone-500] mt-1">
                  Monthly reports will be sent here (if subscribed)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Internal Email *
                </label>
                <input
                  type="email"
                  value={wizardData.internalEmail}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, internalEmail: e.target.value }))}
                  placeholder="contact@donewellco.com"
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
                <p className="text-xs text-[--color-stone-500] mt-1">
                  Incident alerts will be sent here
                </p>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[--color-forest-700]">Subscription</h3>
              
              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Subscription Tier
                </label>
                <select
                  value={wizardData.subscriptionTier}
                  onChange={(e) =>
                    setWizardData((prev) => ({ ...prev, subscriptionTier: e.target.value as SubscriptionTier }))
                  }
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                >
                  <option value="none">None (Not Covered)</option>
                  <option value="essentials">Essentials</option>
                  <option value="care">Care</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Trial Start Date
                </label>
                <input
                  type="date"
                  value={wizardData.trialStartDate}
                  onChange={(e) => {
                    const start = e.target.value;
                    setWizardData((prev) => ({
                      ...prev,
                      trialStartDate: start,
                      trialEndDate: calculateTrialEnd(start),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
                <p className="text-xs text-[--color-stone-500] mt-1">
                  Leave empty if not on trial
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Trial End Date
                </label>
                <input
                  type="date"
                  value={wizardData.trialEndDate}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, trialEndDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
                <p className="text-xs text-[--color-stone-500] mt-1">
                  Auto-calculated as 14 days from start
                </p>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[--color-forest-700]">Health Config</h3>
              <p className="text-sm text-[--color-stone-600]">
                Configure which tables to monitor. Leave empty to skip that check.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  CMS Table Name
                </label>
                <input
                  type="text"
                  value={wizardData.cmsTable}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, cmsTable: e.target.value }))}
                  placeholder="e.g., projects, testimonials"
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[--color-stone-700] mb-1">
                  Forms Table Name
                </label>
                <input
                  type="text"
                  value={wizardData.formsTable}
                  onChange={(e) => setWizardData((prev) => ({ ...prev, formsTable: e.target.value }))}
                  placeholder="e.g., contact_submissions"
                  className="w-full px-3 py-2 border border-[--color-stone-300] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
                />
              </div>

              <div className="pt-4 border-t border-[--color-stone-200]">
                <h4 className="text-sm font-medium text-[--color-stone-700] mb-2">
                  Health Checks to Create:
                </h4>
                <ul className="text-sm text-[--color-stone-600] space-y-1">
                  <li>✓ Uptime check (GET /)</li>
                  <li>✓ Health API (GET /api/health)</li>
                  {wizardData.cmsTable && <li>✓ CMS check (GET /api/health/cms)</li>}
                  {wizardData.formsTable && <li>✓ Form test (POST /api/health/form-test)</li>}
                </ul>
              </div>
            </div>
          )}

          {wizardStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="text-green-600" size={24} />
                <div>
                  <p className="font-medium text-green-800">Site created successfully!</p>
                  <p className="text-sm text-green-700">
                    {wizardData.siteName} is now being monitored.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[--color-stone-700] mb-2">
                  Environment Variables for Vercel:
                </h4>
                <div className="relative">
                  <pre className="bg-[--color-stone-100] p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    {generateEnvVars()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(generateEnvVars(), 'env')}
                    className="absolute top-2 right-2 p-2 bg-white rounded border border-[--color-stone-300] hover:bg-[--color-stone-50] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedField === 'env' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[--color-stone-700] mb-2">
                  Test Connection:
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(wizardData.primaryDomain)}
                    disabled={isTesting}
                    className="flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors disabled:opacity-50"
                  >
                    {isTesting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : testResult?.ok ? (
                      <Wifi size={16} />
                    ) : testResult ? (
                      <WifiOff size={16} />
                    ) : (
                      <Wifi size={16} />
                    )}
                    Test Connection
                  </button>
                  {testResult && (
                    <span className={`text-sm ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.message}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[--color-stone-500] mt-2">
                  Note: Test will fail until you deploy the health adapter to the site.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation */}
        <div className="flex items-center justify-between">
          {wizardStep > 1 && wizardStep < 5 ? (
            <button
              onClick={() => setWizardStep((s) => s - 1)}
              className="flex items-center gap-2 px-4 py-2 text-[--color-stone-600] hover:bg-[--color-stone-100] rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
              Back
            </button>
          ) : (
            <div />
          )}

          {wizardStep < 4 && (
            <button
              onClick={() => setWizardStep((s) => s + 1)}
              disabled={
                (wizardStep === 1 && (!wizardData.siteId || !wizardData.siteName || !wizardData.primaryDomain)) ||
                (wizardStep === 2 && !wizardData.internalEmail)
              }
              className="flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}

          {wizardStep === 4 && (
            <button
              onClick={handleWizardSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Site
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          )}

          {wizardStep === 5 && (
            <button
              onClick={() => {
                setViewMode('list');
                refetch();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors"
            >
              Done
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[--color-forest-700] mb-2">Client Subscriptions</h2>
          <p className="text-[--color-stone-600]">
            Manage monitored sites and their health check configurations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-[--color-stone-600] hover:bg-[--color-stone-100] rounded-lg transition-colors"
            title="Refresh (auto-refreshes every 30s)"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={startWizard}
            className="flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors"
          >
            <Plus size={16} />
            Add Site
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[--color-stone-600]">Tier:</span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as FilterTier)}
            className="px-3 py-1.5 border border-[--color-stone-300] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
          >
            <option value="all">All</option>
            <option value="none">None</option>
            <option value="essentials">Essentials</option>
            <option value="care">Care</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[--color-stone-600]">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-1.5 border border-[--color-stone-300] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[--color-forest-700]"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Sites Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[--color-forest-700]" />
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="bg-white border border-[--color-stone-200] rounded-lg p-12 text-center">
          <Globe size={48} className="mx-auto mb-4 text-[--color-stone-300]" />
          <p className="text-[--color-stone-600] mb-4">No sites found.</p>
          <button
            onClick={startWizard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[--color-forest-700] text-white rounded-lg hover:bg-[--color-forest-800] transition-colors"
          >
            <Plus size={16} />
            Add Your First Site
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[--color-stone-200] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[--color-stone-50] border-b border-[--color-stone-200]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[--color-stone-600]">Site</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[--color-stone-600]">Tier</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[--color-stone-600]">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[--color-stone-600]">Health</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[--color-stone-600]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site) => (
                <tr
                  key={site.id}
                  className="border-b border-[--color-stone-100] hover:bg-[--color-stone-50] cursor-pointer"
                  onClick={() => handleViewDetails(site)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[--color-sage-100] rounded-lg flex items-center justify-center">
                        <Globe className="text-[--color-forest-700]" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-[--color-forest-700]">{site.siteName}</p>
                        <p className="text-sm text-[--color-stone-500]">{site.primaryDomain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{getTierBadge(site.subscriptionTier)}</td>
                  <td className="px-4 py-4">
                    <span className="capitalize text-sm text-[--color-stone-600]">{site.status}</span>
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(site.lastCheckResult)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewDetails(site)}
                        className="p-2 text-[--color-stone-600] hover:bg-[--color-stone-100] rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(site)}
                        disabled={deletingId === site.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete site"
                      >
                        {deletingId === site.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

