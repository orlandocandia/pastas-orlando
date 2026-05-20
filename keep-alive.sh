#!/bin/bash
# Keep-alive script to restart the dev server if it dies
while true; do
  cd /home/z/my-project
  npx next dev -p 3000
  echo "Server died at $(date), restarting in 3s..."
  sleep 3
done
