# Implementation Plan: Manufacturing Tracking System

**Branch**: `001-manufacturing-tracking` | **Date**: 2026-08-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-manufacturing-tracking/spec.md`

**Note**: Complete plan with design artifacts and implementation strategy for gypsum tile manufacturing tracking system.

## Summary

Build a comprehensive manufacturing tracking dashboard for gypsum tile production with real-time visibility across 8 manufacturing stages, batch traceability from planning through shipment, and role-based access (workers, supervisors, managers, quality controllers). Architecture combines React 19 frontend with Google OAuth2 federated identity, TanStack Query v5 for real-time polling (30s refresh), and immutable event-sourced audit trail for compliance. Key value propositions: immediate production visibility, complete batch traceability, efficiency bottleneck identification, and offline-capable mobile-first interface for factory floor workers.

## Technical Context

**Language/Version**: TypeScript 5.7 (frontend), runtime via Node.js 20+ (backend, if applicable)

**Primary Dependencies**: 
- Frontend: React 19, Vite 6 (build tool), TailwindCSS 4, ShadcnUI (component library)
- Forms: React Hook Form, Zod (schema validation)
- Data: TanStack Query v5 (React Query), axios (HTTP client)
- Auth: @react-oauth/google (Google OAuth2)
- Icons: Lucide React (SVG icons)
- Utilities: clsx, date-fns, lodash-es

**Storage**: 
- Backend: PostgreSQL 14+ (batch data, audit logs, user profiles)
- Frontend: Browser IndexedDB (offline queue), localStorage (session preference)

**Testing**: 
- Vitest (unit), Playwright (E2E), React Testing Library (component)
- Manual accessibility audit (WCAG 2.1 AA compliance)

**Target Platform**: 
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge); mobile-first (iOS 12+, Android 8+)
- Backend: Linux servers (Azure App Service, Docker, or similar)

**Project Type**: Web application (SPA - Single Page Application)

**Performance Goals**: 
- Core pages load in ≤2 seconds on 4G connections
- Dashboard data updates within 30 seconds (polling interval)
- API responses ≤500ms for standard operations
- Lighthouse score ≥90 (desktop), ≥80 (mobile)
- Code bundle <500KB (gzipped)

**Constraints**: 
- Mobile-first responsive design (320px–1920px)
- WCAG 2.1 AA accessibility compliance mandatory
- All form fields support keyboard navigation
- Touch targets ≥44px minimum
- SEO: semantic HTML, schema.org structured data for local business
- Offline support: queued requests stored in IndexedDB, synced when connection restored
- Security: CSP headers, XSS prevention, secure httpOnly cookies for auth tokens

**Scale/Scope**: 
- ~4-6 core user flows (login, dashboard, batch tracking, quality inspection, reports, logout)
- ~15-20 reusable shared components (Header, Footer, Button, Card, Modal, Form fields)
- ~40-50 pages/screens across 4 feature modules (auth, dashboard, production, quality)
- Single facility instance (multi-org support planned as future expansion)

## Constitution Check

**Gate Status**: ✅ PASS

**Verified Principles**:
- ✅ **Trust Through Evidence**: Dashboard displays real-time production data with timestamps and complete batch traceability from Planning → Shipping
- ✅ **Mobile-First Design**: All features functional on 320px+ screens; touch targets 44px+; optimized for factory floor workers on mobile devices
- ✅ **Clarity Over Aesthetics**: Data visualization uses color coding (green/yellow/red) for immediate status understanding; minimal decoration; semantic HTML
- ✅ **Professionalism & Consistency**: ShadcnUI component system ensures visual consistency; professional color palette (navy, teal); design tokens enforced via TailwindCSS config
- ✅ **Accessibility (WCAG 2.1 AA)**: Semantic HTML structure, 4.5:1 color contrast, keyboard navigation, ARIA labels on all form fields
- ✅ **Performance**: ≤2s load time goal, 30s polling meets dashboard refresh requirement, IndexedDB offline support
- ✅ **Clean Code**: React Hook Form + Zod for composable form logic, feature-based folder structure, single responsibility per component/service
- ✅ **Semantic Structure & SEO**: Semantic HTML (nav, main, article), schema.org microdata for structured business data
- ✅ **Rastreabilidade & Data Integrity**: Immutable event-sourced audit log with every action timestamped and user-attributed; audit endpoint exports CSV/PDF

**Note**: Re-check after Phase 1 design artifacts are completed.

## Project Structure

### Documentation (this feature)

```text
specs/001-manufacturing-tracking/
├── plan.md              # This file (implementation plan)
├── research.md          # Technology decisions & rationale (Phase 0)
├── data-model.md        # Entity definitions & relationships (Phase 1)
├── quickstart.md        # Validation scenarios & test procedures (Phase 1)
├── spec.md              # Feature specification with user stories (input)
├── contracts/           # Interface contracts (Phase 1)
│   ├── api-contracts.md         # REST API endpoint specs
│   ├── ui-wireframes.md         # Page/component wireframes
│   ├── workflow-diagrams.md     # User flow diagrams
│   └── data-model-diagram.md    # Entity relationship diagram
├── checklists/
│   └── requirements.md   # Feature testing checklist
└── tasks.md             # Implementation tasks (Phase 2 - generated by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/                      # Entry point & layout shell
│   │   ├── App.tsx               # Main app component, routing wrapper
│   │   ├── main.tsx              # Vite entry point
│   │   └── routes.tsx            # Route definitions (protected vs public)
│   │
│   ├── pages/                    # Page-level components (route destinations)
│   │   ├── LoginPage.tsx         # OAuth login flow
│   │   ├── DashboardPage.tsx     # Production dashboard (P1)
│   │   ├── BatchDetailPage.tsx   # Batch traceability view
│   │   ├── QualityInspectionPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── features/                 # Feature modules (auth, production, quality, reports)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── GoogleOAuthButton.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── LogoutButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── types/
│   │   │   │   ├── auth.types.ts
│   │   │   │   └── auth.schema.ts (Zod)
│   │   │   └── context/
│   │   │       └── AuthContext.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── StageCard.tsx
│   │   │   │   ├── ProductionVelocity.tsx
│   │   │   │   ├── BottleneckAlert.tsx
│   │   │   │   └── DashboardGrid.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProductionStatus.ts (TanStack Query)
│   │   │   │   └── useDashboardRefresh.ts
│   │   │   ├── services/
│   │   │   │   └── dashboardService.ts
│   │   │   └── types/
│   │   │       └── dashboard.types.ts
│   │   │
│   │   ├── production/
│   │   │   ├── components/
│   │   │   │   ├── BatchSearchBox.tsx
│   │   │   │   ├── BatchTimeline.tsx
│   │   │   │   ├── StageCompletionForm.tsx
│   │   │   │   └── AuditTrailViewer.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useBatchDetail.ts
│   │   │   │   └── useStageTransition.ts
│   │   │   ├── services/
│   │   │   │   └── batchService.ts
│   │   │   └── types/
│   │   │       ├── batch.types.ts
│   │   │       └── batch.schema.ts
│   │   │
│   │   ├── quality/
│   │   │   ├── components/
│   │   │   │   ├── QualityInspectionForm.tsx
│   │   │   │   ├── DefectRecorder.tsx
│   │   │   │   └── ApprovalWorkflow.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useQualityInspection.ts
│   │   │   ├── services/
│   │   │   │   └── qualityService.ts
│   │   │   └── types/
│   │   │       └── quality.types.ts
│   │   │
│   │   └── reports/
│   │       ├── components/
│   │       │   ├── EfficiencyChart.tsx
│   │       │   ├── WasteAnalysis.tsx
│   │       │   └── BottleneckReport.tsx
│   │       ├── hooks/
│   │       │   └── useReportsData.ts
│   │       ├── services/
│   │       │   └── reportService.ts
│   │       └── types/
│   │           └── reports.types.ts
│   │
│   ├── shared/                   # Reusable components, hooks, utilities
│   │   ├── components/
│   │   │   ├── Header.tsx        # Site header with nav + auth status
│   │   │   ├── Footer.tsx        # Site footer with local SEO
│   │   │   ├── Navigation.tsx    # Role-based navigation menu
│   │   │   ├── StatusBadge.tsx   # Stage status (green/yellow/red)
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── FormError.tsx     # Inline form error display
│   │   ├── hooks/
│   │   │   ├── useConnectionStatus.ts (offline detection)
│   │   │   ├── useMobileLayout.ts    (responsive breakpoints)
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useDebounce.ts
│   │   ├── services/
│   │   │   ├── apiClient.ts      (axios config, interceptors)
│   │   │   ├── queryClient.ts    (TanStack Query setup)
│   │   │   ├── indexedDbService.ts (offline queue)
│   │   │   └── syncService.ts    (queue sync logic)
│   │   ├── types/
│   │   │   ├── api.types.ts      (common API types)
│   │   │   └── domain.types.ts   (shared domain models)
│   │   ├── utils/
│   │   │   ├── formatters.ts     (date, number formatting)
│   │   │   ├── validators.ts     (shared validation)
│   │   │   └── constants.ts      (API endpoints, stage names)
│   │   └── styles/
│   │       ├── globals.css       (TailwindCSS directives)
│   │       ├── theme.css         (CSS variables for light/dark mode)
│   │       └── components.css    (custom component styles if needed)
│   │
│   ├── layouts/                  # Layout wrapper components
│   │   ├── AppLayout.tsx         # Main app shell (Header + Footer)
│   │   ├── AuthLayout.tsx        # Login-only layout (no nav)
│   │   └── AdminLayout.tsx       # Future: admin-only features
│   │
│   ├── config/
│   │   ├── vite.config.ts        # Vite + code splitting config
│   │   ├── tailwind.config.ts    # TailwindCSS color/spacing tokens
│   │   ├── tsconfig.json         # TypeScript strict mode
│   │   └── .env.example          # Environment variables template
│   │
│   └── index.css                 # Root Tailwind import
│
├── tests/
│   ├── integration/              # E2E tests (Playwright)
│   │   ├── auth.e2e.ts           # OAuth login flow
│   │   ├── dashboard.e2e.ts      # Dashboard load and updates
│   │   └── batch.e2e.ts          # Batch traceability workflow
│   ├── unit/                     # Component & utility tests (Vitest)
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── accessibility/            # Accessibility audit checklist (manual)
│
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── images/                   # Optimized images (WebP + PNG fallback)
│   │   ├── hero-banner.webp
│   │   ├── manufacturing-icon.svg
│   │   └── ...
│   └── icons/                    # SVG icons (mostly from Lucide, some custom)
│
├── package.json                  # Dependencies: React 19, Vite 6, TailwindCSS 4, etc.
├── vite.config.ts                # Vite build config (code splitting, bundling)
├── tailwind.config.ts            # Design tokens & TailwindCSS config
├── tsconfig.json                 # TypeScript 5.7 strict mode
├── vitest.config.ts              # Unit testing config
├── playwright.config.ts          # E2E testing config
├── .eslintrc.json                # ESLint rules
├── .prettierrc                   # Prettier formatting
└── README.md                     # Project setup & development guide
```

**Structure Decision**: 
- **Primary Structure**: Feature-based (`src/features/`) with co-located components, hooks, services, and types for each feature (auth, dashboard, production, quality, reports)
- **Shared Layer**: Reusable components (Header, Footer, StatusBadge), hooks (useConnectionStatus, useMobileLayout), and services (API client, IndexedDB queue) in `src/shared/`
- **Layouts**: Wrapper components for different route contexts (AppLayout for main app, AuthLayout for login, AdminLayout for future)
- **Separation of Concerns**: Each feature owns its domain logic; shared utilities extracted to `src/shared/` to prevent duplication
- **Pages as Route Destinations**: Minimal logic in `src/pages/` components; they compose feature-specific components and handle route parameters
- **Testing**: Three test layers—unit (components/hooks/utils), integration (E2E workflows), and accessibility (manual audit against WCAG 2.1 AA)

## Implementation Phases

### Phase 1: Design Artifacts (COMPLETE)
- ✅ **research.md**: Technology decisions & rationale (I-VII documented)
- ✅ **data-model.md**: Entity definitions with User, Batch, StageTransition, QualityInspection, AuditLogEntry, ShippingRecord
- ✅ **quickstart.md**: End-to-end validation scenarios (Prerequisites, Test users, Scenario 1: Auth flow)
- ✅ **contracts/api-contracts.md**: REST API endpoint specifications
- ✅ **contracts/ui-wireframes.md**: Page layouts and component wireframes
- ✅ **contracts/workflow-diagrams.md**: User flow & feature interaction diagrams
- ✅ **contracts/data-model-diagram.md**: Entity relationship diagram

### Phase 2: Task Decomposition (Pending)
Run `/speckit.tasks` to generate `tasks.md` with:
- Implementation tasks organized by feature module (auth, dashboard, production, quality, reports)
- Component-level tasks (shared components, feature-specific components, layouts)
- Service/integration tasks (API client, TanStack Query setup, IndexedDB queue)
- Testing tasks (unit tests, E2E tests, accessibility audit)
- Build/deployment tasks (Vite bundling, code splitting verification, lighthouse audit)

### Phase 3: Implementation (After Phase 2)
Execute tasks from `tasks.md` in dependency order:
1. **Core Infrastructure**: App shell, routing, global styles (TailwindCSS config)
2. **Authentication**: Google OAuth2 flow, ProtectedRoute wrapper, session management
3. **Shared Layer**: Header, Footer, Navigation, StatusBadge, utility hooks/services
4. **Feature Modules**: Auth → Dashboard → Production → Quality → Reports (sequential dependency)
5. **Testing**: Unit tests during component development, E2E tests after feature completion
6. **Optimization**: Code splitting, image optimization, lighthouse audit

## Design Decisions

### Authentication & Authorization
- **Approach**: Google OAuth2 via @react-oauth/google with httpOnly cookies for token storage
- **Role-Based Access**: User roles (WORKER, SUPERVISOR, MANAGER, QUALITY_CONTROLLER, ADMIN) determine visible features and accessible routes
- **Session Management**: `/api/auth/session` endpoint validates session on app boot; `/api/auth/logout` clears httpOnly cookie
- **Reference**: [research.md - Section I](research.md)

### Real-Time Data Updates
- **Approach**: TanStack Query v5 with polling strategy (30s dashboard, 10s batch details, 60s reports)
- **Offline Support**: IndexedDB queue for failed requests; automatic retry when connection restored
- **Cache Invalidation**: Manual refetch after mutations (stage completion, quality approval); background refetch on window focus
- **Reference**: [research.md - Section II](research.md)

### UI/UX Strategy
- **Styling Framework**: TailwindCSS v4 with ShadcnUI pre-built components
- **Design Tokens**: Color palette (navy #003366, teal #00897B, slate grays), spacing 4px base, Inter typography
- **Mobile-First**: All features functional on 320px+; touch targets 44px+; responsive breakpoints at 768px (tablet) and 1024px (desktop)
- **Accessibility**: WCAG 2.1 AA mandatory—semantic HTML, 4.5:1 contrast, keyboard navigation, ARIA labels
- **Reference**: [research.md - Section III](research.md)

### Form State & Validation
- **Approach**: React Hook Form with Zod schema validation; client-side validation for immediate feedback, server-side validation for security
- **Error Display**: Inline field errors with red text (WCAG contrast); form submission blocked until validation passes
- **Async Validation**: Batch ID verification via async handler; displayed with loading indicator
- **Reference**: [research.md - Section IV](research.md)

### Data Integrity & Audit Trail
- **Approach**: Immutable event-sourced audit log; every action (stage transition, quality approval, rework) recorded with timestamp, user, before/after state
- **Compliance**: Audit trail enables regulatory verification and root-cause analysis; events are append-only, never retroactively edited
- **Snapshot Strategy**: Current batch state computed via endpoint; snapshots every 100 events for performance
- **Export**: Endpoint `/api/batches/{batch_id}/audit-trail` exports full audit log as CSV/PDF
- **Reference**: [research.md - Section V](research.md)

### Offline Capability
- **Approach**: IndexedDB queue stores queued requests with timestamp and retry count
- **Sync Detection**: `navigator.onLine` + periodic `/api/health` ping; background sync runs every 10s when online
- **User Feedback**: "⚠️ Queued - will sync when online" badge displayed on affected batch; manual "Retry Sync" button
- **Safety**: Requests are idempotent via batch_id + timestamp; re-sending duplicates is safe
- **Reference**: [research.md - Section VI](research.md)

### Performance Optimization
- **Code Splitting**: Each feature folder lazy-loaded via React.lazy(); dashboard, production, quality, reports load independently
- **Image Optimization**: PNG/JPG → WebP with fallback; responsive images via srcset; lazy-loading via loading="lazy"
- **Bundle Monitoring**: GitHub Actions CI runs webpack-bundle-analyzer; alerts on >5% bundle size increase
- **Target Metrics**: ≤2s core page load (4G), <500KB gzipped bundle, Lighthouse ≥90 (desktop) / ≥80 (mobile)
- **Reference**: [research.md - Section VII](research.md)

## Key Deliverables

1. **Frontend Application**: React 19 + TypeScript 5.7, Vite 6 build, TailwindCSS 4 styling
2. **Authentication**: Google OAuth2 federated identity with role-based access control
3. **Dashboard**: Real-time production status across 8 manufacturing stages (30s polling)
4. **Batch Tracking**: Complete traceability timeline from Planning → Shipping with stage metadata
5. **Quality Inspection**: Structured workflow for quality controllers to approve/reject batches with defect documentation
6. **Efficiency Reports**: Bottleneck identification, waste analysis, trend tracking
7. **Offline Support**: Queue-based sync for unreliable factory floor connectivity
8. **Accessibility**: Full WCAG 2.1 AA compliance (4.5:1 contrast, keyboard nav, screen reader support)
9. **Audit Trail**: Immutable event log with export capability for compliance verification
10. **Mobile-Optimized**: Touch-friendly interface for factory floor workers (44px+ targets, <2s load)

## Success Criteria

- ✅ All 7 user stories (P1 & P2) testable and passing
- ✅ Dashboard data updates within 30 seconds of production event
- ✅ Batch traceability complete (timeline shows all 8 stages with metadata)
- ✅ Offline stage completion requests queued and synced when connection restored
- ✅ Quality inspection workflow blocks progression until approval recorded
- ✅ Efficiency reports identify stage bottlenecks within ±10% accuracy
- ✅ Core pages load in ≤2s on 4G, Lighthouse ≥90 (desktop) / ≥80 (mobile)
- ✅ WCAG 2.1 AA compliance verified (4.5:1 contrast, keyboard navigation, screen reader)
- ✅ Zero silent failures; all errors logged and reported to user
- ✅ Audit trail complete for all actions; CSV/PDF export working

## Dependencies & Assumptions

**Assumptions**:
- Backend API already exists or will be developed in parallel with frontend
- Google Workspace organizational structure available for role mapping
- PostgreSQL 14+ available for data persistence
- Factory floor has intermittent 4G/WiFi connectivity (offline support essential)
- Team has React 19 experience; TailwindCSS/ShadcnUI are new but well-documented
- Accessibility testing conducted manually (no automated tool available yet)

**External Dependencies**:
- @react-oauth/google library for OAuth2 flow
- ShadcnUI component library (must match Radix UI version)
- TanStack Query v5 API contract (assumes React 18+)
- TailwindCSS v4 configuration (must include CSS variables plugin)

## Next Steps

1. Generate implementation tasks via `/speckit.tasks` command
2. Create GitHub issues from `tasks.md` with acceptance criteria and estimated effort
3. Set up development environment (Node.js 20+, Vite, TailwindCSS, ShadcnUI)
4. Begin Phase 3 implementation following task dependency order
5. Run unit tests and E2E tests during development
6. Conduct accessibility audit using WCAG 2.1 AA checklist before feature release
