import * as Crypto from 'expo-crypto';

/**
 * Generates a v4 UUID that works across every runtime this app targets.
 *
 * `globalThis.crypto` exists in the browser but is undefined in the Hermes /
 * React Native runtime, so reaching for the Web Crypto API directly crashed the
 * native build the instant a session started. `expo-crypto.randomUUID()` is a
 * native module that resolves correctly on iOS, Android and web.
 *
 * These IDs label trials, blocks and sessions — they are not security tokens —
 * so the final fallback favours never throwing over cryptographic strength.
 */
export function uuid(): string {
  const native = Crypto.randomUUID;
  if (typeof native === 'function') {
    try {
      return native();
    } catch {
      // Expo web can expose randomUUID while delegating to an unavailable Web
      // Crypto method. Fall through to the explicit browser/runtime fallback.
    }
  }

  const cryptoApi = globalThis.crypto;
  const randomUUID = cryptoApi?.randomUUID;
  if (typeof randomUUID === 'function') {
    try {
      return randomUUID.call(cryptoApi);
    } catch {
      // Keep the final byte-based fallback available in constrained runtimes.
    }
  }

  const getRandomValues = cryptoApi?.getRandomValues?.bind(cryptoApi);
  const bytes = new Uint8Array(16);
  if (typeof getRandomValues === 'function') {
    getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
