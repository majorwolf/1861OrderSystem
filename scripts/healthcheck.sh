#!/bin/bash

# Health check script for 1861 Public House ordering system application
# This checks if the application is responding to HTTP requests

# Wait for the app to be ready
sleep 1

# Try to access the root endpoint
HTTP_RESPONSE=$(wget --spider --server-response http://localhost:5000 2>&1 | awk '/HTTP\/1.1/{print $2}')

if [[ "$HTTP_RESPONSE" == *"200"* ]] || [[ "$HTTP_RESPONSE" == *"302"* ]] || [[ "$HTTP_RESPONSE" == *"304"* ]]; then
  echo "Application is healthy - HTTP response: $HTTP_RESPONSE"
  exit 0
else
  echo "Application is not healthy - HTTP response: $HTTP_RESPONSE"
  exit 1
fi