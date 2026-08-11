#!/usr/bin/env bash
# deploy.sh — build Storybook and commit output to the gh-pages branch.
# Run: npm run deploy
# Then open GitHub Desktop and push both branches.

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
STAGE_DIR="/tmp/mc-storybook-deploy"

echo "Building Storybook..."
cd "$REPO_ROOT"
npx storybook build -o storybook-static --quiet

echo "Staging build output..."
rm -rf "$STAGE_DIR"
cp -R "$REPO_ROOT/storybook-static" "$STAGE_DIR"
touch "$STAGE_DIR/.nojekyll"

echo "Switching to gh-pages..."
git stash --quiet
git checkout gh-pages

echo "Replacing build output..."
find . -maxdepth 1 \
  ! -name '.' \
  ! -name '.git' \
  ! -name '.gitignore' \
  ! -name 'node_modules' \
  -exec rm -rf {} +

cp -R "$STAGE_DIR"/. .
rm -rf "$STAGE_DIR"

echo "Committing..."
git add .
git commit -m "Deploy Storybook $(date '+%Y-%m-%d %H:%M')" || echo "Nothing new to commit."

echo "Returning to main..."
git checkout main
git stash pop --quiet 2>/dev/null || true

echo ""
echo "Done. Open GitHub Desktop and push both branches to publish."
