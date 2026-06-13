# EONS Backend Security Gate Summary

Current allowed mode:
- local mock only
- browser-local drafts
- metadata-only mock upload
- no sensitive production uploads

Blocked:
- real authentication
- real encryption
- real permanent database
- real OCR/parser
- real backup/restore
- external submission
- final professional approval

Required before production:
1. Secret manager
2. Auth provider
3. Encrypted object storage
4. Private database
5. Access controls
6. Audit logging
7. Backups
8. Restore test
9. Security review
10. CPA/EA/tax-attorney workflow review
