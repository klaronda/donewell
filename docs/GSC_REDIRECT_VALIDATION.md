# Google Search Console – "Page with redirect" validation

If GSC shows **Validation Failed** for `https://www.donewellco.com/`, `http://donewellco.com/`, or `http://www.donewellco.com/`, it’s usually because Google sees a **redirect chain** (multiple hops) and prefers a single redirect to the canonical URL.

## What’s in place

- **vercel.json** – Redirects `www.donewellco.com` → `https://donewellco.com` (301).
- **Vercel** – Automatically redirects HTTP → HTTPS before your app.

So today:

- `https://www.donewellco.com/` → 1 redirect → `https://donewellco.com/` ✅  
- `http://donewellco.com/` → 1 redirect (HTTP→HTTPS) → `https://donewellco.com/` ✅  
- `http://www.donewellco.com/` → 2 redirects (HTTP→HTTPS, then www→non-www) ⚠️  

The **http://www** case is a 2-hop chain and can cause validation to fail.

## 1. Use Vercel Domain Redirect (recommended)

Redirect **www** at the domain level so Vercel does it in one step:

1. Vercel Dashboard → your project → **Settings** → **Domains**.
2. You should see **donewellco.com** and **www.donewellco.com**.
3. For **www.donewellco.com**, open the **⋮** menu → **Edit** (or **Redirect**).
4. Set it to **Redirect to** `https://donewellco.com` (or “Redirect to primary domain”).
5. Save.

That keeps a single redirect for `https://www` → `https://donewellco.com`. You can leave the `vercel.json` www redirect in place; the domain redirect may take precedence at the edge.

## 2. Optional: Single-hop redirect at your DNS/host

To turn **http://www** into **one** redirect (and help validation further), do the redirect where your domain is hosted (Squarespace, Cloudflare, etc.):

- **From:** `http://www.donewellco.com`, `http://donewellco.com`, `https://www.donewellco.com`  
- **To:** `https://donewellco.com`

So by the time the request reaches Vercel, it’s already `https://donewellco.com`. Example:

- **Squarespace** – Domains → **Redirects** → add redirects for `http://`, `http://www`, and `https://www` to `https://donewellco.com`.
- **Cloudflare** – **Rules** → **Redirect Rules** (or Page Rules) → redirect those variants to `https://donewellco.com`.

After changing DNS/host redirects, wait for DNS to propagate, then in GSC run **Validate** again.

## 3. Ensure the canonical URL is indexable

Validation can also fail if the **destination** has issues:

- Open: `https://donewellco.com/`
- It should return **200**, have `<link rel="canonical" href="https://donewellco.com/">` and no `noindex`.
- In GSC, use **URL Inspection** for `https://donewellco.com/` and, if needed, **Request indexing**.

## Summary

1. **Vercel** – Domain Redirect for www → non-www (Settings → Domains).  
2. **Optional** – At DNS/host, redirect http and www to `https://donewellco.com` so there’s only one hop.  
3. **Check** – `https://donewellco.com/` returns 200 and is indexable, then run **Validate** again in GSC.
