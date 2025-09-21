#!/bin/bash

export $(cat ../.env | xargs)

OWNER="aowendev"
REPO="docstatic"
WORKFLOW_IDS=(190939438 190939440 190939441 190939442 190939443 190939444 187688774 191131363) # <-- Replace with your actual workflow IDs
PER_PAGE=100

delete_runs() {
  local WORKFLOW_ID="$1"
  PAGE=1
  while :; do
    echo "📦 Fetching runs for workflow $WORKFLOW_ID from page $PAGE..."
    RUNS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_ID/runs?per_page=$PER_PAGE&page=$PAGE" \
    | jq '.workflow_runs[]?.id')

    if [[ -z "$RUNS" ]]; then
      echo "✅ No more runs to delete for workflow $WORKFLOW_ID."
      break
    fi

    for RUN_ID in $RUNS; do
      echo "🗑️ Deleting run ID: $RUN_ID from workflow $WORKFLOW_ID"
      curl -s -X DELETE \
        -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID"
    done

    ((PAGE++))
    sleep 1
  done
}

for WF_ID in "${WORKFLOW_IDS[@]}"; do
  delete_runs "$WF_ID"
done