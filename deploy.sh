#!/usr/bin/env bash
# deploy.sh — build Storybook and commit output to the gh-pages branch.
# Run from main with a clean working tree: commit your changes first, then run this.
# Then open GitHub Desktop and push both branches.

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
STAGE_DIR="/tmp/mc-storybook-deploy"

cd "$REPO_ROOT"

# Guard: must be on main
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Error: must be on main branch (currently on '$CURRENT_BRANCH')."
  exit 1
fi

# Guard: working tree must be clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: uncommitted changes detected. Commit or stash them before deploying."
  git status --short
  exit 1
fi

echo "Building Storybook..."
npx storybook build -o storybook-static

echo "Staging build output..."
rm -rf "$STAGE_DIR"
cp -R "$REPO_ROOT/storybook-static" "$STAGE_DIR"
touch "$STAGE_DIR/.nojekyll"

echo "Switching to gh-pages..."
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

echo ""
echo "Done. Open GitHub Desktop and push both branches to publish."
