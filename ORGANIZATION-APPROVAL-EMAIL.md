# Organization approval email endpoint

The static project records organization approval and routes the approved organization to subscription selection. To deliver the approval email, configure the server base URL in `window.WUSOOL_API_BASE_URL` and implement this server-side endpoint:

- `POST /api/notifications/organization-approved`
- JSON body: `{ "email": "owner@example.com", "organizationName": "Example Org", "loginUrl": "https://your-site/org/html/organization-login.html" }`
- Return a 2xx response only after the email provider accepts the message.

The endpoint must send the message from the ASP.NET server using its configured email provider (SMTP or another mail service). Never put SMTP credentials or private email API keys in browser files. This archive does not include a mail server or provider configuration, so approval is saved even while email delivery is unavailable; the admin screen reports that condition instead of pretending an email was sent.
For status checks across devices, the client can also call GET /api/organizations/registration-status?email=owner@example.com and expects JSON containing pprovalStatus (for example pproved, pending, or ejected). Without this endpoint, Check Status reads the same-origin browser registry.
