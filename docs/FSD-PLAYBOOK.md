# FSD playbook

How to add product work on this frontend without breaking the layer graph. Read this before a large feature.

## Layers

```
app → widgets → features → entities → shared
processes → shared
```

| Layer | Put here | Public API |
|-------|----------|------------|
| `app/` | Routes, layouts, route handlers | n/a |
| `widgets/` | Composed screens (calendar, login, landing shell) | `src/widgets/<slice>/index.ts` |
| `features/` | User actions (tables, sheets, wizards) | `src/features/<slice>/index.ts` |
| `entities/` | Models, API clients, entity UI, session | `src/entities/<slice>/index.ts` |
| `shared/` | UI kit, config, i18n, utilities | any file (not sliced) |
| `processes/` | Proxy / request guards | any file |

ESLint (`eslint-plugin-boundaries`) fails inverted imports and deep slice paths.

## Rules for new code

1. **New slice** = folder + `index.ts` that re-exports only what other layers need.
2. **App may import widgets and features** through those `index.ts` files.
3. **Features never import widgets or other features.** Shared chrome goes to `shared/ui`. Shared domain UI goes to `entities/<name>`.
4. **Shared never imports entities.** Marketing page helpers that need tenant types live in `entities/tenant`.
5. **Session** (`useAuthStore`, `useAuthPermissions`) comes from `entities/session`. Do not re-export it from `features/auth`. The session hook must import its store relatively to avoid circular barrels.
6. **Keep application files under 300 lines.** Extract a hook, a keyed inner form, or a section component. Do not split shadcn primitives (`shared/ui/sidebar.tsx`, `shared/ui/chart.tsx`).
7. **Do not reset form state in `useEffect`.** Render a child with `key={entity.id}` and `useForm({ defaultValues })` / `useState(initial)`.
8. **Do not call `Date.now()` during render.** Snapshot with `useState(() => Date.now())`.
9. **URL-driven sheets** derive open state from `searchParams`; clear the query in the close handler, not in an effect.

## Where upcoming product work should land

Large features will keep coming. Place them before writing UI:

| Kind of work | Default home |
|--------------|----------------|
| New CRUD resource | `entities/<name>` (types, api, columns) + `features/<name>` (table, sheet) + `app/.../page.tsx` |
| Admin composed screen (filters + table + side panel) | `widgets/<name>` importing the feature |
| Booking / wallet / schedule math | `entities/<domain>/lib` |
| Reusable admin chrome (sheet, table actions) | `shared/ui` |
| Auth identity | `entities/session` only |

Do not dump new screens into `widgets` if they are a single user action. Do not put tenant-specific copy into `shared`.

## Parked polish (not blocking 10/10 FSD)

These are left for later on purpose:

- **shadcn kit size:** `src/shared/ui/sidebar.tsx` and `src/shared/ui/chart.tsx` stay generated primitives.
- **English staff/loyalty copy** still mixed into some admin forms; move to `next-intl` when those screens are redesigned.
- **Coverage** is above the 70% function threshold; raise it when adding the next domain, not as a separate rewrite.
- **Deep `app/` pages** that compose two features are valid FSD. If a page grows past a layout, promote the composition to a widget.

## Checklist before merge

- [ ] New slice has `index.ts`
- [ ] No feature → feature or feature → widget imports
- [ ] Cross-slice imports use `@/entities/<slice>` (or widgets/features), never a deep file path
- [ ] `npm run typecheck` and `npm test` pass
- [ ] `npx eslint src --quiet` has no `boundaries/*` or React Compiler errors
