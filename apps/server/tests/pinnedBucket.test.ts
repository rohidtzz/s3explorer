import { describe, it, expect } from 'vitest';
import { isBucketAllowed } from '../src/utils/validation.js';

describe('isBucketAllowed', () => {
  it('allows any bucket when connection is not pinned (activeBucket=null)', () => {
    expect(isBucketAllowed(null, 'anything')).toBe(true);
    expect(isBucketAllowed(null, 'other-bucket')).toBe(true);
    expect(isBucketAllowed(null, '')).toBe(true);
  });

  it('allows only the matching bucket when pinned', () => {
    expect(isBucketAllowed('pinned', 'pinned')).toBe(true);
  });

  it('rejects any other bucket when pinned', () => {
    expect(isBucketAllowed('pinned', 'other')).toBe(false);
    expect(isBucketAllowed('pinned', '')).toBe(false);
    expect(isBucketAllowed('pinned', 'pinned-2')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(isBucketAllowed('pinned', 'Pinned')).toBe(false);
    expect(isBucketAllowed('Pinned', 'pinned')).toBe(false);
  });
});
