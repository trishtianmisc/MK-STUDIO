/**
 * Free-text search helpers for the public catalogue.
 *
 * The search term is injected into a PostgREST `or=(...)` logic tree, where the
 * grammar is `column.operator.value` and branches are separated by commas and
 * grouped with parentheses. Anything the user types that could terminate a
 * branch or open a new group therefore has to be stripped first.
 */

/** Characters that break PostgREST's `or=` grammar or act as LIKE wildcards. */
const UNSAFE = /[(),{}"'\\*%]/g;

export const SEARCH_MAX_LENGTH = 100;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Reduce a raw query string to a safe single-phrase search term.
 * Returns "" when nothing searchable is left.
 */
export function sanitizeSearchTerm(raw: string | null | undefined): string {
  const term = String(raw ?? "")
    .replace(UNSAFE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SEARCH_MAX_LENGTH);
  return term;
}

/**
 * Build the PostgREST `or=` body for a search term, or null when the term is
 * empty (PostgREST rejects an empty `or=()`).
 *
 * Branches: name, style, length (Mini/Midi/Maxi), brand, exact size token,
 * matching category ids, and — when the term is a bare number — the waist and
 * garment length measurements in inches.
 */
export function buildSearchOr(
  raw: string | null | undefined,
  categoryIds: readonly string[] = [],
): string | null {
  const term = sanitizeSearchTerm(raw);
  if (!term) return null;

  const branches = [
    `name.ilike.*${term}*`,
    `style.ilike.*${term}*`,
    `length.ilike.*${term}*`,
    `brand.ilike.*${term}*`,
    `sizes.ov.{${term}}`,
  ];

  const ids = categoryIds.filter((id) => UUID.test(id));
  if (ids.length > 0) branches.push(`category_id.in.(${ids.join(",")})`);

  if (/^\d{1,3}$/.test(term)) {
    branches.push(`waist_in.eq.${term}`, `dress_length_in.eq.${term}`);
  }

  return branches.join(",");
}
