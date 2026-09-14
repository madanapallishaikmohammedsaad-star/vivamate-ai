# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security vulnerabilities.

Report suspected vulnerabilities privately to the repository owner through GitHub’s private contact options. Include:

- A clear description of the issue
- Steps to reproduce
- Potential impact
- Any suggested mitigation

Do not include API keys, passwords, tokens, or other secrets in reports.

## Security expectations

- Keep `OPENROUTER_API_KEY` server-side.
- Never commit `.env` files or credentials.
- Use HTTPS for deployed environments.
- Rotate credentials immediately if they are accidentally exposed.
