#!/usr/bin/env sh
set -e

if [ -n "$URL" ]; then
  echo "[nodebb] setting URL=$URL into /opt/config/config.json"
  if [ -f /opt/config/config.json ]; then
    node <<'NODE'
const fs = require('fs');
const path = '/opt/config/config.json';
const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
const url = process.env.URL;
if (url) {
  cfg.url = url;
  const parsed = new URL(url);
  cfg.port = parsed.port || cfg.port;
}
fs.writeFileSync(path, JSON.stringify(cfg, null, 4) + '\n');
NODE
  else
    echo "[nodebb] /opt/config/config.json not found"
  fi
fi

exec /usr/local/bin/entrypoint.sh "$@"
