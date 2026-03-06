#!/bin/bash

# Clean previous build
yarn clean

# Transpile JavaScript with Babel
babel src --quiet -d es

# Copy TypeScript declaration files
find src -name "*.d.ts" -type f | while read file; do
  dest="es/${file#src/}"
  mkdir -p "$(dirname "$dest")"
  cp "$file" "$dest"
done
