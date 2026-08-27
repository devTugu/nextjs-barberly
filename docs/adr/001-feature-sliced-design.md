# ADR 001: Feature-Sliced Design

## Status

Accepted

## Context

The product spans marketing, tenant admin, platform admin, and customer booking. Folder structure must encode dependencies so features cannot reach into composed widgets or other features.

## Decision

Adopt strict FSD layers:

```
app → widgets → features → entities → shared
processes → shared
```

| Layer | Responsibility | Public API |
|-------|----------------|------------|
| `app/` | Next.js routes and layouts | n/a |
| `widgets/` | Composed blocks (shells, login screen, calendar) | `src/widgets/<slice>/index.ts` |
| `features/` | User interactions (tables, forms, wizards) | `src/features/<slice>/index.ts` |
| `entities/` | Business models, API clients, entity UI | `src/entities/<slice>/index.ts` |
| `shared/` | UI kit, config, i18n, utilities | any file (segmented, not sliced) |
| `processes/` | Proxy / app-wide request guards | any file |

Import rules (enforced by `eslint-plugin-boundaries`):

- Upper layers import lower layers only.
- Features **cannot** import widgets or other features.
- Shared **cannot** import entities, features, or widgets.
- Cross-slice imports on features/entities/widgets go through `index.ts` only. Deep paths such as `@/entities/user/ui/user-columns` are lint errors because allow rules require `internalPath: index.ts`.

Session identity (`useAuthStore`, `useAuthPermissions`) lives in `entities/session` so every feature can read auth state without importing `features/auth`.

Generic admin chrome (`DataTable`, `AdminFormSheet`, `AdminTableActions`) lives in `shared/ui`.

## Consequences

**Positive:** Slice placement is predictable; ESLint fails inverted dependencies.

**Negative:** New UI that multiple features need must be pushed down to `shared` or `entities`, not parked in `widgets`.

## Related

- [Architecture](../ARCHITECTURE.md)
