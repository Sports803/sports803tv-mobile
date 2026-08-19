import { getApiBaseUrl } from "../constants/oauth";
import { type OwnerControlKey, type OwnerControlMap } from "./owner-control-contract";

export type { OwnerControlKey, OwnerControlMap } from "./owner-control-contract";

const cache: { value: OwnerControlMap; expiresAt: number } = { value: {}, expiresAt: 0 };
const CACHE_MS = 60_000;

/**
 * Retrieves only public, owner-approved presentation controls. Firebase content remains
 * the app's source of truth whenever the dashboard is unavailable or returns no override.
 */
export async function fetchOwnerControls(force = false): Promise<OwnerControlMap> {
  if (!force && cache.expiresAt > Date.now()) return cache.value;
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/public/control-config`);
    if (!response.ok) throw new Error("Owner controls are unavailable");
    const payload = await response.json() as { config?: Array<{ key: OwnerControlKey; value: unknown }> };
    const value = Object.fromEntries((payload.config ?? []).map((entry) => [entry.key, entry.value])) as OwnerControlMap;
    cache.value = value;
    cache.expiresAt = Date.now() + CACHE_MS;
    return value;
  } catch {
    return cache.value;
  }
}
