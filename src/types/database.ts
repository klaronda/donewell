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
    message: lead.message,
    booked_consult: lead.bookedConsult,
    calendly_event_uri: lead.calendlyEventUri ?? null,
  };
}



