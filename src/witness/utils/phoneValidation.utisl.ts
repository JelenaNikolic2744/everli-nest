import { parsePhoneNumberFromString } from 'libphonenumber-js'

/**
 * Parses the input phone string into a PhoneNumber object using libphonenumber-js.
 * Returns undefined if the number is not parseable.
 *
 * @param phone - The phone number as a string
 * @returns Parsed phone number object or undefined
 */
export function parsePhone(phone: string) {
  return parsePhoneNumberFromString(phone)
}

/**
 * Validates whether the given phone number is in a correct and valid international format.
 *
 * @param phone - The phone number
 * @returns true if valid, false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneNumber = parsePhone(phone)
  return phoneNumber?.isValid() ?? false
}

/**
 * Extracts the country code from a given phone number.
 *
 * @param phone - The phone number
 * @returns Country code (e.g., 'US', 'CN') or null if not found
 */
export function getCountryFromPhone(phone: string): string | null {
  const phoneNumber = parsePhone(phone)
  return phoneNumber?.country ?? null
}
