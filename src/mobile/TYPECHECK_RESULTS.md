Typecheck results (src/mobile)

Summary:

- Ran `npm run typecheck` in `src/mobile` (tsc --noEmit).
- TypeScript returned 17 errors across 12 files; command exited non-zero.

Key issues found:

1. Missing runtime/dependency types:
   - `Cannot find module 'react'` (install `react` types or ensure `react` is resolvable to shared workspace dependency).
   - Missing `react-native-vision-camera` (POC lazy-import shows it isn't installed yet).
   - Missing utility packages: `clsx`, `tailwind-merge`, `class-variance-authority` used by UI components.

2. Path alias resolution problems:
   - Many imports use `@/...` aliases (e.g., `@/components/ui/button`, `@/lib/utils`, `@/app/client/parking/parking-map`). Ensure `tsconfig.json` has matching `paths` mapping or adjust imports to relative paths.

3. Cross-package imports:
   - TypeScript picked up references to `../frontend/...` files (e.g., `../frontend/src/lib/use-realtime-spots.ts`). Determine whether `src/mobile` should reference code in `src/frontend` or keep mobile self-contained. If cross-package imports are intentional, configure monorepo path mappings or move shared code to a common package.

Recommended next steps:

- Install missing libs in `src/mobile` as needed (e.g., `npm install clsx tailwind-merge class-variance-authority`), or remove/replace with RN-friendly alternatives.
- Add `react` and `@types/react` as dependencies/devDependencies in `src/mobile` if mobile package intends to be independent; otherwise configure TypeScript `paths` to reference workspace `react` and shared types.
- Add `baseUrl` and `paths` to `tsconfig.json` to resolve `@/` aliases, or change imports to relative paths.
- Install `react-native-vision-camera` only after planning native setup; for initial typecheck you can stub types or keep lazy import (but type errors will show for missing module until installed).

If you want, I can:

- Auto-install the missing JS/TS packages into `src/mobile` (I can do that), and re-run `npm run typecheck` until no errors remain, or
- Add `paths` mapping in `tsconfig.json` to resolve `@/` to appropriate folders and re-run typecheck, or
- Convert a small set of imports to relative paths as a minimal fix.

Which option do you want next? (I can proceed to install packages and re-run typecheck.)
