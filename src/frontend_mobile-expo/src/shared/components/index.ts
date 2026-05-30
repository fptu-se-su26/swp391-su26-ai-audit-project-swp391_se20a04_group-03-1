/**
 * @module shared/components
 *
 * Public API for all shared UI components.
 * Import from here for clean, consistent imports:
 *
 * ```ts
 * import { Button, Card, Input, ScreenShell, QRScanner } from '@/shared/components';
 * ```
 */

// ─── Primitives ──────────────────────────────────────────────────────────────
export { Button } from './Button';
export { Card, CardHeader, CardContent, CardFooter } from './Card';
export { Input } from './Input';
export { Label } from './Label';

// ─── Layout ──────────────────────────────────────────────────────────────────
export { ScreenShell } from './layout';

// ─── Feedback ────────────────────────────────────────────────────────────────
export { Snackbar, QueryStateHandler, LoadingSkeleton, ErrorState } from './feedback';

// ─── Media ───────────────────────────────────────────────────────────────────
export { VideoStream, QRScanner } from './media';
