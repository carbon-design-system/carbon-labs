#!/bin/bash

# Clean previous build
yarn clean

# Compile TypeScript
tsc

# Copy SCSS files to maintain source structure
find src -type f -name "*.scss" | while read -r scss_file; do
  # Get the relative path from src
  rel_path="${scss_file#src/}"
  # Create the target directory in es
  mkdir -p "es/$(dirname "$rel_path")"
  # Copy the SCSS file
  cp "$scss_file" "es/$rel_path"
done

# Made with Bob
