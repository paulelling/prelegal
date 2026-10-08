#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
echo "Building and starting Prelegal..."
docker compose up -d --build
echo "Prelegal is running at http://localhost:8000"
