# Security Policy

CTX Aide is currently a private, unpublished public-release candidate. It has no public package release, no public GitHub remote in this checkout, and no external support SLA.

## Supported Versions

There are no supported public releases yet. Security review should target the current repository state and any future public release candidate identified by a maintainer.

## Reporting a Vulnerability

Do not post exploit details, secrets, private URLs, session cookies, or access tokens in a public issue.

When a public GitHub remote exists and private vulnerability reporting is enabled, use GitHub Security Advisories or GitHub private vulnerability reporting for security reports.

Until that channel exists, coordinate through the repository owner or maintainer using the existing private project channel. If you only have access to public issues, open a minimal issue that says a private security report channel is needed, without including exploit details.

## Handling Expectations

- The maintainer will triage reports according to project risk and release status.
- No response-time or remediation SLA is promised.
- Fixes should be represented as scoped markdown tickets before implementation unless an urgent private patch path is explicitly approved.
- Security fixes must preserve the no-secrets, no-paid-infrastructure, and no-unapproved-publication gates.

## Current Security Gates

Before public launch or package publication, rerun the repository safety scans and validation gates documented in:

- `docs/context/architecture/public-release-safety-audit-2026-07-05.md`
- `docs/context/architecture/publication-readiness-2026-07-07.md`
- `.github/workflows/ci.yml`
