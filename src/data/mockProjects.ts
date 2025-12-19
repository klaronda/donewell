import { Project } from '../components/ProjectCard';

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Strategy Consulting Platform',
    slug: 'strategy-consulting-platform',
    keyframeImage: 'https://images.unsplash.com/photo-1759143545924-0ea00615a054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2NTMzMjI3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    shortDescription: 'Professional website that helped a consulting firm book 12 clients in the first month.',
    badge: 'Web Design',
    metricValue: '98',
    metricLabel: 'Performance',
    showOnWorkPage: true,
    showOnHomepage: true,
    order: 1
  },
  {
    id: '2',
    title: 'Creative Agency Rebrand',
    slug: 'creative-agency-rebrand',
    keyframeImage: 'https://images.unsplash.com/photo-1613988753173-8db625c972c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwZGVzaWduJTIwbGFwdG9wfGVufDF8fHx8MTc2NTQ1Mjg3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    shortDescription: 'Complete website redesign that increased inbound leads by 340% in 60 days.',
    badge: 'Redesign',
    metricValue: '340%',
    metricLabel: 'Lead Increase',
    showOnWorkPage: true,
    showOnHomepage: true,
    order: 2
  },
  {
    id: '3',
    title: 'Wellness App Prototype',
    slug: 'wellness-app-prototype',
    keyframeImage: 'https://images.unsplash.com/photo-1630734242356-a6f858790740?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc2NTQzMjI1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    shortDescription: 'Interactive prototype that secured $200K seed funding and validated product-market fit.',
    badge: 'App Design',
    metricValue: '$200K',
    metricLabel: 'Funding Raised',
    showOnWorkPage: true,
    showOnHomepage: true,
    order: 3
  },
  {
    id: '4',
    title: 'E-commerce Fashion Store',
    slug: 'ecommerce-fashion-store',
    keyframeImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlfGVufDF8fHx8MTczNDQ2Nzk4MHww&ixlib=rb-4.1.0&q=80&w=1080',
    shortDescription: 'Modern e-commerce platform with seamless checkout experience and 99.9% uptime.',
    badge: 'E-commerce',
    metricValue: '99.9%',
    metricLabel: 'Uptime',
    showOnWorkPage: true,
    showOnHomepage: false,
    order: 4
  },
  {
    id: '5',
    title: 'SaaS Product Dashboard',
    slug: 'saas-product-dashboard',
    keyframeImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBhbmFseXRpY3N8ZW58MXx8fHwxNzM0NDY3OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    shortDescription: 'Data-rich dashboard interface with real-time analytics and beautiful data visualization.',
    badge: 'SaaS',
    metricValue: '95',
    metricLabel: 'User Score',
    showOnWorkPage: true,
    showOnHomepage: false,
    order: 5
  },
  {
    id: '6',
    title: 'Restaurant Booking System',
    slug: 'restaurant-booking-system',
    keyframeImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzM0NDY3OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    shortDescription: 'Streamlined reservation system that reduced no-shows by 65% and increased bookings.',
    badge: 'Web App',
    metricValue: '65%',
    metricLabel: 'Fewer No-Shows',
    showOnWorkPage: true,
    showOnHomepage: false,
    order: 6
  }
];

export const getVisibleProjects = () => {
  return mockProjects
    .filter(p => p.showOnWorkPage)
    .sort((a, b) => a.order - b.order);
};

export const getHomepageProjects = () => {
  return mockProjects
    .filter(p => p.showOnHomepage)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
};

export const getProjectBySlug = (slug: string) => {
  return mockProjects.find(p => p.slug === slug);
};

export const getRelatedProjects = (currentId: string, limit: number = 3) => {
  return mockProjects
    .filter(p => p.id !== currentId && p.showOnWorkPage)
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
};
