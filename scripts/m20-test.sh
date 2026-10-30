#!/usr/bin/env bash
# Synthetic-only M20.12 test runner. No deployment and no network required.
set -euo pipefail
ROOT="$(dirname "$(dirname "$(realpath "$0")")")"
cd "$ROOT"
bash -n scripts/m20-controlled-release.sh
python3 - <<'PY'
import ast
from pathlib import Path
ast.parse(Path("scripts/m20-signed-preflight.py").read_text())
print("M20_VERIFIER_SYNTAX=PASS")
PY
python3 -m unittest discover -s tests -p 'test_m20_detached_preflight.py' -v
echo "M20_12_SYNTHETIC_TEST_SUITE=PASS"
echo "PRODUCTION_DEPLOYMENT_EXECUTED=NO"
