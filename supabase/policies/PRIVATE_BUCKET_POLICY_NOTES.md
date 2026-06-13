# Supabase Private Bucket Policy Notes

Bucket name: eons-evidence-vault

Required settings:
- private bucket only
- no public file listing
- no public object URLs for sensitive evidence
- uploads only through authenticated backend route
- service role key only in backend runtime secrets
- storage path should include owner/matter/record IDs
- every upload must create an audit_events row
- every read/export must create an audit_events row
- backup/export plan must be tested before production

Do not put sensitive files in GitHub Pages, public/, docs/, reports/, screenshots, or chat.
