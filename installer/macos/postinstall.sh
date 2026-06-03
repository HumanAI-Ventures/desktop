#!/usr/bin/env bash
# Apparae macOS postinstall — registers the daemon as a LaunchAgent.
# Per plan 12-A Task 7. Idempotent (bootout-then-bootstrap on upgrade).
set -euo pipefail

HOME_DIR="${HOME}"
PLIST_SRC="$(dirname "$0")/com.apparae.agency.plist"
PLIST_DEST="${HOME_DIR}/Library/LaunchAgents/com.apparae.agency.plist"
DAEMON_PATH="/Applications/Apparae.app/Contents/Resources/apparae-daemon"

mkdir -p "${HOME_DIR}/Library/LaunchAgents"
mkdir -p "${HOME_DIR}/Library/Logs/com.apparae.agency"
mkdir -p "${HOME_DIR}/.apparae"

sed -e "s|__DAEMON_PATH__|${DAEMON_PATH}|g" \
    -e "s|__HOME__|${HOME_DIR}|g" \
    "${PLIST_SRC}" > "${PLIST_DEST}"

chmod 644 "${PLIST_DEST}"

# Reload (idempotent — bootout first in case of upgrade)
launchctl bootout "gui/$(id -u)" "${PLIST_DEST}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "${PLIST_DEST}"

echo "Apparae agency daemon registered as LaunchAgent."
