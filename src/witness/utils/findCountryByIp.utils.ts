import * as geoip from 'geoip-lite'

/**
 * Returns the country code based on the provided IP address using geoip-lite.
 *
 * @param ip - The IP address of the client.
 * @returns A 2-letter country code (e.g., 'US', 'RS') or null if not found.
 */
export function getCountryFromIp(ip: string): string | null {
  const geo = geoip.lookup(ip)

  return geo?.country ?? null
}
