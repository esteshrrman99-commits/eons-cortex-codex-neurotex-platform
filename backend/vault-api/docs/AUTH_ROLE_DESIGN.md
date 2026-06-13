# EONS Auth / Role Design

Status: scaffold only / disabled by default.

Roles:
- owner
- admin
- reviewer
- viewer

Current behavior:
- EONS_AUTH_ENABLED=false
- no real login
- no production route protection
- mock session response only

Future production requirements:
- secure owner login
- role-based access control
- session expiration
- logout
- MFA option
- reviewer access limits
- audit log for login/read/export/review events
- route protection on all sensitive backend routes
- security review before sensitive use
