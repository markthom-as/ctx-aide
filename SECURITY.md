# Security Policy

CTX Aide is a public-source alpha. It has no public npm or Cargo package and no external support SLA.

## Supported Versions

There is no stable supported release line yet. Security review should target the current `main` branch or an alpha revision identified by a maintainer.

## Reporting a Vulnerability

Do not post exploit details, secrets, private URLs, session cookies, or access tokens in a public issue.

Use [GitHub private vulnerability reporting](https://github.com/opertus-systems/ctx-aide/security/advisories/new) for security reports. The channel is enabled on the public repository.

## Handling Expectations

- The maintainer will triage reports according to project risk and release status.
- No response-time or remediation SLA is promised.
- Fixes should be represented as scoped markdown tickets before implementation unless an urgent private patch path is explicitly approved.
- Security fixes must preserve the no-secrets, no-paid-infrastructure, and no-unapproved-publication gates.

## Current Security Gates

Before a future registry publication or tagged release, rerun the repository safety scans and validation gates documented in:

- `docs/context/architecture/public-release-safety-audit-2026-07-05.md`
- `docs/context/architecture/publication-readiness-2026-07-07.md`
- `.github/workflows/ci.yml`
