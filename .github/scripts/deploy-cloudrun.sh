#!/usr/bin/env bash
# Deploy an image to Cloud Run, retrying while the image is not available yet.
# Cloud Run pulls Docker Hub images through mirror.gcr.io, which may not know a
# freshly pushed digest for a while and then fails with "Image ... not found".
# Usage: deploy-cloudrun.sh <service> <image>  (env: PROJECT_ID)
set -uo pipefail

service="$1"
image="$2"
attempts="${DEPLOY_ATTEMPTS:-10}"
delay="${DEPLOY_DELAY:-30}"

for ((i = 1; i <= attempts; i++)); do
  if output=$(gcloud run deploy "$service" \
    --image "$image" \
    --region europe-west1 \
    --project "$PROJECT_ID" \
    --update-labels "managed-by=github-actions,commit-sha=${GITHUB_SHA:-unknown}" \
    --quiet 2>&1); then
    echo "$output"
    exit 0
  fi
  echo "$output"
  if ! grep -q "not found" <<<"$output"; then
    echo "::error::Deployment of $service failed"
    exit 1
  fi
  echo "Image not available yet (attempt $i/$attempts), retrying in ${delay}s..."
  sleep "$delay"
done

echo "::error::Image for $service still not found after $attempts attempts"
exit 1
