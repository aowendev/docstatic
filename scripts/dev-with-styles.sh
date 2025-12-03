#!/bin/bash
# Start TinaCMS dev server and inject styles when ready

echo "Starting TinaCMS development server..."

# Start the dev server in background
yarn run tinacms dev -c "docusaurus start" &
DEV_PID=$!

# Wait for admin file to be generated and inject styles
echo "Waiting for TinaCMS admin file to be generated..."
sleep 10

# Try to inject styles every few seconds until successful
for i in {1..10}; do
  if node scripts/inject-tina-styles.js 2>/dev/null; then
    echo "Custom styles injected successfully!"
    break
  fi
  echo "Attempt $i: Admin file not ready yet, waiting..."
  sleep 3
done

# Keep the script running and watch for file changes
node scripts/watch-tina-styles.js &
WATCH_PID=$!

echo "Development server is running. Press Ctrl+C to stop."

# Cleanup function
cleanup() {
  echo "Stopping development server..."
  kill $DEV_PID 2>/dev/null
  kill $WATCH_PID 2>/dev/null
  exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for dev server
wait $DEV_PID