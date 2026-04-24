import { describe, it, expect } from 'vitest';
import { isValidBucketName } from '../src/utils/validation.js';

describe('isValidBucketName', () => {
  it('accepts typical valid names', () => {
    expect(isValidBucketName('my-bucket')).toBe(true);
    expect(isValidBucketName('abc')).toBe(true);
    expect(isValidBucketName('foo.bar.baz')).toBe(true);
    expect(isValidBucketName('a1b2c3')).toBe(true);
  });

  it('rejects uppercase', () => {
    expect(isValidBucketName('MyBucket')).toBe(false);
    expect(isValidBucketName('UPPER')).toBe(false);
  });

  it('rejects too short (< 3)', () => {
    expect(isValidBucketName('ab')).toBe(false);
    expect(isValidBucketName('a')).toBe(false);
  });

  it('rejects too long (> 63)', () => {
    expect(isValidBucketName('a'.repeat(64))).toBe(false);
  });

  it('accepts boundary lengths (3 and 63)', () => {
    expect(isValidBucketName('abc')).toBe(true);
    expect(isValidBucketName('a' + 'b'.repeat(61) + 'c')).toBe(true);
  });

  it('rejects leading or trailing dot/hyphen', () => {
    expect(isValidBucketName('.foo')).toBe(false);
    expect(isValidBucketName('foo.')).toBe(false);
    expect(isValidBucketName('-foo')).toBe(false);
    expect(isValidBucketName('foo-')).toBe(false);
  });

  it('rejects consecutive dots', () => {
    expect(isValidBucketName('foo..bar')).toBe(false);
  });

  it('rejects whitespace and special chars', () => {
    expect(isValidBucketName('foo bar')).toBe(false);
    expect(isValidBucketName('foo/bar')).toBe(false);
    expect(isValidBucketName('foo_bar')).toBe(false);
    expect(isValidBucketName('')).toBe(false);
  });
});
