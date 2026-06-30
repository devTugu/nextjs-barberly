#!/usr/bin/env bash
set -euo pipefail

API_DIR="${API_DIR:-api}"
API_PID=""
KEYCLOAK_STARTED=false

cleanup() {
  if [[ -n "${API_PID}" ]] && kill -0 "${API_PID}" 2>/dev/null; then
    kill "${API_PID}" || true
    wait "${API_PID}" 2>/dev/null || true
  fi
  if [[ "${KEYCLOAK_STARTED}" == "true" ]]; then
    docker compose -f "${API_DIR}/deploy/docker/docker-compose.keycloak-e2e.yml" down || true
  fi
}
trap cleanup EXIT

if [[ "${RUN_OAUTH_E2E:-true}" == "true" ]] && command -v docker >/dev/null 2>&1; then
  echo "Starting Keycloak for OAuth E2E..."
  docker compose -f "${API_DIR}/deploy/docker/docker-compose.keycloak-e2e.yml" up -d --wait
  KEYCLOAK_STARTED=true
  cat >> "${API_DIR}/.env" <<'EOF'
OAUTH_ENABLED=true
OAUTH_ISSUER=http://localhost:8080/realms/portfolio
OAUTH_CLIENT_ID=portfolio-admin
OAUTH_CLIENT_SECRET=portfolio-admin-secret
OAUTH_CALLBACK_URL=http://localhost:3000/oauth/callback
EOF
  export NEXT_PUBLIC_OAUTH_ENABLED=true
fi

export MFA_REQUIRED_ROLES="${MFA_REQUIRED_ROLES:-}"
echo "MFA_REQUIRED_ROLES=${MFA_REQUIRED_ROLES}" >> "${API_DIR}/.env"

cd "${API_DIR}"
echo "Building API for E2E..."
npm run build

MAIN_ENTRY=""
if [[ -f "dist/main.js" || -f "dist/main" ]]; then
  MAIN_ENTRY="dist/main"
elif [[ -f "dist/src/main.js" || -f "dist/src/main" ]]; then
  MAIN_ENTRY="dist/src/main"
fi

if [[ -z "${MAIN_ENTRY}" ]]; then
  echo "API build output missing main entry."
  exit 1
fi

echo "Starting API from ${MAIN_ENTRY} ..."
node "${MAIN_ENTRY}" &
API_PID=$!
cd - > /dev/null

echo "Waiting for API at http://localhost:3001/api/v1/health/ready..."
for attempt in $(seq 1 60); do
  if curl -sf http://localhost:3001/api/v1/health/ready > /dev/null; then
    echo "API is ready"
    break
  fi
  if [[ "${attempt}" -eq 60 ]]; then
    echo "API failed to become ready in time"
    exit 1
  fi
  sleep 2
done

npm run test:e2e
