#!/bin/sh

set -eu

: "${NEXT_PUBLIC_API_URL:?renseigner NEXT_PUBLIC_API_URL}"

node -e "new URL(process.env.NEXT_PUBLIC_API_URL)"

node <<'NODE' > /app/public/runtime-config.js
const apiUrl = JSON.stringify(process.env.NEXT_PUBLIC_API_URL.trim());
process.stdout.write(`window.__CENTRALE_NI_CONFIG__ = { apiUrl: ${apiUrl} };\n`);
NODE

exec "$@"
