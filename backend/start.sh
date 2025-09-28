#!/usr/bin/env bash
set -euo pipefail

# Ensure /data exists for persistence if mounted
mkdir -p /data /data/media || true

# Export MEDIA_DIR default if not set
export MEDIA_DIR="${MEDIA_DIR:-/data/media}"

# Ensure Python can import the application package
export PYTHONPATH="${PYTHONPATH:-/app}:/app"

# Run Alembic migrations if configuration is present
if [ -f "alembic.ini" ] && [ -d "alembic" ]; then
  echo "▶ Running Alembic migrations..."
  alembic upgrade head || {
    echo "Alembic failed" >&2
    exit 1
  }
else
  echo "ℹ Alembic configuration not found. Skipping migrations."
fi

# Launch the app
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
