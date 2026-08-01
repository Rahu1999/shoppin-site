const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/** Server-side fetch of which optional modules (blog/catalogue) are publicly enabled. */
export async function getPublicModuleFlags(): Promise<Record<string, boolean>> {
  try {
    const res = await fetch(`${API_BASE}/module-settings/public`, { next: { revalidate: 60 } });
    if (!res.ok) return { blog: true, catalogue: true };
    const json = await res.json();
    return json.data || json;
  } catch {
    return { blog: true, catalogue: true };
  }
}
