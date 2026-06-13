# EONS OCR / Parser Design

Status: scaffold only / disabled by default.

Supported future file types:
- PDF
- screenshots/images: PNG, JPG, JPEG, WEBP
- DOC/DOCX
- XLS/XLSX
- CSV
- JSON
- TXT

Current behavior:
- EONS_OCR_ENABLED=false
- no real OCR
- no document parsing
- no spreadsheet parsing
- no extracted text storage

Future production requirements:
- file-type validation
- virus/malware scanning
- OCR engine
- PDF parser
- DOC/DOCX parser
- XLS/XLSX parser
- CSV/JSON/TXT parser
- confidence score
- owner verification queue
- professional review queue
- audit log for parse/read/export
- security review before sensitive documents

Boundary:
Parsed text is never final proof by itself. Owner verification and professional review remain required.
