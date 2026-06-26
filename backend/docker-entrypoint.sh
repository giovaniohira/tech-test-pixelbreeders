#!/bin/bash
set -euo pipefail

wait_for_db() {
  echo "Waiting for PostgreSQL at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
  until pg_isready \
    -h "${POSTGRES_HOST:-db}" \
    -p "${POSTGRES_PORT:-5432}" \
    -U "${POSTGRES_USER:-filevault}" \
    -d "${POSTGRES_DB:-filevault}" \
    > /dev/null 2>&1; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
  done
  echo "PostgreSQL is ready"
}

wait_for_db

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting: $*"
exec "$@"
