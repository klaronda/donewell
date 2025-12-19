const COLOR_CLASS_RE =
  /^((?:[a-z0-9-]+:)*)((?:text|bg|border|from|via|to))-\[--color-([a-z]+)-(\d+)\]$/i;

function normalizeToken(token: string): string | null {
  const m = token.match(COLOR_CLASS_RE);
  if (!m) return null;

  const [, variantPrefix, utility, palette, shade] = m;
  return `${variantPrefix}${utility}-${palette.toLowerCase()}-${shade}`;
}

function normalizeClassList(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  if (!el.classList || el.classList.length === 0) return;

  const original = Array.from(el.classList);
  for (const token of original) {
    const normalized = normalizeToken(token);
    if (!normalized || normalized === token) continue;

    el.classList.remove(token);
    el.classList.add(normalized);
  }
}

function normalizeTree(root: ParentNode) {
  if (root instanceof Element) normalizeClassList(root);
  root.querySelectorAll?.("[class]")?.forEach((el) => normalizeClassList(el));
}

/**
 * Figma Make sometimes exports Tailwind classes like `text-[--color-stone-700]`
 * which Tailwind does not interpret as valid CSS values.
 *
 * We normalize those class tokens at runtime into standard Tailwind tokens
 * like `text-stone-700` (including variants like `hover:` / `md:` etc).
 *
 * Tailwind is configured with a safelist to ensure these tokens are generated.
 */
export function installFigmaMakeClassNormalizer() {
  // Normalize anything already in the DOM.
  normalizeTree(document);

  // Normalize future nodes (React renders, modal portals, etc).
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.target instanceof Element) {
        normalizeClassList(m.target);
        continue;
      }
      for (const node of m.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        normalizeTree(node as Element);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}





