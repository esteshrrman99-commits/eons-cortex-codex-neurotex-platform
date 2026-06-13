# 12 Micro-Master Prompts for GitHub Pages Permanent Staging

Use these in order inside the GitHub repo Codespace. They are mobile-safe: no heredocs, no editors, no pagers.

## 1 — Create repo shell
```bash
set +e; mkdir -p public/assets scripts docs reports private/evidence-vault private/review-packets private/ip-vault .github/workflows; printf 'EONS platform shell ready\n'
```

## 2 — Add starter pack
Upload or unzip the provided EONS starter package into the repo root, then run:
```bash
set +e; find . -maxdepth 2 -type f | sort | sed -n '1,120p'
```

## 3 — Protect private files
```bash
set +e; printf '%s\n' '.env' '*.pem' '*.key' 'private/source-packs/*.zip' 'node_modules/' '.DS_Store' > .gitignore; git status --short
```

## 4 — Build Pages output
```bash
set +e; npm run build; npm run verify
```

## 5 — Create proof ledger
```bash
set +e; npm run proof; sed -n '1,120p' reports/proof-ledger.json
```

## 6 — Enable GitHub Pages workflow
```bash
set +e; test -f .github/workflows/pages.yml && echo 'Pages workflow present' || echo 'Missing pages workflow'; git status --short
```

## 7 — First commit
```bash
set +e; git add README.md package.json .gitignore public docs scripts reports .github; git commit -m 'Install EONS compliance platform starter' || echo 'Nothing to commit'
```

## 8 — Push permanent staging
```bash
set +e; git branch --show-current; git push origin main
```

## 9 — Verify workflow status
```bash
set +e; gh run list --workflow='Deploy GitHub Pages' --limit 3 || echo 'Open Actions tab if gh is not authorized'
```

## 10 — Print Pages URL
```bash
set +e; OWNER=$(gh repo view --json owner -q .owner.login 2>/dev/null); REPO=$(gh repo view --json name -q .name 2>/dev/null); test -n "$OWNER" && test -n "$REPO" && echo "https://$OWNER.github.io/$REPO/" || echo 'Use GitHub Pages settings to copy the Pages URL'
```

## 11 — Domain later placeholder
```bash
set +e; test -f docs/CNAME.template && cat docs/CNAME.template; echo 'When domain is ready, create docs/CNAME with the domain only.'
```

## 12 — Operating loop
```bash
set +e; npm run build; npm run verify; npm run proof; git add public docs scripts reports README.md package.json .github .gitignore; git commit -m 'Refresh platform proof and Pages build' || echo 'No changes'; git push origin main
```
