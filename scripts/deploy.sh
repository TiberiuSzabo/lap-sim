#!/usr/bin/env bash
# Runs on the server, started over SSH by the "deploy" job in .github/workflows/ci.yml.
# The latest code has already been pulled (see the forced command in authorized_keys).
set -euo pipefail

cd "$(dirname "$0")/.."
git log --oneline -1
WEB_PORT=80 docker compose up -d --build --remove-orphans
# Every deploy leaves the previous images behind; without this the disk slowly fills up.
docker image prune -f
docker compose ps --format "{{.Service}} | {{.Status}}"
