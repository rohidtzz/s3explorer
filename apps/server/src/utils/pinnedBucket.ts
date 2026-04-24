import { connections } from '../services/db.js';
import { isBucketAllowed } from './validation.js';

export function assertBucketAllowed(requested: string): void {
  const active = connections.getActive();
  const pinned = active?.bucket ?? null;
  if (!isBucketAllowed(pinned, requested)) {
    const err: any = new Error(
      `This connection is pinned to bucket "${pinned}". Cross-bucket access is not allowed.`
    );
    err.status = 403;
    throw err;
  }
}
