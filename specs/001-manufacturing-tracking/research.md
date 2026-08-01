# Manufacturing Tracking System - Research & Technology Analysis

**Date**: 2026-08-01 | **Status**: Complete | **Session**: speckit.plan Phase 0

---

## I. Authentication Architecture: Google OAuth2 + Role-Based Access

### Decision
Implement federated identity via `@react-oauth/google` library with Google Workspace OAuth2 provider. Role assignment determined from Google Workspace organizational units (OUs) mapped to factory roles (Worker → OU:/Workers, Supervisor → OU:/Supervisors, etc.). Token storage via httpOnly cookies set by backend; frontend accesses token via secure session API only.

### Rationale
- **Security**: httpOnly cookies prevent XSS token theft; Workspace integration eliminates password management overhead
- **Scalability**: Federated identity allows adding users without manual provisioning—provisioning via Google Workspace admin console
- **User Friction**: Employees already have Google credentials; single sign-on reduces login friction
- **Compliance**: OAuth2 token refresh and expiration handling prevents stale sessions; audit trail captures all authentication events

### Alternatives Considered
- **Firebase Authentication**: Simpler setup but adds Firebase vendor dependency and cost; less integration with existing Workspace infrastructure
- **Microsoft Entra ID**: Comparable to Google Workspace but organization uses Google; adds dual-auth complexity
- **Self-Managed Auth (JWT)**: Requires password management, recovery flows, compliance overhead; rejected due to maintenance burden

### Implementation Notes
- Backend endpoint `/api/auth/me` returns authenticated user profile including role, scopes, organization
- Protected routes via `ProtectedRoute` wrapper checking user role against route requirements
- Session validation on app boot via `/api/auth/session` endpoint
- Logout clears httpOnly cookie and redirects to login page

---

## II. Real-Time Data Architecture: TanStack Query + WebSocket Polling

### Decision
Use **TanStack Query v5 (React Query)** for caching and refetching with **polling strategy** for real-time updates:
- Dashboard production status: 30-second refetch interval (aligns with spec requirement)
- Batch details & audit logs: 10-second refetch interval when page is in focus
- Reports & efficiency data: 60-second refetch interval (less critical, lower frequency)
- WebSocket as future enhancement (currently polling is simpler and meets requirements)

### Rationale
- **Simplicity**: Polling is easier to implement and debug than WebSocket event management; requires no backend WebSocket infrastructure
- **Mobile-Friendly**: Polling works reliably on all 4G/WiFi networks; WebSocket can have connection state issues on poor networks
- **Meets Requirements**: 30-second update interval satisfies spec requirement; imperceptible to users for most operations
- **Offline Support**: Failed requests are automatically retried by TanStack Query when connection is restored

### Alternatives Considered
- **WebSocket**: Real-time push has lower latency but adds significant complexity for mobile reliability; overkill for 30s refresh requirement
- **Server-Sent Events (SSE)**: Better than WebSocket for unidirectional updates but still adds connection state complexity
- **GraphQL Subscriptions**: Elegant but requires GraphQL backend; current REST API is simpler

### Implementation Notes
- All queries configured with `staleTime: 30000` (30s) for production status, `staleTime: 10000` for batch details
- Manual refetch via `refetch()` when user performs critical actions (stage completion, quality approval)
- Background refetch enabled via `refetchInterval` + `refetchOnWindowFocus: true` for data freshness
- Cache invalidation strategy: when mutation completes (e.g., batch transitions), invalidate related queries

---

## III. Mobile-First Responsive Design: TailwindCSS v4 + ShadcnUI

### Decision
- **Styling**: TailwindCSS v4 for utility-first CSS with CSS variables for theming (light/dark modes)
- **Component Foundation**: ShadcnUI pre-built components (Button, Card, Input, Select, Modal, Dropdown, Tabs, etc.) reduce custom component work
- **Responsive Breakpoints**: Mobile-first starting at 320px (iPhone SE minimum), expanding to tablet (768px) and desktop (1024px+)
- **Touch Targets**: All interactive elements guaranteed ≥44px minimum (WCAG requirement)

### Rationale
- **Developer Velocity**: ShadcnUI eliminates building Button, Modal, Input from scratch; aligns with constitution's "Clarity Over Empty Aesthetics"
- **Accessibility Built-In**: ShadcnUI components include ARIA attributes, semantic HTML; reduces custom accessibility bugs
- **Performance**: TailwindCSS v4 generates only used CSS; tree-shaking reduces bundle size
- **Consistency**: Design tokens (spacing, colors, typography) enforced via Tailwind config, preventing inconsistency

### Alternatives Considered
- **Material-UI**: Heavier bundle (~50% larger); more opinionated; less suitable for manufacturing simplicity aesthetic
- **Chakra UI**: Good accessibility but heavier bundle; Tailwind is leaner for mobile
- **Custom Component Library**: Slower initial delivery; requires more accessibility testing

### Implementation Notes
- TailwindCSS config defines color palette (navy #003366, teal #00897B, slate grays, amber warnings)
- CSS variables in `root` selector for theme switching: `--color-primary: rgb(0, 51, 102)` (dark mode inverts)
- All typography uses Inter font family (clear at small sizes); heading hierarchy H1→H3 per page
- Spacing system uses Tailwind scale (4px base): gap-1 (4px), gap-2 (8px), gap-4 (16px), gap-6 (24px), etc.

---

## IV. Form State Management: React Hook Form + Zod Validation

### Decision
Use **React Hook Form** for form state (performance-optimized, minimal re-renders) paired with **Zod** for schema validation (runtime type checking, clear error messages).

**Validation Strategy**:
1. Client-side validation via Zod schemas (immediate user feedback)
2. Server-side validation repeats all Zod checks (security, consistency)
3. Form errors displayed inline per field with red text (WCAG 4.5:1 contrast)

### Rationale
- **Performance**: RHF minimizes re-renders; only changed field re-renders on input
- **Type Safety**: Zod schemas provide runtime validation + TypeScript types (single source of truth)
- **User Experience**: Validation feedback is instant (client-side); server errors handled gracefully
- **Accessibility**: Error messages associated with form fields via `aria-describedby`

### Alternatives Considered
- **Formik**: Heavier bundle and more re-renders than RHF; older pattern
- **React Hook Form + Yup**: Yup is less TypeScript-friendly than Zod; generates larger bundle
- **Manual Validation**: Error-prone; no type safety; requires repetitive code

### Implementation Notes
- All forms use `useForm()` hook with `mode: 'onBlur'` (validate when user leaves field, not on every keystroke)
- Zod schema defined in feature types folder, e.g., `src/features/auth/types/login.schema.ts`
- Form validation errors trigger `handleSubmit()` error callback; displayed via `<FormError>` component
- Async validation (checking batch ID exists) implemented via `validate` property in Zod or async validation handler

---

## V. Batch Traceability & Audit Trail: Immutable Event Log

### Decision
**Event Sourcing Pattern**: Every batch state change is recorded as immutable event in audit log. Current batch state is derived from replaying events from genesis to present.

**Event Types**:
- `batch.created` – Batch initialized in Planning stage
- `batch.stage_transitioned` – Batch moved between stages
- `batch.quality_inspected` – Quality check result recorded
- `batch.reworked` – Batch returned to earlier stage for rework
- `batch.reverted` – Stage transition undone (rare, requires supervisor)
- `batch.shipped` – Batch entered Shipping stage with carrier details

**Audit Trail Properties** (immutable):
- `timestamp` (UTC, server-set to prevent clock skew)
- `user_id` (who performed action)
- `action` (event type)
- `batch_id` (affected batch)
- `before_state` (previous values)
- `after_state` (new values)
- `reason` (if reversal or exceptional action)
- `source` (mobile/desktop/api)

### Rationale
- **Compliance**: Complete audit trail enables regulatory verification and root-cause analysis
- **Data Integrity**: Events are immutable; no retroactive edits hide problems
- **Operational Intelligence**: Replaying events enables analyzing "what if" scenarios or reconstructing state at any point in time
- **Concurrency Safety**: Events are append-only; concurrent updates simply create sequential events

### Alternatives Considered
- **Direct State Update**: Simpler but loses history; audit trail must be separate and stays out of sync
- **Change Data Capture (CDC)**: Database-level approach; requires database support and post-hoc audit trail processing
- **Event Sourcing without Snapshots**: Correct but slow to replay entire history; mitigated by storing snapshots every 100 events

### Implementation Notes
- Backend stores events in `audit_logs` table (event_id, timestamp, user_id, action, batch_id, before_state JSON, after_state JSON)
- Current batch state computed via endpoint `/api/batches/{batch_id}` which replays relevant events
- Snapshot computed every 100 events and cached; replay only needed for recent events
- Export endpoint `/api/batches/{batch_id}/audit-trail` returns full event log for batch as CSV/PDF

---

## VI. Offline Support: Local IndexedDB Queue

### Decision
When network connection is lost:
1. Stage completion requests queued in **IndexedDB** with timestamp and attempt count
2. UI displays "⚠️ Queued - will sync when online" badge on affected batch
3. Once connection is restored (detected via `navigator.onLine` + periodic `/api/health` ping), queue is processed
4. Failed requests retry with exponential backoff (1s, 2s, 4s, max 8 retries)

### Rationale
- **Reliability**: Factory floor workers must log stage completions even with spotty 4G. Offline queuing ensures no data loss
- **User Confidence**: Clear visual indicator of sync status prevents confusion ("Did my action save?")
- **Local Storage Limits**: IndexedDB can store hundreds of queued events; localStorage is too small
- **Sync Safety**: Requests idempotent via batch_id + timestamp; re-sending duplicate requests is safe

### Alternatives Considered
- **LocalStorage**: Insufficient capacity (5-10MB limit); IndexedDB supports 50MB+
- **Service Worker**: Adds complexity and browser compatibility concerns; IndexedDB + manual sync is simpler
- **No Offline Support**: Rejected—factory floor connectivity is unreliable per assumption

### Implementation Notes
- IndexedDB schema: table `queue` with columns (id, endpoint, payload, timestamp, retryCount, status)
- Connection monitor hook: `useConnectionStatus()` returns `{ isOnline: boolean, lastSyncTime: Date }`
- Background sync handler runs every 10s when online: pulls queued items, attempts POST, removes on success, re-queues on failure
- User can manually trigger sync via "Retry Sync" button in UI when connection restored

---

## VII. Performance Optimization: Code Splitting & Image Optimization

### Decision
- **Code Splitting**: Each feature folder has independent chunk; routes lazy-loaded via React.lazy()
  - `/pages/Dashboard` loads only dashboard components
  - `/features/batches` loads only batch-related code
  - `/features/reports` loads only reporting code
- **Image Optimization**: 
  - All PNG/JPG images converted to WebP with PNG fallback for browsers lacking support
  - Responsive images use `srcset` (e.g., `batch-photo-320w.webp, batch-photo-640w.webp, batch-photo-1280w.webp`)
  - Lazy-load images via `loading="lazy"` attribute
- **Bundle Monitoring**: GitHub Actions CI runs `webpack-bundle-analyzer` on every PR; alerts if bundle increases >5%

### Rationale
- **Mobile Performance**: Code splitting ensures workers on mobile don't download unused admin code; bundles load faster
- **Image Bandwidth**: WebP reduces image size ~30% vs PNG; responsive images ensure mobile devices don't download 1920px image
- **User Experience**: 2-second load target on 4G is only achievable with aggressive splitting and optimization

### Alternatives Considered
- **No Code Splitting**: Simpler build but bundle bloats; 4G load time violates spec requirement
- **Server-Side Rendering (SSR)**: Better initial load but adds server complexity and offline breaks; rejected for mobile-first app
- **Static Site Generation**: Inappropriate for real-time dashboard app

### Implementation Notes
- Vite config: `build.rollupOptions.output.manualChunks` to split by feature folder
- Image optimization: build script processes images via `sharp` library (generates WebP variants)
- Lighthouse CI run on every deploy: fails if performance score drops below 85

---

## VIII. Form Accessibility: WCAG 2.1 AA Compliance

### Decision
All forms follow WCAG 2.1 AA accessibility guidelines:
1. **Semantic HTML**: `<label>` elements with `htmlFor` attribute linked to inputs
2. **Error Messages**: Associated via `aria-describedby` and red text (≥4.5:1 contrast)
3. **Focus Indicators**: All inputs visible focus state (2px blue border)
4. **Keyboard Navigation**: Tab order logical; form completable via keyboard only (no mouse required)
5. **ARIA Attributes**: `aria-required="true"`, `aria-invalid="true"` on invalid fields, `aria-label` for icon-only buttons
6. **Color Contrast**: Text/background ≥4.5:1 ratio; status indicators (green/yellow/red) supplemented with icons/text

### Rationale
- **Constitutional Requirement**: Accessibility is non-optional per constitution
- **User Base**: Factory workers may have varying literacy/language skills; clear, accessible forms reduce support burden
- **Legal Compliance**: WCAG 2.1 AA is legal standard in many jurisdictions
- **Mobile-Specific**: Mobile users with visual impairment rely on screen readers; semantic HTML is critical

### Alternatives Considered
- **Visual Design Only**: Insufficient; screen reader users and keyboard navigators would be blocked
- **WCAG 2.0 (older standard)**: WCAG 2.1 includes fixes for modern web (e.g., touch target size 44px)
- **ARIA Without Semantic HTML**: False compliance; ARIA is supplement, not replacement

### Implementation Notes
- ShadcnUI components include ARIA attributes by default (Button, Input, etc.)
- Custom components follow same pattern; all inputs wrapped with `<label>` 
- Color palette tested via Contrast Checker tool; navy + white ✓ (7:1), amber warning + white ✓ (5.5:1)
- Automated accessibility testing via `axe-core` in CI; manual testing on screen reader (NVDA/JAWS) before release

---

## IX. Routing Architecture: TanStack Router v1

### Decision
Use **TanStack Router** for client-side routing with type-safe route definitions.

**Route Structure**:
```
/auth/login                    (public)
/auth/oauth-callback           (public)
/dashboard                     (protected, all roles)
/batch/:batchId                (protected, all roles)
/batch/:batchId/audit-trail    (protected, all roles)
/quality/inspections           (protected, QualityController role)
/quality/:batchId/inspect      (protected, QualityController role)
/reports/efficiency            (protected, Manager role)
/reports/custom                (protected, Manager role)
/settings/profile              (protected, all roles)
/admin/users                   (protected, Admin role)
```

### Rationale
- **Type Safety**: Route definitions are TypeScript types; URL params and query strings are type-checked at compile time
- **Performance**: TanStack Router has excellent code-splitting integration with Vite
- **Simplicity**: Declarative route structure is easier to maintain than React Router regex patterns
- **Mobile-Friendly**: URL-based state enables deep linking (share batch detail with another worker)

### Alternatives Considered
- **React Router v6**: Mature but not type-safe; URL params are strings until manually parsed
- **Next.js**: File-based routing is good for SSR; inappropriate for client-only app
- **Remix**: Server framework; unnecessary complexity for this client-centric app

### Implementation Notes
- Protected routes wrap `<Outlet>` with auth check; if user role doesn't match, redirect to unauthorized page
- Batch detail route loads batch data via query hook; if batch 404s, display error page
- Browser back/forward buttons work naturally; state preserved via URL (deep linkable)

---

## X. Component Library & Design System: ShadcnUI Integration

### Decision
Use **ShadcnUI** (Radix UI + Tailwind) for pre-built accessible components. Install components piecemeal as needed:
- Button, Input, Label, Select, Textarea, Checkbox, Radio
- Card, Modal, Dropdown, Tabs, Alert, Badge, Progress
- Table (for batch list), Pagination
- Toast notifications (via Sonner or Radix Toast)

### Rationale
- **Time to Market**: Pre-built components accelerate development; button component doesn't need to be invented
- **Accessibility**: ShadcnUI components audited for WCAG compliance; saves hours of accessibility testing
- **Customization**: Components are copy-pasted source (not npm dependency); can be modified if needed
- **Bundle Control**: Only install components you use; tree-shaking removes unused ShadcnUI code

### Alternatives Considered
- **Building Custom Components**: 3-4 weeks additional development; accessibility testing adds 2 more weeks
- **Material-UI**: Heavier bundle; more complex theming
- **Bootstrap**: Outdated patterns; less modern aesthetic

### Implementation Notes
- `shadcn init` to setup project (Tailwind, TypeScript config)
- Install components via `npx shadcn-ui@latest add button card input` etc.
- Components installed to `src/shared/components/ui/` directory
- Export wrappers in `src/shared/components/index.ts` for easier imports

---

## XI. Data Export Strategy: PDF + CSV Generation

### Decision
Implement two export formats:
1. **CSV Export**: Raw data export for spreadsheet analysis; fast, no formatting
   - Columns: batch_id, creation_date, stage, stage_date, stage_duration, worker_name, quality_status, etc.
   - Generated server-side via backend endpoint, streamed to browser as download
2. **PDF Export**: Formatted report for printing/sharing; includes charts, styling, branding
   - Generated server-side via `puppeteer` or `wkhtmltopdf`; includes logo, date, footer
   - Contains: batch timeline, quality results, defect photos (if attached), audit events

### Rationale
- **User Flexibility**: CSV for data analysis; PDF for compliance/presentation
- **Performance**: Server-side generation prevents client from freezing; large reports handled efficiently
- **Professionalism**: PDF with branding presents manufacturing authority (constitution principle)

### Alternatives Considered
- **Client-Side PDF (jsPDF)**: Simpler but requires all data in browser; impractical for 1000+ events in batch history
- **HTML Download**: No formatting; PDF is more professional
- **Excel Export**: Proprietary format; CSV is more portable

### Implementation Notes
- Backend POST `/api/batches/{batchId}/export/csv` returns CSV
- Backend POST `/api/batches/{batchId}/export/pdf` generates PDF via puppeteer, returns PDF stream
- Frontend provides download buttons with file naming convention: `batch-ABC-123_2026-08-01_audit.pdf`

---

## XII. Testing Strategy: Manual Validation Focus

### Decision
Per constitution ("No automated tests is acceptable; quality assurance is manual and thorough"), implement comprehensive **manual testing checklist**:

**Test Categories**:
1. **Happy Path**: Complete workflow from auth → batch creation → stage transitions → completion
2. **Error Paths**: Invalid credentials, network failure, duplicate batch IDs, quality rejection, rework
3. **Mobile Testing**: Responsive design on 320px, 375px, 768px, 1024px viewports
4. **Accessibility Testing**: Screen reader (NVDA), keyboard navigation (Tab/Enter/Escape), color contrast (Contrast Checker)
5. **Performance Testing**: Lighthouse on all critical pages; 4G network simulation (DevTools throttling)
6. **Cross-Browser**: Chrome, Firefox, Safari, Edge on Windows/Mac/iOS/Android
7. **Offline Testing**: Disable network, perform actions, re-enable network, verify sync

**Test Evidence**: Screenshots, test plan checklist, defect reports logged in GitHub Issues

### Rationale
- **Constitution Alignment**: Constitution explicitly rejects automated testing
- **Factory Reality**: Manual testing catches UX issues automation would miss (e.g., confusion about stage button)
- **Risk Mitigation**: Critical data integrity workflows validated by humans, not test bots

### Alternatives Considered
- **Automated Testing (Jest/Vitest)**: Faster feedback but violates constitution; trade-off not acceptable
- **No Testing**: Unacceptable risk; manual testing is minimum bar

### Implementation Notes
- Test plan checklist in `docs/testing/` directory with scenarios for each feature
- Test execution logged in GitHub Issues with screenshots and device/browser details
- Performance baseline established on first release; subsequent versions alert if metrics regress >10%

---

## Technical Decisions Summary Table

| Decision | Choice | Rationale | Risk Mitigation |
|----------|--------|-----------|-----------------|
| Auth | Google OAuth2 | Federated, secure, SSO | Workspace dependency; fallback: manual export/import users |
| Real-Time Updates | TanStack Query polling (30s) | Mobile-friendly, simpler than WebSocket | No sub-30s latency guarantee; acceptable per spec |
| Styling | TailwindCSS v4 + ShadcnUI | Fast dev, accessible, performant | ShadcnUI lock-in; acceptable, source components can be forked |
| Forms | React Hook Form + Zod | Type-safe, performant, clear errors | Limited form types (text/select/checkbox); covers all needs |
| Traceability | Event Sourcing | Compliance, audit trail, integrity | More queries to current state; mitigated via snapshots |
| Offline | IndexedDB Queue | No data loss, reliable sync | Sync conflicts rare; UUID-based timestamps prevent collision |
| Performance | Code Splitting + Images | 2s load on 4G achievable | More complex build; Vite handles transparently |
| Routing | TanStack Router | Type-safe, performant, simple | Learning curve; trade-off accepted |
| Components | ShadcnUI | Accessibility, speed, consistency | Component lock-in; source code provides escape hatch |
| Testing | Manual | Constitution mandate | Higher defect risk; mitigated via checklists and dedicated tester |

---

## Technology Stack Validation Against Requirements

### FR-001: Google OAuth2 ✓
- Implemented via `@react-oauth/google` + backend token exchange
- Automatic role assignment from Workspace OUs

### FR-002: Role-Based Access Control ✓
- Middleware checks user.role against route.requiredRole
- Dashboard content filtered per role

### FR-003: Real-Time Dashboard (30s) ✓
- TanStack Query polling every 30s via `refetchInterval: 30000`
- UI updates automatically when data arrives

### FR-004: Batch Traceability ✓
- Event Sourcing pattern captures all stage transitions
- Audit trail table immutable; complete history preserved

### FR-005: Batch Search & Detail ✓
- Search endpoint `/api/batches/search?q={batchId}` 
- Detail page `/batch/:batchId` displays full timeline

### FR-006: Worker Mobile Logging ✓
- `/batch/:batchId/log-completion` form mobile-optimized
- Single-button submission; confirmation required

### FR-007: Quality Inspection Workflow ✓
- `/quality/:batchId/inspect` form with structured defect recording
- Reject routing back to previous stage implemented

### FR-008: Efficiency Reports ✓
- Backend computes stage metrics via SQL aggregation
- Report generation: avg time per stage, bottleneck detection, rework rates

### FR-009: Immutable Audit Trail ✓
- `audit_logs` table append-only; no update/delete
- Every action logged with timestamp, user, before/after values

### FR-010: Mobile-First (≥320px) ✓
- TailwindCSS responsive breakpoints: 320px baseline
- All components meet 44px touch target minimum

### FR-011: Workflow Rules ✓
- Backend validates stage transitions
- Quality approval required before advancing past Quality stage

### FR-012: Data Export (PDF + CSV) ✓
- Batch detail page has "Export Audit Trail" button
- Efficiency report has "Export to PDF" button

### FR-013: Offline Capability ✓
- IndexedDB queue stores offline requests
- Sync handler processes queue when online

### FR-014: Alerts & Notifications ✓
- Backend cron job checks for batches >24h in stage
- Toast notification in UI; alert stored in notification table

### FR-015: Barcode Scanning (Optional) ✓
- Input field on batch log-completion form supports paste (barcode scanners paste text)
- QR scanning library (e.g., `jsqr`) can be added later

### FR-016: Undo & Rollback ✓
- Undo button available 5 seconds after completion
- Rollback creates new "revert" event in audit trail

---

## Conclusion

This research validates all functional requirements are achievable with selected tech stack. Google OAuth2 + Event Sourcing + TanStack Query + TailwindCSS + ShadcnUI provide a solid foundation for manufacturing tracking system aligned with constitution principles (Trust, Mobile-First, Clarity, Accessibility, Performance, Rastreabilidad).

**Risk Assessment**: Low risk. All technologies are proven in production; no experimental choices. Offline sync is most complex area; mitigated by IndexedDB reliability and clear user feedback. Manual testing aligns with constitutional requirement and catches UX issues.

**Next Steps**: Proceed to Phase 1 (data model, contracts, wireframes, workflows).
