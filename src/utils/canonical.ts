/**
 * Canonical URL base must match the host that actually serves HTML.
 * When Vercel is set to "apex → www", crawlers mostly see www; declaring
 * canonical as apex while apex redirects to www confuses Search Console.
 * When Vercel uses apex as primary, use apex here (default branch).
 */
export function canonicalOriginFromHost(hostname: string): string {
  const h = hostname.toLowerCase();
  if (h === 'www.donewellco.com') return 'https://www.donewellco.com';
  return 'https://donewellco.com';
}

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  let p = pathname;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

export function canonicalUrlForPath(hostname: string, pathname: string): string {
  const origin = canonicalOriginFromHost(hostname);
  const p = normalizePathname(pathname);
  return p === '/' ? `${origin}/` : `${origin}${p}`;
}
