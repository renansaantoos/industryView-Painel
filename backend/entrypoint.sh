#!/bin/sh
set -e

# Fallback: se DIRECT_URL nao estiver definida, usa DATABASE_URL
if [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$DATABASE_URL"
  echo "DIRECT_URL not set, using DATABASE_URL as fallback"
fi

# Aplica migrations pendentes (idempotente)
echo "Running prisma migrate deploy..."
npx prisma migrate deploy

# Inicia o servidor
echo "Starting server..."
exec npm start
