/**
 * Strips undefined keys from an object.
 * Supabase Insert/Update types expect explicit null for nullable fields,
 * not undefined. This helper removes undefined values so only defined
 * keys are passed to Supabase.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}
