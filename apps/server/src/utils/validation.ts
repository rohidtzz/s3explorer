export function isValidBucketName(name: string): boolean {
  return /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(name) && !name.includes('..');
}

export function isBucketAllowed(activeBucket: string | null, requested: string): boolean {
  if (!activeBucket) return true;
  return activeBucket === requested;
}
