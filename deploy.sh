#!/usr/bin/env bash
# deploy.sh — build Storybook and commit output to the gh-pages branch.
# Run via: npm run deploy
# After this script finishes, open GitHub Desktop and click Push origin.

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$REPO_ROOT/storybook-static"

echo "▸ Building Storybook..."
npm run build-storybook --silent

echo "▸ Switching to gh-pages branch..."
git checkout gh-pages

echo "▸ Replacing build output..."
find . -maxdepth 1 \
  ! -name '.' \
  ! -name '.git' \
  ! -name '.gitignore' \
  -exec rm -rf {} +

cp -R "$BUILD_DIR"/. .
touch .nojekyll

echo "▸ Committing..."
git add .
git commit -m "Deploy Storybook $(date '+%Y-%m-%d %H:%M')" || echo "Nothing to commit."

echo "▸ Returning to main..."
git checkout main

echo ""
echo "Done. Open GitHub Desktop and push both branches to publish."
