import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cryptoModule = vi.hoisted(() => ({
  randomUUID: vi.fn(),
}));

vi.mock('expo-crypto', () => cryptoModule);

describe('uuid', () => {
  beforeEach(() => {
    vi.resetModules();
    cryptoModule.randomUUID.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to Web Crypto when expo-crypto randomUUID exists but throws', async () => {
    cryptoModule.randomUUID.mockImplementation(() => {
      throw new TypeError('getCrypto(...).randomUUID is not a function');
    });
    const webRandomUUID = vi.fn(() => '11111111-2222-4333-8444-555555555555');
    vi.stubGlobal('crypto', { randomUUID: webRandomUUID });

    const { uuid } = await import('./uuid');

    expect(uuid()).toBe('11111111-2222-4333-8444-555555555555');
    expect(cryptoModule.randomUUID).toHaveBeenCalledOnce();
    expect(webRandomUUID).toHaveBeenCalledOnce();
  });
});
