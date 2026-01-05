// Database types matching Supabase schema

export interface DatabaseProject {
  id: string;
  title: string;
  slug: string;
  keyframe_image: string;
  short_description: string;
  badge: string;
  metric_value: string;
  metric_label: string;
  show_on_work_page: boolean;
  show_on_homepage: boolean;
  order: number;
  summary?: string | null;
  problem?: string | null;
  objective?: string | null;
  our_actions?: string | null;
  results?: string | null;
  result_metrics?: Array<{
    value: string;
    title: string;
    description: string;
  }> | null;
  live_website_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  image?: string | null;
  order: number;
  show_on_homepage: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMetric {
  id: string;
  value: string;
  label: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLead {
  id: string;
  first_name: string;
  last_name: string;
  business_name?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  message: string;
  booked_consult: boolean;
  calendly_event_uri?: string | null;
  created_at: string;
  updated_at: string;
}

// Transform database types to app types
export interface Project {
  id: string;
  title: string;
  slug: string;
  keyframeImage: string;
  shortDescription: string;
  badge: string;
  metricValue: string;
  metricLabel: string;
  showOnWorkPage: boolean;
  showOnHomepage: boolean;
  order: number;
  summary?: string;
  problem?: string;
  objective?: string;
  ourActions?: string;
  results?: string;
  resultMetrics?: Array<{
    value: string;
    title: string;
    description: string;
  }>;
  liveWebsiteUrl?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
  order: number;
  showOnHomepage: boolean;
}

export interface Metric {
  id: string;
  value: string;
  label: string;
  order: number;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  phone?: string;
  message: string;
  bookedConsult: boolean;
  calendlyEventUri?: string;
  createdAt: string;
}

// Helper functions to transform database types to app types
export function transformProject(db: DatabaseProject): Project {
  return {
    id: db.id,
    title: db.title,
    slug: db.slug,
    keyframeImage: db.keyframe_image,
    shortDescription: db.short_description,
    badge: db.badge,
    metricValue: db.metric_value,
    metricLabel: db.metric_label,
    showOnWorkPage: db.show_on_work_page,
    showOnHomepage: db.show_on_homepage,
    order: db.order,
    summary: db.summary ?? '',
    problem: db.problem ?? '',
    objective: db.objective ?? '',
    ourActions: db.our_actions ?? '',
    results: db.results ?? '',
    resultMetrics: db.result_metrics ?? undefined,
    liveWebsiteUrl: db.live_website_url ?? undefined,
  };
}

export function transformTestimonial(db: DatabaseTestimonial): Testimonial {
  return {
    id: db.id,
    name: db.name,
    role: db.role,
    company: db.company,
    quote: db.quote,
    image: db.image ?? undefined,
    order: db.order,
    showOnHomepage: db.show_on_homepage,
  };
}

export function transformMetric(db: DatabaseMetric): Metric {
  return {
    id: db.id,
    value: db.value,
    label: db.label,
    order: db.order,
  };
}

export function transformLead(db: DatabaseLead): Lead {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    businessName: db.business_name ?? undefined,
    email: db.email,
    phone: db.phone ?? undefined,
    message: db.message,
    bookedConsult: db.booked_consult,
    calendlyEventUri: db.calendly_event_uri ?? undefined,
    createdAt: db.created_at,
  };
}

// Helper functions to transform app types to database types
export function projectToDatabase(project: Omit<Project, 'id'>): Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: project.title,
    slug: project.slug,
    keyframe_image: project.keyframeImage,
    short_description: project.shortDescription,
    badge: project.badge,
    metric_value: project.metricValue,
    metric_label: project.metricLabel,
    show_on_work_page: project.showOnWorkPage,
    show_on_homepage: project.showOnHomepage,
    order: project.order,
    summary: project.summary ?? null,
    problem: project.problem ?? null,
    objective: project.objective ?? null,
    our_actions: project.ourActions ?? null,
    results: project.results ?? null,
    result_metrics: project.resultMetrics ?? null,
    live_website_url: project.liveWebsiteUrl ?? null,
  };
}

export function testimonialToDatabase(testimonial: Omit<Testimonial, 'id'>): Omit<DatabaseTestimonial, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: testimonial.name,
    role: testimonial.role,
    company: testimonial.company,
    quote: testimonial.quote,
    image: testimonial.image ?? null,
    order: testimonial.order,
    show_on_homepage: testimonial.showOnHomepage,
  };
}

export function metricToDatabase(metric: Omit<Metric, 'id'>): Omit<DatabaseMetric, 'id' | 'created_at' | 'updated_at'> {
  return {
    value: metric.value,
    label: metric.label,
    order: metric.order,
  };
}

export function leadToDatabase(lead: Omit<Lead, 'id'>): Omit<DatabaseLead, 'id' | 'created_at' | 'updated_at'> {
  return {
    first_name: lead.firstName,
    last_name: lead.lastName,
    business_name: lead.businessName ?? null,
    email: lead.email,
    phone: lead.phone ?? null,
    website: lead.website ?? null,
    message: lead.message,
    booked_consult: lead.bookedConsult,
    calendly_event_uri: lead.calendlyEventUri ?? null,
  };
}

// ============================================
// Client Subscriptions / Monitoring Types
// ============================================

export type SubscriptionTier = 'none' | 'essentials' | 'care';
export type SiteStatus = 'active' | 'paused' | 'archived';
export type HealthCheckType = 'uptime' | 'health_api' | 'cms' | 'form' | 'seo' | 'ssl';
export type CheckResult = 'ok' | 'warn' | 'fail';
export type SeverityLevel = 'sev-1' | 'sev-2' | 'sev-3';
export type IncidentStatus = 'open' | 'monitoring' | 'resolved';

export interface DatabaseMonitoredSite {
  id: string;
  site_id: string;
  site_name: string;
  primary_domain: string;
  environment: string;
  client_id?: string | null;
  subscription_tier: SubscriptionTier;
  status: SiteStatus;
  site_secret?: string | null;
  client_email?: string | null;
  internal_email: string;
  last_deploy_at?: string | null;
  deploy_suppression_minutes: number;
  trial_start_date?: string | null;
  trial_end_date?: string | null;
  cms_table?: string | null;
  forms_table?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonitoredSite {
  id: string;
  siteId: string;
  siteName: string;
  primaryDomain: string;
  environment: string;
  clientId?: string;
  subscriptionTier: SubscriptionTier;
  status: SiteStatus;
  siteSecret?: string;
  clientEmail?: string;
  internalEmail: string;
  lastDeployAt?: string;
  deploySuppressionMinutes: number;
  createdAt: string;
  updatedAt: string;
  lastCheckResult?: CheckResult;
  trialStartDate?: string;
  trialEndDate?: string;
  cmsTable?: string;
  formsTable?: string;
}

export interface DatabaseHealthCheck {
  id: string;
  site_id: string;
  check_type: HealthCheckType;
  target: string;
  interval_minutes: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthCheck {
  id: string;
  siteId: string;
  checkType: HealthCheckType;
  target: string;
  intervalMinutes: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseHealthEvent {
  id: string;
  check_id: string;
  site_id?: string;
  created_at: string;
  result: CheckResult;
  http_status?: number | null;
  error_message?: string | null;
  latency_ms?: number | null;
  raw_payload?: any | null;
  check_type?: HealthCheckType;
  target?: string;
}

export interface HealthEvent {
  id: string;
  checkId: string;
  siteId?: string;
  createdAt: string;
  result: CheckResult;
  httpStatus?: number;
  errorMessage?: string;
  latencyMs?: number;
  rawPayload?: any;
  checkType?: HealthCheckType;
  target?: string;
}

export interface DatabaseIncident {
  id: string;
  site_id: string;
  health_check_id?: string | null;
  severity: SeverityLevel;
  status: IncidentStatus;
  title: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  auto_resolved: boolean;
}

export interface Incident {
  id: string;
  siteId: string;
  healthCheckId?: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  autoResolved: boolean;
}

export interface DatabaseErrorLog {
  id: string;
  site_id: string;
  level: string;
  message: string;
  stack?: string | null;
  context?: any | null;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  siteId: string;
  level: string;
  message: string;
  stack?: string;
  context?: any;
  createdAt: string;
}

// Transform functions for monitoring types
export function transformMonitoredSite(db: DatabaseMonitoredSite): MonitoredSite {
  return {
    id: db.id,
    siteId: db.site_id,
    siteName: db.site_name,
    primaryDomain: db.primary_domain,
    environment: db.environment,
    clientId: db.client_id ?? undefined,
    subscriptionTier: db.subscription_tier,
    status: db.status,
    siteSecret: db.site_secret ?? undefined,
    clientEmail: db.client_email ?? undefined,
    internalEmail: db.internal_email,
    lastDeployAt: db.last_deploy_at ?? undefined,
    deploySuppressionMinutes: db.deploy_suppression_minutes,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    trialStartDate: db.trial_start_date ?? undefined,
    trialEndDate: db.trial_end_date ?? undefined,
    cmsTable: db.cms_table ?? undefined,
    formsTable: db.forms_table ?? undefined,
  };
}

export function monitoredSiteToDatabase(site: Omit<MonitoredSite, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckResult'>): Omit<DatabaseMonitoredSite, 'id' | 'created_at' | 'updated_at'> {
  return {
    site_id: site.siteId,
    site_name: site.siteName,
    primary_domain: site.primaryDomain,
    environment: site.environment,
    client_id: site.clientId ?? null,
    subscription_tier: site.subscriptionTier,
    status: site.status ?? 'active',
    site_secret: site.siteSecret ?? null,
    client_email: site.clientEmail ?? null,
    internal_email: site.internalEmail,
    last_deploy_at: site.lastDeployAt ?? null,
    deploy_suppression_minutes: site.deploySuppressionMinutes ?? 15,
    trial_start_date: site.trialStartDate ?? null,
    trial_end_date: site.trialEndDate ?? null,
    cms_table: site.cmsTable ?? null,
    forms_table: site.formsTable ?? null,
  };
}

export function transformHealthCheck(db: DatabaseHealthCheck): HealthCheck {
  return {
    id: db.id,
    siteId: db.site_id,
    checkType: db.check_type,
    target: db.target,
    intervalMinutes: db.interval_minutes,
    enabled: db.enabled,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function healthCheckToDatabase(check: Omit<HealthCheck, 'id' | 'siteId' | 'createdAt' | 'updatedAt'>): Omit<DatabaseHealthCheck, 'id' | 'site_id' | 'created_at' | 'updated_at'> {
  return {
    check_type: check.checkType,
    target: check.target,
    interval_minutes: check.intervalMinutes,
    enabled: check.enabled,
  };
}

export function transformHealthEvent(db: DatabaseHealthEvent): HealthEvent {
  return {
    id: db.id,
    checkId: db.check_id,
    siteId: db.site_id,
    createdAt: db.created_at,
    result: db.result,
    httpStatus: db.http_status ?? undefined,
    errorMessage: db.error_message ?? undefined,
    latencyMs: db.latency_ms ?? undefined,
    rawPayload: db.raw_payload ?? undefined,
    checkType: db.check_type,
    target: db.target,
  };
}

export function transformIncident(db: DatabaseIncident): Incident {
  return {
    id: db.id,
    siteId: db.site_id,
    healthCheckId: db.health_check_id ?? undefined,
    severity: db.severity,
    status: db.status,
    title: db.title,
    description: db.description ?? undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    resolvedAt: db.resolved_at ?? undefined,
    autoResolved: db.auto_resolved,
  };
}

export function transformErrorLog(db: DatabaseErrorLog): ErrorLog {
  return {
    id: db.id,
    siteId: db.site_id,
    level: db.level,
    message: db.message,
    stack: db.stack ?? undefined,
    context: db.context ?? undefined,
    createdAt: db.created_at,
  };
}



