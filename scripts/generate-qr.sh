#!/bin/bash

# Set the BASE_URL environment variable if not already set
if [ -z "$BASE_URL" ]; then
  echo "WARNING: BASE_URL environment variable not set, using default http://localhost:5000"
  export BASE_URL="http://localhost:5000"
else
  echo "Using BASE_URL: $BASE_URL"
fi

# Run the QR code generator script
NODE_ENV=production node scripts/generate-qr-codes.js