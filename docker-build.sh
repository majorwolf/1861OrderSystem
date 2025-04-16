#!/bin/bash

# Build the client application
echo "Building client application..."
npm run build

# Ensure dist/server directory exists
mkdir -p dist/server

# Compile all TypeScript files in the server directory
echo "Compiling server TypeScript files..."
for file in server/*.ts; do
  filename=$(basename "$file" .ts)
  echo "Compiling $filename.ts..."
  npx tsc "$file" --outDir dist/server --module ESNext --moduleResolution NodeNext --target ES2020 --esModuleInterop
done

# Compile shared schema
echo "Compiling shared schema..."
npx tsc shared/schema.ts --outDir dist/shared --module ESNext --moduleResolution NodeNext --target ES2020 --esModuleInterop

echo "Build completed!"