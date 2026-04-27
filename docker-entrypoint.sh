#!/bin/sh
set -e

DATA_DIR="${DATA_DIR:-/data}"

# Managed platforms (Railway, Fly, etc.) mount their volumes as root:root, which
# overlays the image's pre-chowned directory and locks the non-root app user out.
# We start as root, reconcile ownership at runtime, then drop privileges via
# su-exec before handing off to the app. Skip the chown when an external runner
# (`docker run --user`, k8s securityContext) has already started us as non-root.
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R node:node "$DATA_DIR"
  exec su-exec node "$@"
fi

exec "$@"
