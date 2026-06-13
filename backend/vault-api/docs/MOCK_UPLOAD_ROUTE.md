# Mock Upload Route

Endpoint: POST /upload-mock

Purpose: create metadata-only mock evidence records.

This does not store real files. Production uploads remain blocked.

Example payload:
{
  "filename":"receipt.pdf",
  "filetype":"application/pdf",
  "size_bytes":12345,
  "owner_note":"draft test only"
}
