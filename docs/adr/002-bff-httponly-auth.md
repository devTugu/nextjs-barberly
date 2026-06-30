# ADR 002: BFF httpOnly authentication

## Status

Accepted

## Context

Storing JWTs in `localStorage` exposes tokens to XSS. Regulated customers require secure session handling.

## Decision

1. Next.js BFF route handlers (`/api/auth/*`) proxy auth to Nest API
2. Access and refresh tokens stored in **httpOnly** cookies
3. Admin mutations go through `/api/backend/*` with allowlist
4. CSRF token required for state-changing requests
5. Client-side refresh scheduler calls `/api/auth/refresh` before expiry

Browser never sees raw JWT strings.

## Consequences

**Positive:** XSS cannot exfiltrate access tokens; aligns with SOC2 session controls.

**Negative:** Requires same-site cookie configuration; cross-domain deploy needs careful CORS + cookie setup.

## Related

- [Security](../SECURITY.md)
- Backend [ADR 003](https://github.com/devTugu/nestjs-fsd-portfolio-template/blob/main/docs/adr/003-security-identity.md)
