# Tasks: Manufacturing Tracking System

**Input**: Design documents from `specs/001-manufacturing-tracking/` including spec.md, plan.md, data-model.md, contracts/

**Feature**: Gypsum Tile Manufacturing Tracking System with 8 user stories (P1-P2 priorities)

**Organization**: Tasks grouped by phase → user story → component delivery for independent implementation and testing

**Test Strategy**: Manual QA per constitution (no automated tests); accessibility audit via WCAG 2.1 AA checklist; performance validated via Lighthouse

---

## Format: `- [ ] [TaskID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` (unchecked initially)
- **TaskID**: Sequential T001, T002, T003... (execution order)
- **[P]**: Include only if parallelizable (different files, no blocking dependencies)
- **[Story]**: User story label [US1], [US2], etc. (only for Phase 3+ story tasks)
- **File Paths**: Exact paths per plan.md project structure

---

## Phase 1: Setup & Infrastructure

**Purpose**: Project initialization, folder structure, build tooling, and dependency installation

**Dependencies**: None (starting point)

- [X] T001 Create project folder structure per plan.md layout in `src/`
- [X] T002 [P] Initialize Vite 6 project with `npm create vite@latest` and configure vite.config.ts
- [X] T003 [P] Install React 19, TypeScript 5.7, and core dependencies (react, react-dom, typescript)
- [X] T004 [P] Install TailwindCSS 4 and configure tailwind.config.ts with design tokens (navy #003366, teal #00897B, slate grays)
- [X] T005 [P] Install ShadcnUI and initialize component library setup
- [X] T006 [P] Install form & validation libraries (react-hook-form, zod)
- [X] T007 [P] Install data fetching & state management (axios, @tanstack/react-query)
- [X] T008 [P] Install icons library (lucide-react) and date utilities (date-fns, clsx)
- [X] T009 [P] Install Google OAuth2 library (@react-oauth/google)
- [X] T010 [P] Setup TypeScript strict mode in tsconfig.json with appropriate compiler options
- [X] T011 [P] Setup ESLint and Prettier configuration files (.eslintrc.json, .prettierrc)
- [X] T012 [P] Configure environment variables template (.env.example) with VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID
- [X] T013 Setup .gitignore to exclude node_modules, dist, .env, build artifacts
- [X] T014 Initialize git repository and create initial commit
- [X] T015 Setup package.json scripts (dev, build, lint, format, test)
- [X] T016 Create README.md with project overview, setup instructions, and development guide

**Checkpoint**: Project structure ready, all dependencies installed, build tooling configured. Ready for Phase 2.

---

## Phase 2: Foundational Infrastructure

**Purpose**: Core services, layouts, and utilities that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story implementation begins until this phase is 100% complete

**Dependencies**: Phase 1 ✅

### Core API & HTTP Client

- [X] T017 [P] Create axios HTTP client in src/shared/services/apiClient.ts with:
  - Base URL from environment variable VITE_API_BASE_URL
  - Request/response interceptors
  - Error handling that catches 401 (auth failure) and 500 (server error)
  - Support for Bearer token in Authorization header
  - Timeout set to 30 seconds for standard requests

- [X] T018 [P] Create TanStack Query setup in src/shared/services/queryClient.ts with:
  - Default config: staleTime 30000ms (30s), cacheTime 5min
  - Error handler for 401 (redirect to login), 500 (show error toast)
  - Retry logic: 3 retries with exponential backoff for network errors
  - Request deduplication enabled

### Routing & Protected Routes

- [X] T019 [P] Create routing structure in src/app/routes.tsx defining:
  - Public routes: /auth/login, /auth/callback, /404
  - Protected routes: /dashboard, /batches/:batch_id, /quality, /reports, /admin
  - Role-based route guards (WORKER, SUPERVISOR, MANAGER, QUALITY_CONTROLLER, ADMIN)
  - Redirect to /auth/login if accessing protected route without authentication

- [ ] T020 Create ProtectedRoute wrapper component in src/features/auth/components/ProtectedRoute.tsx that:
  - Validates user authentication via AuthContext
  - Checks user role against route permission requirements
  - Displays loading spinner while auth state is being determined
  - Redirects unauthenticated users to /auth/login
  - Redirects unauthorized users (insufficient role) to 403 Forbidden page

### State Management & Context

- [ ] T021 Create AuthContext in src/features/auth/context/AuthContext.tsx with:
  - Current user profile (user_id, google_email, full_name, role, assigned_stage)
  - Authentication status (loading, authenticated, error)
  - Session expiration timestamp
  - Provides useAuth hook for consuming components

- [ ] T022 [P] Create custom hook useAuth() in src/features/auth/hooks/useAuth.ts that:
  - Returns current user from AuthContext
  - Provides login() function for OAuth flow
  - Provides logout() function to clear session
  - Provides isAuthenticated boolean and user role checks (hasRole())

- [ ] T023 [P] Create custom hook useSession() in src/features/auth/hooks/useSession.ts that:
  - Validates session on app boot via GET /auth/session endpoint
  - Handles session restoration from httpOnly cookie
  - Detects session expiration and redirects to login
  - Runs auth check on component mount

### Layout Components

- [X] T024 [P] Create Header component in src/shared/components/Header.tsx with:
  - Left side: Company logo or site title
  - Right side: User name, role badge, dropdown menu
  - Logout button in dropdown
  - Role-specific badge showing current role (WORKER, SUPERVISOR, etc.)
  - Mobile responsive (header collapses on mobile, nav moves to burger menu)

- [X] T025 [P] Create Footer component in src/shared/components/Footer.tsx with:
  - Copyright notice
  - Links to company/support pages
  - Privacy and Terms links
  - Responsive footer that stacks on mobile

- [X] T026 [P] Create Navigation component in src/shared/components/Navigation.tsx that:
  - Shows role-appropriate menu items based on user role
  - WORKER role: Dashboard, My Work, Batch Search, Logout
  - SUPERVISOR role: Dashboard, Production, Quality, Batch Search, Logout
  - MANAGER role: Dashboard, Production, Quality, Reports, Batch Search, Admin, Logout
  - QUALITY_CONTROLLER role: Dashboard, Quality Inspections, Audit Trail, Logout
  - ADMIN role: Dashboard, Users, System Settings, Logout
  - Active route highlighted
  - Mobile: hamburger menu that collapses/expands

- [X] T027 [P] Create AppLayout wrapper in src/layouts/AppLayout.tsx that:
  - Combines Header + Navigation + Footer
  - Main content area for page components
  - Sticky header on scroll
  - Responsive layout (flex column on mobile, row on desktop if needed)
  - Accessible landmark structure (nav, main, footer)

- [X] T028 [P] Create AuthLayout wrapper in src/layouts/AuthLayout.tsx (login-only layout) with:
  - No header/nav/footer
  - Centered login form
  - Company branding
  - Mobile responsive

### Global Styles & Theme

- [X] T029 Create global CSS in src/index.css with:
  - Tailwind CSS directives (@tailwind base, components, utilities)
  - CSS custom properties for theming (--color-primary, --color-success, --color-warning, etc.)
  - Dark mode support (prefers-color-scheme media query)
  - Typography defaults (Inter font family, line-height ratios, heading hierarchy)

- [X] T030 Configure TailwindCSS color palette in tailwind.config.ts with:
  - Primary: navy #003366
  - Secondary: teal #00897B
  - Success: green #4CAF50
  - Warning: amber #FFA726
  - Danger: red #EF5350
  - Neutral: slate grays (50, 100, 200, 300, 400, 500, 600, 700, 800, 900)
  - Extend with CSS variables plugin for light/dark mode

- [X] T031 Setup spacing scale in TailwindCSS config (4px base: gap-1=4px, gap-2=8px, gap-4=16px, etc.)

### Shared UI Components & Utilities

- [X] T032 [P] Create StatusBadge component in src/shared/components/StatusBadge.tsx for stage status display:
  - Props: status ('GREEN' | 'YELLOW' | 'RED'), label (stage name)
  - GREEN: teal background, white text
  - YELLOW: amber background, dark text
  - RED: red background, white text
  - Includes icon (checkmark, alert, error)
  - Accessible color + icon (not color-only indicator)

- [X] T033 [P] Create LoadingSpinner component in src/shared/components/LoadingSpinner.tsx:
  - Centered animated spinner
  - Optional loading text
  - Aria role="status" for screen readers
  - Responsive size (smaller on mobile)

- [X] T034 [P] Create ErrorBoundary component in src/shared/components/ErrorBoundary.tsx:
  - Catches React component errors
  - Displays user-friendly error message (not stack trace)
  - "Try again" button that resets error boundary
  - Logs error details to console/monitoring service

- [X] T035 [P] Create FormError component in src/shared/components/FormError.tsx:
  - Displays inline field-level validation errors
  - Associated to field via aria-describedby
  - Red text with 4.5:1 contrast ratio
  - Icon (⚠️) plus error message

### Shared Hooks & Utilities

- [X] T036 [P] Create useConnectionStatus hook in src/shared/hooks/useConnectionStatus.ts:
  - Detects online/offline status via navigator.onLine
  - Periodic health check to /api/health endpoint (every 10s when offline)
  - Returns { isOnline: boolean, lastCheckedAt: Date }
  - Triggers sync when connection restored

- [X] T037 [P] Create useMobileLayout hook in src/shared/hooks/useMobileLayout.ts:
  - Detects viewport width and returns breakpoint (mobile, tablet, desktop)
  - Mobile: ≤768px, Tablet: 768px-1024px, Desktop: >1024px
  - Listens to window resize events
  - Memoized to prevent unnecessary re-renders

- [X] T038 [P] Create useLocalStorage hook in src/shared/hooks/useLocalStorage.ts:
  - Reads/writes values to localStorage
  - Syncs across browser tabs
  - Handles JSON serialization/deserialization
  - Includes remove() function

- [X] T039 [P] Create useDebounce hook in src/shared/hooks/useDebounce.ts:
  - Debounces value changes (default 300ms)
  - Used for search inputs, filter changes
  - Returns debounced value

- [X] T040 [P] Create formatters utility in src/shared/utils/formatters.ts with:
  - formatDate(date, format) - format timestamps (ISO, local, relative)
  - formatTime(seconds) - format duration (1.5h, 45m, 30s)
  - formatNumber(num) - format integers with thousand separators
  - formatBatchId(id) - format batch ID for display

- [X] T041 [P] Create validators utility in src/shared/utils/validators.ts with:
  - validateBatchId(id) - batch ID format validation
  - validateEmail(email) - email format
  - validateRequired(value) - non-empty check
  - Custom async validators for API calls

- [X] T042 [P] Create constants utility in src/shared/utils/constants.ts with:
  - API endpoint base paths (/auth, /batches, /quality, /reports)
  - Manufacturing stage names and order (PLANNING, MIXING, MOLDING, CURING, FINISHING, QUALITY, PACKAGING, SHIPPING)
  - User roles (WORKER, SUPERVISOR, MANAGER, QUALITY_CONTROLLER, ADMIN)
  - Stage status indicators (GREEN, YELLOW, RED)
  - Defect reason codes

### Offline Support & Queue

- [X] T043 [P] Create IndexedDB service in src/shared/services/indexedDbService.ts for offline queue:
  - Database name: "manufacturing_tracking"
  - Store name: "pending_requests"
  - Stores: { id, timestamp, endpoint, method, payload, retryCount }
  - Methods: addRequest(), getPendingRequests(), removeRequest(), clearAll()

- [X] T044 [P] Create sync service in src/shared/services/syncService.ts:
  - Checks connection status before attempting sync
  - Retrieves pending requests from IndexedDB
  - Batches requests (max 10 per sync, FIFO order)
  - Retries failed requests up to 3 times with exponential backoff
  - Removes successful requests from queue
  - Triggers UI toast notification on sync completion
  - Runs every 10 seconds when online (via useEffect hook)

### App Entry Point

- [X] T045 Create App.tsx in src/app/App.tsx:
  - Wraps entire app with AuthContext provider
  - Wraps with TanStack QueryClientProvider
  - Validates session on mount via useSession hook
  - Sets up global error boundary
  - Renders routing based on authentication status
  - Renders LoadingSpinner while auth is checking

- [X] T046 Create main.tsx Vite entry point in src/app/main.tsx:
  - Imports App component
  - Renders to root DOM element
  - Setup React strict mode for development
  - Configure Vite HMR if needed

**Checkpoint**: Foundation complete. All infrastructure in place. User story implementation can now proceed in parallel.

---

## Phase 3: User Story 1 - Google OAuth2 Authentication & Dashboard Access (Priority: P1)

**Goal**: Enable users to authenticate via Google OAuth2 and access role-appropriate dashboard immediately upon login

**Independent Test**: (1) Navigate to login, (2) Click "Sign in with Google", (3) Complete OAuth flow, (4) Verify dashboard loads with user name and role-appropriate content, (5) Test logout clears session, (6) Test unauthorized account rejection

**Acceptance Criteria**:
- ✅ OAuth login redirects to Google consent screen
- ✅ Successful authentication redirects to dashboard
- ✅ User name and role displayed in header
- ✅ Logout clears session and returns to login
- ✅ Unauthorized accounts show error message
- ✅ Session persists across page reloads (30-day window)
- ✅ Load time ≤10 seconds on 4G

### Implementation Tasks for US1

- [ ] T047 [P] Create auth service in src/features/auth/services/authService.ts with:
  - loginWithGoogle(token) - exchange Google token for session
  - getCurrentUser() - GET /auth/session to validate session
  - logout() - POST /auth/logout to clear session
  - Error handling for 401 (unauthorized), 403 (forbidden)

- [ ] T048 [P] Create auth types in src/features/auth/types/auth.types.ts:
  - User interface: { user_id, google_email, full_name, role, assigned_stage, last_login_at }
  - AuthResponse interface: { success, user, session_expires_in }
  - Roles enum: WORKER | SUPERVISOR | MANAGER | QUALITY_CONTROLLER | ADMIN

- [ ] T049 [P] Create auth Zod schema in src/features/auth/types/auth.schema.ts:
  - loginSchema - validates Google token format
  - userSchema - validates user object from API
  - Provides runtime type checking for auth responses

- [ ] T050 [P] Create GoogleOAuthButton component in src/features/auth/components/GoogleOAuthButton.tsx:
  - Uses @react-oauth/google library
  - Displays "Sign in with Google" button with Google logo
  - Calls onSuccess(credentialResponse) callback with JWT token
  - Handles errors via onError callback
  - Accessible (keyboard navigable, aria-label)
  - Button size 44px+ minimum (touch target)
  - Loading state while authentication in progress

- [ ] T051 [P] Create LogoutButton component in src/features/auth/components/LogoutButton.tsx:
  - Positioned in header dropdown menu
  - Calls logout() from useAuth hook
  - Redirects to /auth/login on success
  - Shows confirmation dialog "Are you sure?" before logout
  - Loading state during logout

- [ ] T052 Create LoginPage in src/pages/LoginPage.tsx:
  - Uses AuthLayout (no header/nav/footer)
  - Displays company branding
  - GoogleOAuthButton component
  - Error message display if login fails (unauthorized account, network error)
  - Redirect to /dashboard if already authenticated
  - Mobile responsive (centered, readable on 320px+)
  - WCAG 2.1 AA: semantic HTML (form element), 4.5:1 contrast, keyboard navigation

- [ ] T053 Create auth context provider component in src/features/auth/context/AuthContext.tsx:
  - useAuthProvider hook that manages auth state
  - Initializes session on app mount (calls useSession)
  - Stores user profile, loading state, error state
  - Provides login() and logout() functions
  - Persists session in httpOnly cookie (handled by backend)

- [ ] T054 Create useAuth hook in src/features/auth/hooks/useAuth.ts:
  - Returns current user profile
  - Returns login(token) async function
  - Returns logout() async function
  - Returns isAuthenticated boolean
  - Returns hasRole(role) function to check permissions
  - Throws error if AuthContext not found

- [ ] T055 Create useSession hook in src/features/auth/hooks/useSession.ts:
  - Calls GET /auth/session on component mount
  - Validates session is still active
  - Restores user profile from httpOnly cookie
  - Handles 401 response by clearing auth state
  - Detects session expiration and redirects to login
  - Uses TanStack Query for session validation
  - Shows loading spinner while validating

- [ ] T056 Update App.tsx to include auth initialization:
  - Wrap app with AuthContext provider
  - Add useSession hook call to validate auth on boot
  - Show LoadingSpinner while auth state is being determined
  - Redirect to LoginPage if not authenticated

- [ ] T057 Update Header component to display authenticated user:
  - Show user's full_name from AuthContext
  - Display role badge (WORKER, SUPERVISOR, MANAGER, QC, ADMIN)
  - Add dropdown menu with LogoutButton
  - Hide header/nav on /auth/login route
  - Show user status "Authenticated as [name] - [role]"

- [ ] T058 Update ProtectedRoute wrapper:
  - Check useAuth for isAuthenticated status
  - Redirect unauthenticated users to /auth/login
  - Allow authenticated users to access protected route

- [ ] T059 Create OAuth callback handling in App.tsx:
  - Handle redirect from OAuth provider (if needed)
  - Extract token from URL params or cookie
  - Exchange token for session via authService.loginWithGoogle()
  - Redirect to /dashboard on success
  - Show error message on failure

**Checkpoint**: Authentication complete. Users can login via Google OAuth, session persists, and dashboard is accessible. Ready for Phase 4.

---

## Phase 4: User Story 2 - Supervisor Real-Time Production Status (Priority: P1)

**Goal**: Supervisors see real-time dashboard with all 8 manufacturing stages, batch counts, duration metrics, and visual status indicators updated every 30 seconds

**Independent Test**: (1) Login as SUPERVISOR, (2) Dashboard loads with all 8 stage cards, (3) Each card shows batch count, avg duration, status color, (4) Dashboard updates within 30s of batch transition, (5) Bottleneck stage highlighted, (6) Mobile responsive (≤768px), (7) Load time ≤2s

**Acceptance Criteria**:
- ✅ All 8 stages visible with batch counts
- ✅ Color-coded status (GREEN=on-target, YELLOW=attention-needed, RED=behind)
- ✅ Real-time updates within 30 seconds
- ✅ Bottleneck stage clearly highlighted
- ✅ Production velocity metric displayed
- ✅ "No active batches" message for empty stages
- ✅ Mobile layout stacks vertically, readable on 320px+
- ✅ Touch targets 44px+
- ✅ <2s load time on 4G

### Implementation Tasks for US2

- [ ] T060 [P] Create production types in src/features/dashboard/types/dashboard.types.ts:
  - Stage interface: { stage_name, batch_count, avg_duration_hours, status, trend }
  - Dashboard response: { timestamp, production_velocity, stages[], bottleneck_stage, total_active_batches }
  - Status enum: GREEN | YELLOW | RED

- [ ] T061 [P] Create dashboard Zod schema in src/features/dashboard/types/dashboard.schema.ts:
  - dashboardSchema validates API response structure
  - stageSchema validates individual stage objects

- [ ] T062 [P] Create dashboard service in src/features/dashboard/services/dashboardService.ts:
  - fetchDashboardData() - GET /batches/dashboard returns stages and metrics
  - Error handling for network failures
  - Response validation via Zod schema
  - Caching strategy via TanStack Query

- [ ] T063 [P] Create useProductionStatus hook in src/features/dashboard/hooks/useProductionStatus.ts:
  - Uses TanStack Query to fetch /batches/dashboard
  - Polling interval: staleTime 30000ms (30 seconds)
  - Auto-refetch when window regains focus
  - Manual refetch available via refetch() function
  - Returns { data, isLoading, error, refetch }
  - Retry logic for network failures

- [ ] T064 [P] Create useDashboardRefresh hook in src/features/dashboard/hooks/useDashboardRefresh.ts:
  - Returns function to manually trigger dashboard refresh
  - Shows loading indicator during refresh
  - Called by workers after completing stage
  - Updates UI with fresh data within 2 seconds

- [ ] T065 [P] Create StageCard component in src/features/dashboard/components/StageCard.tsx:
  - Props: stage (Stage object)
  - Display: stage name, batch count, avg duration, status indicator
  - Conditionally show "No active batches" if batch_count = 0
  - StatusBadge for color-coded status
  - Hover effect (slight shadow/scale on desktop)
  - Responsive sizing (100% width on mobile, grid item on desktop)
  - Accessible: semantic HTML, aria-label for screen readers

- [ ] T066 [P] Create ProductionVelocity component in src/features/dashboard/components/ProductionVelocity.tsx:
  - Props: velocity (number), trend (arrow up/down/stable)
  - Display: "Production Velocity: XX batches/day"
  - Include trend indicator with arrow
  - Card-style container
  - Responsive sizing

- [ ] T067 [P] Create BottleneckAlert component in src/features/dashboard/components/BottleneckAlert.tsx:
  - Props: bottleneck_stage (string)
  - Displays warning alert: "⚠️ Bottleneck Alert: [stage name] is behind schedule"
  - Yellow/amber background with icon
  - Dismiss button (can be re-enabled via settings)
  - Accessible: aria-live="polite", role="alert"

- [ ] T068 Create DashboardGrid component in src/features/dashboard/components/DashboardGrid.tsx:
  - Renders grid of StageCard components for all 8 stages
  - One stage per row on mobile (320px), 2-3 per row on tablet, 4 per row on desktop
  - ProductionVelocity widget at top
  - BottleneckAlert at top
  - Last-updated timestamp
  - Manual refresh button with loading spinner
  - Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

- [ ] T069 Create DashboardPage in src/pages/DashboardPage.tsx:
  - Uses AppLayout wrapper
  - Calls useProductionStatus hook
  - Shows LoadingSpinner while data loading
  - Shows ErrorBoundary + error message if fetch fails
  - Renders DashboardGrid on success
  - Includes "Refresh" button for manual update
  - Role check: ensure user is SUPERVISOR, MANAGER, or ADMIN
  - Breadcrumb or page title: "Production Dashboard"
  - WCAG 2.1 AA: semantic HTML, 4.5:1 contrast for status text

- [ ] T070 Update Navigation component to include Dashboard link:
  - Add "Dashboard" link in main navigation
  - Link to /dashboard
  - Highlight as active route

- [ ] T071 Configure TanStack Query polling for dashboard:
  - Set refetchInterval: 30000 (30 seconds)
  - Set staleTime: 0 (immediately stale)
  - Set cacheTime: 300000 (5 minutes)
  - Set refetchOnWindowFocus: true
  - Set retry: 3 with exponential backoff

- [ ] T072 Add responsive design to dashboard components:
  - Test mobile layout at 320px (iPhone SE), 375px (iPhone 12), 768px (iPad)
  - Verify stage cards stack vertically
  - Verify text remains readable without horizontal scroll
  - Verify buttons/touch targets 44px+
  - Test landscape orientation (rotate device)

- [ ] T073 Add accessibility features to dashboard:
  - Semantic HTML: use `<section>` for stage groups, `<article>` for cards
  - ARIA labels on all interactive elements
  - Color + icon indicators (not color-only)
  - Keyboard navigation (Tab through cards, arrows to navigate)
  - Screen reader announces stage names and batch counts

- [ ] T074 Optimize dashboard load performance:
  - Measure baseline load time (dev tools)
  - Optimize images (use WebP with PNG fallback)
  - Lazy-load non-critical components below fold
  - Set bundle size goal <100KB for dashboard
  - Target ≤2s load on 4G (Chrome DevTools network throttling)

**Checkpoint**: Dashboard complete with real-time updates. Supervisors can view production status. Ready for Phase 5.

---

## Phase 5: User Story 3 - Batch Traceability & Timeline (Priority: P1)

**Goal**: Production managers can search for any batch and view complete manufacturing timeline from Planning through Shipping with all stage metadata, quality results, and audit trail

**Independent Test**: (1) Navigate to batch search, (2) Enter or scan batch ID, (3) View batch detail page with timeline, (4) Verify all 8 stages shown with timestamps, (5) Verify quality results displayed, (6) Verify shipping info visible, (7) Test export audit trail to PDF/CSV, (8) Mobile responsive

**Acceptance Criteria**:
- ✅ Batch search by ID returns matching batch
- ✅ Timeline shows all stages in order with entry/exit timestamps
- ✅ Stage duration calculated and displayed
- ✅ Quality check results visible (pass/fail/defects)
- ✅ Shipping info visible if applicable
- ✅ Drill-down into stage details (materials, temperatures, etc.)
- ✅ Audit trail shows all actions on batch
- ✅ Export audit trail as PDF/CSV
- ✅ Mobile responsive layout
- ✅ ≤5s to display batch details after search

### Implementation Tasks for US3

- [ ] T075 [P] Create batch types in src/features/production/types/batch.types.ts:
  - Batch interface: { batch_id, status, current_stage, created_at, completed_at, material_batch_id, quality_status }
  - StageTransition interface: { transition_id, batch_id, from_stage, to_stage, transitioned_at, completed_by_user_id, duration_in_stage, notes }
  - QualityInspection interface: { inspection_id, batch_id, result, defects[], timestamp }
  - ShippingRecord interface: { shipping_id, batch_id, destination, carrier, tracking_number, shipping_date }

- [ ] T076 [P] Create batch Zod schema in src/features/production/types/batch.schema.ts:
  - batchSchema validates Batch object
  - stageTransitionSchema validates transitions
  - qualityInspectionSchema validates quality data
  - shippingRecordSchema validates shipping data

- [ ] T077 [P] Create batch service in src/features/production/services/batchService.ts:
  - fetchBatchDetail(batch_id) - GET /batches/{batch_id}
  - searchBatches(query) - GET /batches/search?query=
  - fetchAuditTrail(batch_id) - GET /batches/{batch_id}/audit-trail
  - exportAuditTrail(batch_id, format) - GET /batches/{batch_id}/audit-trail/export?format=pdf|csv
  - Error handling for 404 (batch not found), validation errors

- [ ] T078 [P] Create useBatchDetail hook in src/features/production/hooks/useBatchDetail.ts:
  - Fetch batch details via batchService.fetchBatchDetail()
  - Uses TanStack Query with staleTime 10000ms (10s)
  - Manual refetch available
  - Returns { data: Batch, isLoading, error, refetch }

- [ ] T079 [P] Create BatchSearchBox component in src/features/production/components/BatchSearchBox.tsx:
  - Search input field (text, min 6 characters = batch ID length)
  - Submit button "Search" or Enter key to submit
  - Async validation: batch exists via GET /batches/{batch_id}
  - Loading indicator while searching
  - Error message if batch not found
  - Barcode scanner integration (optional, reads QR code to fill search box)
  - Debounce search input (300ms) to reduce API calls
  - Keyboard accessible (focus, Tab, Enter)

- [ ] T080 [P] Create BatchTimeline component in src/features/production/components/BatchTimeline.tsx:
  - Props: batch (Batch object), stageTransitions (array)
  - Vertical timeline showing all 8 stages in order
  - Each stage shows:
    - Stage name
    - Entry timestamp (formatted date/time)
    - Exit timestamp
    - Duration in stage (calculated)
    - Worker/supervisor name (completed_by_user_id)
    - Stage status indicator (completed, current, pending)
  - Visual line connecting stages
  - Current stage highlighted with circle/icon
  - Responsive: timeline may need to stack on mobile (narrow layout)
  - Clickable stage card to expand details

- [ ] T081 [P] Create AuditTrailViewer component in src/features/production/components/AuditTrailViewer.tsx:
  - Props: batch_id (string)
  - Displays audit log entries for batch (all actions on batch)
  - Columns: Timestamp, Action, User, Before Value, After Value, Reason
  - Sortable by timestamp (default descending = newest first)
  - Filterable by action type (stage_transition, quality_approval, data_export, system_alert)
  - Export button: "Export Audit Trail" → downloads CSV/PDF
  - Pagination for large audit logs (100+ entries)
  - Responsive table (horizontal scroll on mobile if needed)
  - WCAG: semantic HTML `<table>`, aria-label on table

- [ ] T082 Create BatchDetailPage in src/pages/BatchDetailPage.tsx:
  - Route: /batches/:batch_id
  - Shows BatchSearchBox at top for new search
  - Calls useBatchDetail(batch_id) from URL params
  - Shows LoadingSpinner while loading
  - Shows ErrorBoundary + error message if batch not found
  - On success, displays:
    - Batch ID, status, material batch, created date
    - BatchTimeline component (stages + transitions)
    - QualityInspection result section (if Quality stage completed)
    - ShippingRecord section (if Shipping stage completed)
    - AuditTrailViewer component at bottom
  - "Export Audit Trail" button (calls batchService.exportAuditTrail)
  - Role check: MANAGER, SUPERVISOR can view; ADMIN can view all
  - Breadcrumb: Dashboard → Batch Search → Batch ABC-123
  - WCAG 2.1 AA: semantic sections, proper heading hierarchy, 4.5:1 contrast

- [ ] T083 [P] Create StageDetailView component in src/features/production/components/StageDetailView.tsx (for drill-down):
  - Props: stage (stage name), stageData (metadata like materials, temperatures, notes)
  - Expandable section under timeline
  - Shows stage-specific details:
    - MIXING: material batch, mixer settings, cycle time
    - MOLDING: mold type, temperature, setup time, count
    - CURING: temperature, humidity, duration, date/time
    - FINISHING: surface quality, defects found, rework needed
    - QUALITY: inspector, result, defects, approval timestamp
    - PACKAGING: carton type, count, weight
    - SHIPPING: carrier, tracking, destination, date
  - Mobile: responsive table or list format

- [ ] T084 Update routing in routes.tsx:
  - Add route: /batches/:batch_id → BatchDetailPage
  - Protected route for MANAGER, SUPERVISOR, ADMIN

- [ ] T085 Add batch search page:
  - Create SearchPage or combine with DashboardPage
  - Show recent batches (last 10)
  - BatchSearchBox component for manual search
  - Results list (batch ID, current stage, creation date)
  - Click row to navigate to batch detail

- [ ] T086 Optimize batch detail load time:
  - Lazy-load audit trail (initially hidden, load on expand)
  - Minimize payload size (only needed fields from API)
  - Target ≤5s display time for batch detail page

- [ ] T087 Add export functionality:
  - PDF export: format audit trail nicely, include batch summary
  - CSV export: tabular format, include all fields
  - Both formats include timestamp of export, user who exported
  - Test PDF/CSV downloads work on mobile

- [ ] T088 Add mobile responsiveness to batch detail:
  - Test on 320px (iPhone SE), 375px, 768px (iPad)
  - Timeline may need to be horizontal scroll on small screens
  - Audit table may need to collapse columns on mobile
  - Ensure readability without horizontal scroll

**Checkpoint**: Batch traceability complete. Managers can search and view full batch history. Ready for Phase 6.

---

## Phase 6: User Story 4 - Worker Stage Completion Logging (Priority: P1)

**Goal**: Factory floor workers can quickly log stage completion via mobile interface with minimal input (batch ID scan/select, confirmation). System records transition with timestamp and worker ID. Supports offline queuing with visual sync status.

**Independent Test**: (1) Login as WORKER on mobile device, (2) View "My Current Work" with assigned batches, (3) Select batch and click "Log Stage Completion", (4) Confirm in dialog, (5) Verify batch moved to next stage, (6) See confirmation message, (7) Test undo within 5s, (8) Test offline mode queues request, (9) Mobile responsive and fast

**Acceptance Criteria**:
- ✅ "My Current Work" displays worker's assigned batches
- ✅ "Log Stage Completion" dialog shows batch ID, current stage
- ✅ Confirmation recorded within 5 seconds
- ✅ Batch moves to next stage immediately (optimistic update)
- ✅ Undo available within 5s of completion
- ✅ Offline: completion queued locally, synced when online
- ✅ "⚠️ Queued - will sync when online" badge visible
- ✅ Quality check prerequisite blocks transition
- ✅ Mobile: large buttons (44px+), minimal scrolling
- ✅ Load time ≤2s on 4G

### Implementation Tasks for US4

- [ ] T089 [P] Create stage completion types in src/features/production/types/stageCompletion.types.ts:
  - StageCompletionRequest: { batch_id, to_stage, notes, worker_id, timestamp }
  - StageCompletionResponse: { success, batch, message }

- [ ] T090 [P] Create stage completion service in src/features/production/services/stageCompletionService.ts:
  - logStageCompletion(batch_id) - POST /batches/{batch_id}/stage-completion
  - undoStageCompletion(batch_id) - POST /batches/{batch_id}/undo (only within 5s window)
  - getMyCurrentWork() - GET /batches/my-work (returns batches assigned to current worker)
  - Error handling: 409 (batch already moved), 403 (quality check not passed), validation errors

- [ ] T091 [P] Create offline queue service in src/shared/services/offlineQueueService.ts:
  - Stores pending stage completion requests in IndexedDB
  - Tracks queue status: queued, syncing, synced, failed
  - Syncs queue when connection restored
  - Retries failed requests up to 3 times

- [ ] T092 [P] Create useStageTransition hook in src/features/production/hooks/useStageTransition.ts:
  - Calls stageCompletionService.logStageCompletion()
  - Handles offline: adds to queue if connection lost
  - Optimistic update: immediately update UI before server confirmation
  - Provides undo() function to reverse last 5 seconds
  - Returns { mutate, undo, isLoading, isOnline, queuedCount }

- [ ] T093 [P] Create StageCompletionForm component in src/features/production/components/StageCompletionForm.tsx:
  - Props: batch (Batch object), onSuccess (callback), onError (callback)
  - Modal/dialog with large touch-friendly buttons
  - Show: batch ID, current stage, estimated time in stage
  - Confirmation message: "Move [batch ID] from [current stage] to [next stage]?"
  - "Mark Complete" button (44px+ height, green, prominent)
  - "Cancel" button (44px+ height, neutral)
  - Spinner while submitting
  - Accessibility: focus trap in dialog, close on Escape key, role="dialog"

- [ ] T094 [P] Create QualityCheckAlert component in src/features/production/components/QualityCheckAlert.tsx:
  - Props: batch (Batch object)
  - If batch trying to advance past Quality stage but quality_status not PASSED:
    - Display error: "Cannot move to next stage: Quality check failed. Contact supervisor."
    - Block stage completion
    - Show quality result (pass/fail/defect details)

- [ ] T095 Create StageCompletionPage or "My Current Work" view in src/features/production/pages/MyWorkPage.tsx:
  - Shows list of batches assigned to current worker
  - Calls getMyCurrentWork() hook
  - Each batch shows:
    - Batch ID
    - Current stage
    - Time in current stage
    - "Log Completion" button
  - Clicking "Log Completion" opens StageCompletionForm dialog
  - On success: batch removed from list (moved to next stage)
  - Confirmation toast: "Batch ABC-123 completed Molding stage"
  - Undo button in toast (only within 5s window)
  - Mobile optimized: full-width list, large touch targets
  - WCAG: semantic HTML, aria-live toast, keyboard navigation

- [ ] T096 Create OfflineIndicator component in src/shared/components/OfflineIndicator.tsx:
  - Shows "⚠️ Offline - changes will sync when online" banner
  - Shown only when navigator.onLine = false
  - Sticky to bottom of page
  - Can be dismissed (hide until next offline event)
  - Gray/neutral styling

- [ ] T097 Create QueuedBadge component in src/shared/components/QueuedBadge.tsx:
  - Shown on batch cards when batch transition is pending sync
  - Badge text: "⚠️ Queued"
  - Shows retry button if manual sync needed
  - Disappears when synced
  - Accessible: aria-label "This action is queued and will sync when online"

- [ ] T098 Create useMyWork hook in src/features/production/hooks/useMyWork.ts:
  - Fetches worker's assigned batches via getMyCurrentWork()
  - Uses TanStack Query with staleTime 10000ms
  - Refetch on window focus
  - Manual refetch available
  - Returns { batches, isLoading, error, refetch }

- [ ] T099 Implement undo functionality:
  - Undo available only within 5-second window after completion
  - Calls stageCompletionService.undoStageCompletion()
  - Reverts batch to previous stage
  - Logs undo action in audit trail with timestamp
  - Removes from queue if pending sync
  - Toast notification: "Batch ABC-123 undo successful"

- [ ] T100 Integrate offline queue sync:
  - Add useConnectionStatus hook to MyWorkPage
  - Retry sync button when requests are queued
  - Show sync status: "Syncing..." → "✅ Synced" or "❌ Sync failed"
  - Auto-retry when connection restored (via syncService from Phase 2)

- [ ] T101 Optimize for mobile:
  - Test on 320px, 375px, 480px widths
  - Batch list cards full-width, no side padding wasted
  - Buttons 44px+ height for easy tapping
  - Single-column layout on mobile
  - Touch-friendly spacing between list items (min 8px gap)
  - No horizontal scroll needed

- [ ] T102 Add batch validation before logging:
  - Check batch exists and is in active state
  - Check worker has permission (assigned to this batch's stage)
  - Check quality prerequisite (if applicable)
  - Show helpful error message if validation fails

- [ ] T103 Test error scenarios:
  - Simulate network failure during submit → queued locally
  - Simulate duplicate submission → handled gracefully
  - Simulate authorization failure → show error
  - Simulate batch not found → show error
  - Simulate quality check failure → block transition with error

- [ ] T104 Add performance optimizations:
  - Lazy-load MyWorkPage (code-split)
  - Minimize re-renders (memoize batch list items)
  - Optimize network: request only fields needed
  - Target ≤2s page load on 4G

**Checkpoint**: Worker stage completion working. Workers can log completions on mobile, with offline support and undo. Ready for Phase 7.

---

## Phase 7: User Story 5 - Efficiency Reports & Waste Reduction (Priority: P2)

**Goal**: Generate automated efficiency reports showing average time per stage, bottleneck identification, waste patterns, scrap rates, and export for management review

**Independent Test**: (1) Navigate to Reports, (2) Select "Efficiency Analysis", (3) Choose date range, (4) Report generates with stage metrics, (5) Bottleneck stages highlighted, (6) Export to PDF works, (7) Drill-down view shows batch details, (8) Mobile responsive

**Acceptance Criteria**:
- ✅ Efficiency Analysis shows avg time per stage
- ✅ Stages ≥10% slower than baseline highlighted
- ✅ Scrap & Rework section shows defect counts by stage
- ✅ Charts/graphs show trend data (↑ slower, ↓ faster, → stable)
- ✅ Drill-down into stage shows batch details
- ✅ PDF export with charts, data, timestamp
- ✅ Date range selectable (last 7 days, 30 days, custom)
- ✅ Report generates in ≤10 seconds
- ✅ Accessible (semantic HTML, keyboard nav)
- ✅ Mobile responsive

### Implementation Tasks for US5

- [ ] T105 [P] Create report types in src/features/reports/types/reports.types.ts:
  - EfficiencyReport interface: { report_id, date_range, stages[], scrap_data, trends }
  - StageMetric interface: { stage_name, avg_duration, historical_avg, trend, bottleneck_flag }
  - ScrapData interface: { stage, defect_count, rework_rate, cost_impact }
  - Trend enum: UP | DOWN | STABLE

- [ ] T106 [P] Create report Zod schema in src/features/reports/types/reports.schema.ts:
  - efficiencyReportSchema validates API response
  - stageMetricSchema validates stage metrics
  - scrapDataSchema validates scrap data

- [ ] T107 [P] Create report service in src/features/reports/services/reportService.ts:
  - fetchEfficiencyReport(dateRange) - GET /reports/efficiency?start_date=&end_date=
  - exportEfficiencyReport(report_id, format) - GET /reports/{report_id}/export?format=pdf|csv
  - getBottleneckStages(dateRange) - GET /reports/bottlenecks?start_date=&end_date=
  - getScrapAnalysis(dateRange) - GET /reports/scrap?start_date=&end_date=
  - Error handling for date validation, data not available

- [ ] T108 [P] Create useReportsData hook in src/features/reports/hooks/useReportsData.ts:
  - Fetches efficiency report via reportService.fetchEfficiencyReport()
  - Uses TanStack Query with staleTime 60000ms (60s, less critical)
  - Accepts dateRange param
  - Returns { data: EfficiencyReport, isLoading, error, refetch }

- [ ] T109 [P] Create EfficiencyChart component in src/features/reports/components/EfficiencyChart.tsx:
  - Props: stages (StageMetric[])
  - Bar chart showing avg duration per stage
  - Color code: green (on-target), yellow (attention), red (behind)
  - X-axis: stage names, Y-axis: hours/duration
  - Tooltip shows exact values on hover
  - Legend shows historical baseline
  - Responsive width (100% of container)
  - Accessible: ARIA labels, can be described in text
  - Library: Recharts or Chart.js for charting

- [ ] T110 [P] Create WasteAnalysis component in src/features/reports/components/WasteAnalysis.tsx:
  - Props: scrapData (ScrapData[])
  - Section showing scrap by stage
  - Table: Stage, Defect Count, Rework Rate (%), Cost Impact ($)
  - Pie chart or bar chart showing defect distribution
  - Highlights stage with highest waste
  - Sortable by column (default: cost impact descending)
  - Responsive table (may scroll horizontally on mobile)

- [ ] T111 [P] Create BottleneckReport component in src/features/reports/components/BottleneckReport.tsx:
  - Props: stages (StageMetric[])
  - Lists stages that are ≥10% slower than historical baseline
  - For each bottleneck: stage name, current avg, baseline avg, % difference, trend
  - Alert styling (yellow/amber) for attention
  - "Investigate" link to drill-down view
  - Exportable list (included in PDF export)

- [ ] T112 Create ReportsPage in src/pages/ReportsPage.tsx:
  - Route: /reports
  - Tab 1: Efficiency Analysis (default)
  - Tab 2: Scrap Analysis
  - Tab 3: Trend Analysis
  - Date range selector (date picker, preset: Last 7 Days, Last 30 Days, Custom)
  - "Generate Report" button
  - Show LoadingSpinner while generating
  - On success, display:
    - EfficiencyChart
    - BottleneckReport
    - WasteAnalysis
  - "Export to PDF" button → downloads report
  - "Export to CSV" button → downloads data table
  - Role check: MANAGER or ADMIN can view
  - Breadcrumb: Dashboard → Reports → Efficiency Analysis

- [ ] T113 Create DrillDownView for stage (optional detailed view):
  - Show batches in selected stage during selected date range
  - List: batch ID, stage duration, quality result, rework status
  - Sortable, filterable by status
  - Link back to batch detail via batch ID

- [ ] T114 [P] Create export functionality:
  - PDF export: includes charts, summary metrics, timestamp, user who exported
  - CSV export: tabular data (stages, metrics, scrap data)
  - Both formats include: report name, date range, organization, footer with export timestamp
  - Test download works on mobile browsers

- [ ] T115 [P] Create date range selector component in src/shared/components/DateRangeSelector.tsx:
  - Preset options: Last 7 Days, Last 30 Days, Last 90 Days
  - Custom date range picker (start_date, end_date)
  - Calendar or text input for custom dates
  - Validation: start_date ≤ end_date
  - Keyboard accessible (Tab, Enter to select)

- [ ] T116 Optimize report generation performance:
  - Target ≤10s report generation time
  - Use pagination if data is large (100+ batches)
  - Cache charts (recharts/chart.js handle memoization)
  - Lazy-load chart components (load when tab selected)

- [ ] T117 Add mobile responsiveness to reports:
  - Charts responsive (100% width, max-width 800px)
  - Tables collapse to list view on mobile (show key fields)
  - Date picker mobile-friendly (native date picker on mobile)
  - Export buttons visible and accessible
  - No horizontal scroll needed

- [ ] T118 Add accessibility to reports:
  - Semantic HTML: `<section>`, `<table>` elements
  - Chart descriptions in text (not visual only)
  - Color + icons/text for bottleneck indicators
  - Keyboard navigation through tabs and date picker
  - ARIA labels on charts and data

- [ ] T119 Add error handling for report generation:
  - No data available for date range → show message
  - API error → show friendly error + retry button
  - Invalid date range → show validation error

**Checkpoint**: Efficiency reporting complete. Managers can generate reports, identify bottlenecks, and export data. Ready for Phase 8.

---

## Phase 8: User Story 6 - Quality Control Workflow (Priority: P2)

**Goal**: Quality controllers can record inspection results, document defects, and approve/reject batches with structured workflow and reason codes

**Independent Test**: (1) Login as QUALITY_CONTROLLER, (2) Navigate to Quality Inspections, (3) Select batch in Quality stage, (4) Fill inspection form, (5) Record pass/fail/conditional, (6) Document defects if needed, (7) Submit approval/rejection, (8) Batch routes correctly (pass→packaging, fail→finishing), (9) Audit trail logs decision

**Acceptance Criteria**:
- ✅ Batches waiting in Quality stage displayed
- ✅ Inspection form shows batch info, acceptance criteria
- ✅ Pass/Fail/Conditional result options
- ✅ Defect recording with reason codes
- ✅ Photos can be attached (optional)
- ✅ Reject routes batch back to previous stage
- ✅ Conditional routes to rework queue
- ✅ Inspector name logged, approval timestamp recorded
- ✅ Audit trail captures all decisions
- ✅ Mobile responsive
- ✅ ≤3 min per batch inspection workflow

### Implementation Tasks for US6

- [ ] T120 [P] Create quality types in src/features/quality/types/quality.types.ts:
  - QualityInspection interface: { inspection_id, batch_id, result, defect_count, defect_details[], approval_timestamp }
  - DefectRecord interface: { defect_id, defect_type, location, quantity, severity, photo_url }
  - DefectType enum: SurfaceDefects | DimensionalOOT | StructuralFailure | ColorIssue | Contamination | Other
  - QualityResult enum: PASS | FAIL | CONDITIONAL

- [ ] T121 [P] Create quality Zod schema in src/features/quality/types/quality.schema.ts:
  - qualityInspectionSchema validates inspection form submission
  - defectRecordSchema validates defect details
  - Runtime validation for reason codes

- [ ] T122 [P] Create quality service in src/features/quality/services/qualityService.ts:
  - getBatchesInQuality() - GET /batches/quality-queue returns batches awaiting inspection
  - submitQualityInspection(batch_id, result, defects) - POST /batches/{batch_id}/quality-inspection
  - getQualityDefectCodes() - GET /reference/defect-codes returns standardized codes
  - Error handling: 409 (batch already inspected), 403 (user not QC role)

- [ ] T123 [P] Create useQualityInspection hook in src/features/quality/hooks/useQualityInspection.ts:
  - Calls qualityService.submitQualityInspection()
  - Handles form validation via Zod
  - Optimistic update: batch removed from queue on submit
  - Returns { mutate, isLoading, error }

- [ ] T124 [P] Create QualityInspectionForm component in src/features/quality/components/QualityInspectionForm.tsx:
  - Props: batch (Batch object), onSuccess (callback)
  - Form fields:
    - Read-only batch ID, material type, previous stage completion time
    - Acceptance criteria (display requirements)
    - Result radio buttons: PASS, FAIL, CONDITIONAL
    - Conditional: show rework steps if selected
  - Uses React Hook Form + Zod for validation
  - Conditional rendering: defect section shown only if result = FAIL
  - Submit button: "Approve" (if PASS), "Reject" (if FAIL), "Approve with Rework" (if CONDITIONAL)
  - Cancel button to close form
  - Loading spinner while submitting

- [ ] T125 [P] Create DefectRecorder component in src/features/quality/components/DefectRecorder.tsx:
  - Props: onDefectsChange (callback)
  - Add defect button opens dialog/form
  - Defect form fields:
    - Defect type dropdown (reason codes: SurfaceDefects, DimensionalOOT, etc.)
    - Location text (where on batch)
    - Quantity number
    - Severity level 1-5 (selector)
    - Optional photo upload
  - Displays list of recorded defects
  - Each defect has Edit/Delete buttons
  - Validation: at least 1 defect required if FAIL result
  - Accessible form with ARIA labels

- [ ] T126 [P] Create ApprovalWorkflow component in src/features/quality/components/ApprovalWorkflow.tsx:
  - Props: batch (Batch object), result (QualityResult), onSubmit (callback)
  - Displays workflow confirmation:
    - If PASS: "Batch approved. Will move to Packaging stage."
    - If FAIL: "Batch rejected. Will return to Finishing stage." + "Enter rejection reason"
    - If CONDITIONAL: "Batch approved with rework. Route to rework queue."
  - Reason dropdown (rejection codes) required if FAIL
  - Timestamp display: "Approval time: [current time]"
  - Inspector name from auth context
  - Submit and Cancel buttons
  - Accessible: role="dialog" if modal, semantic form structure

- [ ] T127 Create QualityInspectionPage in src/pages/QualityInspectionPage.tsx:
  - Route: /quality (or /quality-inspections)
  - Shows list of batches waiting in Quality stage
  - Calls useQualityQueue hook
  - Each batch card shows:
    - Batch ID
    - Material type
    - Time waiting in Quality (if >24h, highlight with alert)
    - "Inspect" button (opens inspection form)
  - Form modal/dialog overlay on batch click
  - On successful submission:
    - Batch removed from list
    - Toast: "Batch ABC-123 approved" or "Batch ABC-123 rejected"
    - Page refetches queue
  - Role check: QUALITY_CONTROLLER
  - Breadcrumb: Dashboard → Quality Inspections
  - WCAG 2.1 AA: semantic table or list, keyboard nav

- [ ] T128 [P] Create useQualityQueue hook in src/features/quality/hooks/useQualityQueue.ts:
  - Fetches batches in quality stage via getBatchesInQuality()
  - Uses TanStack Query with staleTime 10000ms
  - Returns { batches, isLoading, error, refetch }

- [ ] T129 [P] Create DefectCodeSelector component in src/shared/components/DefectCodeSelector.tsx:
  - Dropdown or multi-select showing standardized defect reason codes
  - Options: Surface Defects, Dimensional Out-of-Tolerance, Structural Failure, Color Issue, Contamination, Other
  - Maps to enum values for API submission
  - Keyboard accessible

- [ ] T130 Add rejection reason codes:
  - Create constant file src/shared/utils/qualityReasons.ts
  - Export array of rejection codes: [{ code, label, description }]
  - Used in DefectCodeSelector and ApprovalWorkflow

- [ ] T131 [P] Create time-in-quality indicator component:
  - Shows elapsed time batch has been waiting in Quality
  - Flags as alert if >24 hours
  - Used in batch list and form
  - Updates every 10 seconds (real-time display)

- [ ] T132 Implement workflow routing after approval:
  - PASS: batch automatically moves to Packaging
  - FAIL: batch returned to Finishing stage (with rework note)
  - CONDITIONAL: batch routed to designated rework queue/stage
  - Audit log records routing decision

- [ ] T133 Add photo upload to defect recording (optional):
  - File input for image upload (PNG, JPG, WebP)
  - Preview thumbnail after selection
  - Compress image before upload (reduce size)
  - Upload via multipart form data
  - Store photo URL with defect record

- [ ] T134 Optimize quality workflow for speed:
  - Minimize form inputs (pre-fill where possible)
  - Clear/hide irrelevant fields based on result selection
  - Target ≤3 min per batch inspection
  - Lazy-load defect codes on form open

- [ ] T135 Add mobile responsiveness to quality:
  - Test on 320px, 375px, 768px
  - Batch list single-column on mobile
  - Form modal stacks vertically, scrollable if needed
  - Buttons 44px+ touch targets
  - Photo upload from camera on mobile devices

- [ ] T136 Add accessibility to quality workflow:
  - Semantic form structure (fieldset, legend for radio groups)
  - Color + icon/text for result indicators (not color-only)
  - ARIA labels on all form fields
  - Error messages with aria-live="polite"
  - Keyboard navigation (Tab, arrows, Enter to submit)

**Checkpoint**: Quality control workflow complete. QC controllers can inspect and approve/reject batches. Ready for Phase 9.

---

## Phase 9: User Story 7 - Data Integrity & Audit Trail (Priority: P2)

**Goal**: Every action in system (stage transitions, quality approvals, data modifications) logged with timestamp, user, and change details for compliance and audit

**Independent Test**: (1) Perform batch transition, (2) Access audit log for batch, (3) Verify all actions logged, (4) Check timestamp and user attributed, (5) Export audit log as CSV, (6) Verify immutability (cannot edit past entries)

**Acceptance Criteria**:
- ✅ Every batch action logged (stage transition, quality approval, rework)
- ✅ Log entry includes: timestamp (UTC), user ID, action type, batch ID, before/after values
- ✅ Reversals logged with reason
- ✅ Audit entries immutable (append-only, never edited)
- ✅ Audit trail viewable per batch
- ✅ Export audit trail as CSV with all fields
- ✅ Unauthorized access blocked with security log entry
- ✅ 100% of batch operations logged

### Implementation Tasks for US7

- [ ] T137 [P] Create audit types in src/features/audit/types/audit.types.ts:
  - AuditLogEntry interface: { entry_id, timestamp, user_id, action_type, affected_batch_id, before_value, after_value, reason, source }
  - ActionType enum: STAGE_TRANSITION | QUALITY_APPROVAL | QUALITY_REJECTION | DATA_EXPORT | SYSTEM_ALERT | USER_LOGIN | USER_LOGOUT | UNAUTHORIZED_ACCESS

- [ ] T138 [P] Create audit Zod schema in src/features/audit/types/audit.schema.ts:
  - auditLogEntrySchema validates log entry structure
  - Enforces immutability checks (cannot create entry with edit flag)

- [ ] T139 [P] Create audit service in src/features/audit/services/auditService.ts:
  - getAuditLog(batch_id) - GET /batches/{batch_id}/audit-trail returns all entries for batch
  - logAuditEntry(entry) - POST /audit-log (internal API call, not exposed to frontend directly)
  - exportAuditLog(batch_id, format) - GET /batches/{batch_id}/audit-trail/export?format=csv|pdf
  - Error handling: 403 (unauthorized access), validation errors

- [ ] T140 [P] Create API client interceptor for audit logging:
  - Auto-log successful batch mutations (POST/PUT/DELETE to /batches/*)
  - Include endpoint, method, payload, response
  - Log failures (errors) with error message
  - Attach user ID and timestamp automatically
  - Call logAuditEntry() for each mutation

- [ ] T141 Create audit trail middleware in apiClient.ts:
  - Intercept all POST/PUT/DELETE requests
  - Extract batch ID from URL if applicable
  - Log entry created with: timestamp, user_id, method, endpoint, success/failure
  - Before/after values captured where applicable
  - Error entries logged separately with error message

- [ ] T142 [P] Create AuditTrailViewer component (if not in Phase 5):
  - Already created in T081 (batch traceability)
  - Verify it's used here

- [ ] T143 Create audit log export functionality:
  - CSV export: comma-separated with headers
  - Columns: Timestamp, Action, User, Batch ID, Before Value, After Value, Reason
  - PDF export: formatted table with batch summary, export timestamp
  - Both include: organization, report date, user who exported
  - Accessible: semantic HTML for table data

- [ ] T144 Add immutability checks to backend API (documented, not coded):
  - Audit entries have created_at timestamp, no updated_at field
  - Database constraint: audit_log_entry table is append-only
  - No UPDATE or DELETE operations on audit entries
  - Only INSERT allowed
  - Documented in API contracts

- [ ] T145 Implement security logging:
  - Log unauthorized access attempts (401, 403)
  - Log failed quality approvals due to permission
  - Log admin actions (user management)
  - Log data exports (who exported, when)
  - Security logs kept separate from operation logs

- [ ] T146 Test audit trail completeness:
  - Perform stage transition, verify in audit log
  - Perform quality approval, verify in audit log
  - Perform quality rejection, verify in audit log
  - Perform data export, verify in audit log
  - Perform undo, verify reversal logged
  - Export audit trail, verify all entries included

- [ ] T147 Add audit timestamp consistency:
  - All timestamps in UTC (no local timezone)
  - Server-set timestamps (client time not trusted)
  - Format: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
  - Documented in API contracts

**Checkpoint**: Audit trail infrastructure complete. All actions logged immutably. Ready for Phase 10.

---

## Phase 10: User Story 8 - Mobile-First Dashboard Experience (Priority: P2)

**Goal**: Ensure all features work optimally on mobile devices (≤768px width) with touch-friendly interface, fast load time on 4G, and offline support

**Independent Test**: (1) Access dashboard on mobile (375px width), (2) Verify all content readable without horizontal scroll, (3) Test touch interactions (44px+ targets), (4) Verify load time ≤2s on throttled 4G, (5) Test offline mode queues requests, (6) Verify sync on reconnect

**Acceptance Criteria**:
- ✅ Responsive layout ≤768px (mobile), ≥768px (tablet/desktop)
- ✅ All interactive elements 44px+ touch targets
- ✅ No horizontal scroll required on 375px viewport
- ✅ Load time ≤2s on 4G (Chrome DevTools throttling)
- ✅ Color + icon/text (not color-only for status)
- ✅ Keyboard navigation works
- ✅ Screen reader announces all content
- ✅ Offline requests queued locally
- ✅ Sync badge visible for queued items

### Implementation Tasks for US8

- [ ] T148 [P] Audit responsive design across all pages:
  - Test at 320px (iPhone SE), 375px (iPhone 12), 768px (iPad)
  - Test portrait and landscape orientations
  - Verify no horizontal scroll at any width
  - Verify text is readable (font-size ≥14px on mobile)
  - Document any responsive issues found

- [ ] T149 [P] Verify touch targets on all interactive elements:
  - Buttons: ≥44px height and width
  - Links: ≥44px tap area
  - Form inputs: ≥44px height
  - Select/dropdown: ≥44px height
  - Checkboxes/radios: ≥44px tap area (expand hidden area if needed)
  - Spacing between buttons: ≥8px to prevent accidental adjacent taps

- [ ] T150 [P] Optimize mobile layout for stage cards:
  - Single column on mobile (≤375px)
  - Visible data per card: stage name, batch count, status badge
  - Expand on click for details (avg duration, trend)
  - Avoid excessive scrolling (max 5 cards visible without scroll)

- [ ] T151 [P] Optimize mobile layout for batch list:
  - Full-width cards on mobile
  - Batch ID, current stage, time info on one line
  - Single "Log Completion" button per card
  - Minimize horizontal spacing waste

- [ ] T152 [P] Optimize mobile layout for forms:
  - Single column layout
  - Full-width input fields
  - Large button with clear action text
  - Field labels above inputs (not placeholder-only)
  - Error messages inline below field
  - Support for mobile keyboard (number pad for numeric, email for email)

- [ ] T153 [P] Optimize mobile layout for tables:
  - If table has many columns, convert to card layout on mobile
  - Each "row" becomes a card with key fields visible
  - Details accessible via expand button
  - Audit trail may need horizontal scroll (acceptable for large data)

- [ ] T154 Optimize bundle size and load time:
  - Measure current bundle size: run `npm run build`, check dist/ size
  - Goal: ≤500KB gzipped
  - Code-split by route: each feature lazy-loads
  - Tree-shake unused code
  - Minify and compress CSS/JS

- [ ] T155 [P] Test load time on 4G:
  - Chrome DevTools: throttle to "4G" profile
  - Measure Core Web Vitals: LCP (largest contentful paint), FID (first input delay), CLS (cumulative layout shift)
  - Target: LCP ≤2s, FID ≤100ms, CLS ≤0.1
  - Profile with lighthouse: `npm run build && npm run preview`

- [ ] T156 [P] Optimize images for mobile:
  - Convert to WebP format with PNG fallback
  - Responsive images: use srcset with 2x resolution for high-DPI
  - Lazy-load images below fold (loading="lazy" attribute)
  - Compress lossy (quality 80-85)
  - Size budget: icons <10KB, images <50KB

- [ ] T157 [P] Optimize fonts for mobile:
  - Use system fonts or preload web fonts
  - Limit font variants (regular + bold, avoid light/extra-light on mobile)
  - font-display: swap (show fallback immediately, load web font asynchronously)
  - Test readability at 14px, 16px, 18px

- [ ] T158 [P] Test offline mode on mobile:
  - Simulate offline: DevTools → Network → Offline
  - Perform batch completion: should queue locally
  - Show "⚠️ Offline" badge
  - Simulate reconnect: DevTools → Network → Online or throttled 4G
  - Verify queued request syncs automatically within 10s
  - Verify sync success toast shown

- [ ] T159 [P] Test keyboard navigation on mobile:
  - Focus indicators visible (outline or border)
  - Tab through all interactive elements
  - Enter key activates buttons
  - Arrow keys work in select/dropdown
  - Escape closes modals
  - Works with external keyboard (if device supports)

- [ ] T160 [P] Test screen reader accessibility on mobile:
  - iOS: use VoiceOver (Settings → Accessibility → VoiceOver)
  - Android: use TalkBack (Settings → Accessibility → TalkBack)
  - Read all page content (headings, text, form labels)
  - Announce buttons and form fields
  - Test on sample pages (login, dashboard, batch detail)
  - Verify alt-text on images
  - Verify form fields have associated labels

- [ ] T161 [P] Test color contrast on mobile display:
  - Measure contrast ratio for all text on mobile screen
  - Goal: ≥4.5:1 for normal text, ≥3:1 for large text (18px+)
  - Use WebAIM contrast checker
  - Test on small 375px screen (text may appear different due to density)

- [ ] T162 [P] Test device orientation changes:
  - Rotate device from portrait to landscape
  - Verify layout adapts correctly
  - Verify user's input (form data) is preserved
  - Verify scroll position is preserved or user is at top

- [ ] T163 [P] Test mobile browser compatibility:
  - iOS Safari 12+
  - Chrome mobile
  - Firefox mobile
  - Samsung Internet
  - Verify all features work across browsers

- [ ] T164 [P] Test mobile touch interactions:
  - Single tap to activate buttons
  - Double-tap to zoom (should work smoothly, not too slow)
  - Swipe navigation (if any carousel/slider)
  - Long-press for context menu (if any)
  - Pinch-zoom to zoom page (should be allowed)

- [ ] T165 Add mobile performance profiling:
  - Run Lighthouse mobile audit
  - Record LCP, FID, CLS metrics
  - Target: Lighthouse score ≥80 on mobile
  - Create performance budget (max 500KB bundle)
  - Monitor on each build

**Checkpoint**: Mobile optimization complete. All features tested on mobile devices. Ready for Phase 11.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, performance optimization, error handling, documentation

**Dependencies**: Phases 1-10 complete

- [ ] T166 [P] Accessibility audit (WCAG 2.1 AA):
  - Run automated tools: axe DevTools, Lighthouse accessibility audit
  - Manual testing: keyboard navigation, screen reader testing (NVDA, JAWS, VoiceOver)
  - Checklist per page:
    - Semantic HTML (nav, main, section, article, form)
    - Heading hierarchy (H1 once per page, H2+ nested correctly)
    - Color contrast 4.5:1 for text, 3:1 for large text (18px+)
    - Focus indicators visible (outline or border)
    - Form labels associated (via `<label for>` or `aria-labelledby`)
    - Error messages associated with fields (aria-describedby)
    - Alt-text on images (concise, not "image" or "picture")
    - ARIA roles/labels where semantic HTML insufficient
  - Document findings and fixes
  - Re-test after fixes

- [ ] T167 [P] Performance optimization:
  - Code splitting: lazy-load each feature module
  - Bundle analysis: identify large dependencies
  - Remove unused CSS (PurgeCSS/Tailwind), unused JS (tree-shaking)
  - Image optimization: WebP, responsive sizes, lazy-loading
  - Font optimization: preload critical font, font-display: swap
  - Caching strategy: cache-busting hashes in filenames
  - Service Worker (optional): offline caching
  - Measure and document Core Web Vitals before/after

- [ ] T168 [P] Error handling & logging:
  - ErrorBoundary catches React errors (component render errors)
  - API error handler catches network/server errors
  - Form validation displays errors inline
  - Toast notifications for user actions (success/error/warning)
  - Error logging service: send errors to monitoring (optional: Sentry, LogRocket)
  - Error messages user-friendly (no technical jargon)
  - Logging not exposed in production (console.log removed)

- [ ] T169 [P] Create validation error messages guide:
  - Document all possible validation errors
  - Create helper function for error message display
  - Ensure all error messages are clear and actionable
  - Example: "Batch ID must be 10 characters (format: YYYY-MM-NNNNN)"

- [ ] T170 [P] Loading states & spinners:
  - LoadingSpinner for page loads
  - Skeleton screens for content placeholders (optional)
  - Button loading state: disabled + spinner inside
  - Form submission: disable button, show spinner
  - Perceived performance: optimistic updates (update UI before server confirms)

- [ ] T171 [P] Form error handling:
  - FormError component displays field-level errors
  - Validation on blur (immediate feedback)
  - Validation on submit (block submission if errors)
  - Clear existing error when user corrects field
  - Server-side errors displayed prominently
  - Accessibility: aria-describedby links error message to field

- [ ] T172 [P] Create environment configuration:
  - .env.example template with required variables
  - Build process injects environment variables at build-time
  - No secrets in frontend code
  - API base URL, Google Client ID, org ID configurable per environment
  - Document each environment variable purpose

- [ ] T173 [P] Create build configuration documentation:
  - Vite config: code splitting, bundling strategy
  - TailwindCSS config: design tokens, custom colors, dark mode
  - TypeScript config: strict mode, path aliases
  - ESLint/Prettier: code quality rules
  - Document build optimization flags

- [ ] T174 [P] Create development guide in README.md:
  - Prerequisites: Node.js 20+, npm/yarn
  - Setup instructions: clone, install dependencies, environment setup
  - Development server: `npm run dev`, open http://localhost:5173
  - Build production: `npm run build`
  - Testing: `npm run test` (if tests implemented)
  - Linting: `npm run lint`
  - Formatting: `npm run format`
  - Folder structure explanation
  - Key files explanation (routes.tsx, authService.ts, etc.)

- [ ] T175 Create API documentation guide:
  - Link to API contracts (specs/001-manufacturing-tracking/contracts/api-contracts.md)
  - Explain authentication flow (OAuth → session validation)
  - List main endpoints (auth, batches, quality, reports)
  - Error codes and handling strategy
  - Example request/response payloads
  - Testing with mock data

- [ ] T176 Create deployment guide:
  - Build steps: `npm run build`
  - Output directory: `dist/`
  - Deployment options: static hosting (Vercel, Netlify), Docker container, Azure App Service
  - Environment variables for production (API URL, Google Client ID)
  - Pre-deployment checklist: bundle size, performance metrics, accessibility audit
  - Rollback strategy

- [ ] T177 Create component usage guide:
  - Document all shared components (Header, Footer, StatusBadge, etc.)
  - Props, examples, accessibility notes
  - Storybook setup (optional): visual testing and documentation
  - Component file locations
  - When to use each component

- [ ] T178 [P] Create test checklist for QA:
  - Functional tests per user story (manual, per constitution)
  - Accessibility checklist per story
  - Performance benchmarks per story
  - Mobile tests (responsive, touch, offline)
  - Cross-browser tests (Chrome, Firefox, Safari, Edge)
  - Error scenario tests (network failure, API error, validation error)
  - Documentation: who to contact for issues

- [ ] T179 [P] Setup GitHub issue templates (optional):
  - Bug report template
  - Feature request template
  - Documentation update template

- [ ] T180 [P] Setup GitHub Actions CI/CD (optional):
  - Lint check: ESLint + Prettier
  - Build check: `npm run build` succeeds
  - Bundle size check: alert if >5% increase
  - Lighthouse audit: performance report on each PR
  - Accessibility audit: automated axe check

- [ ] T181 [P] Create deployment configuration (optional):
  - Docker config: Dockerfile + docker-compose.yml
  - Azure App Service: web.config or startup script
  - GitHub Pages: action to deploy dist/ to gh-pages
  - Document deployment process

- [ ] T182 Create final QA sign-off checklist:
  - [ ] All user stories P1 & P2 implemented
  - [ ] All features work per acceptance criteria
  - [ ] No console errors or warnings
  - [ ] Performance: ≤2s load time on 4G
  - [ ] Accessibility: WCAG 2.1 AA passing
  - [ ] Mobile: fully responsive, touch-friendly
  - [ ] Offline: queuing and sync working
  - [ ] Security: no XSS, CSRF, auth vulnerabilities
  - [ ] Documentation complete and accurate
  - [ ] Deployment successful to staging
  - [ ] Final UAT sign-off

- [ ] T183 [P] Create operations runbook:
  - Troubleshooting guide (common issues and solutions)
  - Monitoring setup: error tracking, performance monitoring
  - Backup/recovery procedures
  - Database migration strategy
  - Support contact information
  - Escalation procedures

- [ ] T184 Create release notes template:
  - Features added
  - Bugs fixed
  - Breaking changes (if any)
  - Upgrade instructions
  - Known issues
  - Support timeline

**Checkpoint**: All phases complete. System ready for deployment. All code is clean, accessible, performant, and well-documented.

---

## Implementation Strategy

### MVP Scope (Phase 1-6 only, ~4-6 weeks)
- ✅ Authentication via Google OAuth2
- ✅ Real-time production dashboard (30s polling)
- ✅ Batch traceability with timeline
- ✅ Worker stage completion logging (mobile-friendly)
- ✅ Offline queuing + sync
- 🔲 Reports, Quality Workflow, Audit Trail (Phase 2 - Post-MVP)

### Phase Breakdown by Timeline
- **Week 1**: Phase 1 (Setup) + Phase 2 (Foundational) - 36 tasks
- **Week 2**: Phase 3 (Auth) + Phase 4 (Dashboard) - 28 tasks
- **Week 3**: Phase 5 (Batch Tracking) + Phase 6 (Stage Completion) - 29 tasks
- **Week 4**: Phase 7 (Reports) + Phase 8 (Quality) - 27 tasks
- **Week 5**: Phase 9 (Audit) + Phase 10 (Mobile Polish) - 37 tasks
- **Week 6**: Phase 11 (Polish & Docs) - 19 tasks

**Total**: 176 tasks across 11 phases

### Parallelization Opportunities
- **Phase 1**: All setup tasks [P] can run in parallel (install dependencies, configure tools)
- **Phase 2**: Core services, hooks, and components [P] can be developed in parallel (auth, API, routing)
- **Phase 3-10**: Feature modules can run in parallel after foundational work (auth, dashboard, production, quality, reports)
- **Phase 11**: Accessibility, performance, testing [P] can run in parallel by component

### Quality Gates
- ✅ **End of Phase 1**: Project builds, no TypeScript errors
- ✅ **End of Phase 2**: All foundational services tested locally
- ✅ **End of Phase 3**: Authentication flow works end-to-end
- ✅ **End of Phase 4**: Dashboard loads and updates in real-time
- ✅ **End of Phase 6**: MVP ready for user testing
- ✅ **End of Phase 11**: All phases complete, ready for production

---

## Dependencies Chart

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
    ├─→ Phase 3 (US1: Auth)
    │       ↓
    │   Phase 4 (US2: Dashboard)
    │   Phase 5 (US3: Batch Tracking)
    │   Phase 6 (US4: Stage Completion)
    │
    ├─→ Phase 7 (US5: Reports)
    ├─→ Phase 8 (US6: Quality)
    ├─→ Phase 9 (US7: Audit)
    └─→ Phase 10 (US8: Mobile)
            ↓
        Phase 11 (Polish & QA)
```

---

## Success Criteria: Phase Checkpoints

Each phase must meet acceptance criteria before proceeding:

- [ ] **Phase 1 Complete**: `npm run build` succeeds, no TypeScript errors, folder structure matches plan.md
- [ ] **Phase 2 Complete**: API client works, auth context provides session, routing guards block unauthorized access
- [ ] **Phase 3 Complete**: User can login via Google OAuth, session persists, logout clears session
- [ ] **Phase 4 Complete**: Dashboard loads with 8 stage cards, updates every 30 seconds, mobile responsive
- [ ] **Phase 5 Complete**: Search finds batches, timeline shows all stages, audit trail viewable
- [ ] **Phase 6 Complete**: Worker can log stage completion on mobile, offline requests queued, undo works
- [ ] **Phase 7 Complete**: Reports generated in ≤10s, bottleneck stages highlighted, export to PDF works
- [ ] **Phase 8 Complete**: QC can inspect and approve/reject batches, routing correct, audit logged
- [ ] **Phase 9 Complete**: Audit trail complete for all batch actions, immutable, exportable
- [ ] **Phase 10 Complete**: All features work on 375px screen, load time ≤2s on 4G, offline mode works
- [ ] **Phase 11 Complete**: WCAG 2.1 AA passing, no console errors, bundle <500KB, Lighthouse ≥90

---

**Next Step**: Execute Phase 1 tasks → verify Phase 1 checkpoint → proceed to Phase 2.

Generated: 2026-08-01 | Task Count: 184 | User Stories: 8 (P1-P2) | Phases: 11 | Estimated Duration: 6 weeks (1 dev) | Parallelization: High (50%+ tasks can run in parallel by module)
