#!/bin/sh
# Rebuild the static search index in /pagefind/ (read by assets/search.js).
# Run after adding or changing pages; the settings are in pagefind.yml.
set -e
cd "$(dirname "$0")/.."
rm -rf pagefind
npx -y pagefind@1.3.0
