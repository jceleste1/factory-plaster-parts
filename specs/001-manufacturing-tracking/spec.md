# Feature Specification: Gypsum Tile Manufacturing Tracking System

**Feature Branch**: `001-manufacturing-tracking`

**Created**: 2026-08-01

**Status**: Draft

**Input**: Comprehensive gypsum tile manufacturing tracking system with Google OAuth2 authentication, real-time production visibility, batch traceability, and efficiency reporting across 8 manufacturing stages.

## User Scenarios & Testing

### User Story 1 - Authenticate via Google OAuth2 and Access Dashboard (Priority: P1)

Users initiate access to the manufacturing control system by authenticating through Google OAuth2, establishing secure federated identity without managing separate credentials. Post-authentication, users are immediately presented with their role-appropriate manufacturing dashboard providing immediate visibility into relevant production operations.

**Why this priority**: Authentication is the gateway to all system functionality. Without P1-grade OAuth2 integration and dashboard access, no other features are accessible. This represents the foundational user journey that unblocks all downstream workflows.

**Independent Test**: Can be fully tested by: (1) navigating to login page, (2) clicking "Sign in with Google", (3) completing Google OAuth flow, (4) verifying redirect to role-appropriate dashboard. Delivers complete secure entry point to the system.

**Acceptance Scenarios**:

1. **Given** user is not authenticated and visits the application, **When** user clicks "Sign in with Google", **Then** browser redirects to Google OAuth consent screen
2. **Given** user completes Google OAuth authentication, **When** authentication succeeds, **Then** user is redirected to manufacturing dashboard and user's full name and company role are displayed
3. **Given** user is authenticated, **When** user clicks "Logout", **Then** session is cleared, user is redirected to login page, and subsequent navigation to dashboard redirects back to login
4. **Given** user completed OAuth authentication previously, **When** user returns to application within 30 days, **Then** user is automatically authenticated and taken to dashboard (session restoration)
5. **Given** user's Google account is removed from OAuth provider list, **When** user attempts login, **Then** system displays error message "This Google account is not authorized. Please contact your administrator." and login is blocked

---

### User Story 2 - Supervisor Views Real-Time Production Status Across All Stages (Priority: P1)

Supervisors require immediate, at-a-glance visibility into production status across all eight manufacturing stages. The dashboard displays current batch count, stage distribution, production velocity metrics, and stage-level bottlenecks without requiring manual refresh or navigation into individual batch records.

**Why this priority**: Real-time visibility is the core value proposition of the system. Supervisors make critical decisions (stage prioritization, resource allocation, line adjustments) based on current production state. Without this, the system fails to deliver manufacturing intelligence.

**Independent Test**: Can be fully tested by: (1) logging in as supervisor role, (2) verifying dashboard loads with current production data, (3) confirming all 8 stages display with batch counts, (4) simulating stage completion and confirming dashboard updates within 30 seconds. Delivers complete operational visibility.

**Acceptance Scenarios**:

1. **Given** supervisor logs in and dashboard loads, **When** page renders, **Then** all 8 manufacturing stages (Planning, Mixing, Molding, Curing, Finishing, Quality, Packaging, Shipping) are visible with current batch counts
2. **Given** dashboard is displayed, **When** supervisor views stage cards, **Then** each stage shows: total batches in stage, time spent in stage, previous stage completion date, and next stage readiness indicator (green/yellow/red)
3. **Given** real production update occurs (e.g., batch moves from Molding to Curing), **When** update is recorded in system, **Then** dashboard updates within 30 seconds showing new stage distribution
4. **Given** multiple batches exist across stages, **When** supervisor views the dashboard, **Then** stages are visually color-coded (green=on-target, yellow=attention-needed, red=behind-schedule) based on stage-specific SLAs
5. **Given** supervisor views stage with 0 active batches, **When** that stage is displayed, **Then** stage card shows "No active batches" with link to view last completed batch details
6. **Given** dashboard is loaded on mobile device (mobile-first), **When** screen width is ≤768px, **Then** stage cards stack vertically, data remains readable, and all interactive elements have minimum 44px touch targets

---

### User Story 3 - Production Manager Tracks Batch Traceability from Start to Expedition (Priority: P1)

Production managers need complete traceability of any batch from initial production planning through final shipment. Selecting a batch displays its complete manufacturing journey: which stages it passed through, timestamps for each stage transition, materials used, quality results, and current shipping status.

**Why this priority**: Rastreabilidade (traceability) is a constitutional requirement and critical for quality assurance, compliance, and root-cause analysis. Managers must answer "Where did batch XYZ go and what happened to it?" in seconds, not hours.

**Independent Test**: Can be fully tested by: (1) searching for specific batch ID, (2) displaying batch detail view, (3) verifying complete timeline from Planning → Shipping, (4) confirming all timestamps and stage metadata are displayed, (5) exporting batch audit trail. Delivers end-to-end traceability.

**Acceptance Scenarios**:

1. **Given** production manager is on dashboard, **When** manager enters batch ID in search box, **Then** matching batch is displayed with all stage history
2. **Given** batch detail view is open, **When** page renders, **Then** timeline shows all 8 stages in order with: stage name, entry timestamp, exit timestamp, duration, responsible worker, and stage-specific notes
3. **Given** batch completed Quality stage, **When** manager views batch detail, **Then** quality check results are displayed (pass/fail status, defect count, defect types, inspector name, approval timestamp)
4. **Given** batch is in Shipping stage, **When** manager views batch detail, **Then** shipping information is displayed (destination, carrier, tracking number, expected delivery, shipping date)
5. **Given** batch passed through Molding stage, **When** manager clicks on Molding in timeline, **Then** detailed Molding records appear showing: material batch used, mold type, mold temperature, setup time, cycle time, exit inspection results
6. **Given** manager views batch with multiple revisions or reworks, **When** timeline is displayed, **Then** rework cycles are clearly marked with reason for rework, timestamp, and responsible supervisor
7. **Given** batch detail is displayed, **When** manager clicks "Export Audit Trail" button, **Then** PDF or CSV file downloads with complete batch history including all timestamps, user actions, quality data, and deviations

---

### User Story 4 - Worker Logs Stage Completion and Updates Batch Status (Priority: P1)

Factory floor workers need a simple, unambiguous interface to log when they complete work on a batch and move it to the next stage. The workflow must be mobile-friendly, require minimal typing, and provide immediate confirmation that status update was recorded.

**Why this priority**: Workers are the ones creating the data. Without reliable, easy data entry from the shop floor, traceability breaks and real-time visibility becomes unreliable. This is foundational to system integrity.

**Independent Test**: Can be fully tested by: (1) logging in as worker role on mobile device, (2) navigating to "My Current Work", (3) scanning or selecting a batch, (4) clicking "Stage Complete", (5) confirming batch moved to next stage on dashboard. Delivers reliable data entry.

**Acceptance Scenarios**:

1. **Given** worker logs in with mobile device, **When** worker opens application, **Then** "My Current Work" screen displays batches assigned to worker with stage name and batch ID
2. **Given** worker is viewing assigned batch, **When** worker clicks "Log Stage Completion", **Then** confirmation dialog appears showing: current stage name, batch ID, estimated time in stage, and "Mark Complete" button
3. **Given** worker confirms stage completion, **When** worker clicks "Mark Complete", **Then** batch moves to next stage, timestamp is recorded, worker's ID is logged, and confirmation message "Batch ABC-123 completed Molding stage" displays for 3 seconds
4. **Given** worker accidentally clicks "Mark Complete", **When** worker clicks "Undo" within 5 seconds, **Then** stage transition is reversed and batch returns to previous stage with note "Incorrectly marked complete by Worker ID, reverted by Worker ID at HH:MM"
5. **Given** worker's device loses internet connection during stage completion, **When** connection is lost, **Then** completion is queued locally, worker sees "Queued - will sync when online", and update is sent to server when connection is restored
6. **Given** worker attempts to move batch to next stage, **When** previous stage quality check failed, **Then** error displays "Cannot move to next stage: Quality check failed. Contact supervisor." and stage transition is blocked
7. **Given** worker completes stage on mobile device at factory floor, **When** field is small/noisy, **Then** app uses large buttons (minimum 44px), high contrast text (≥4.5:1 ratio), and optional barcode scanner integration instead of manual typing

---

### User Story 5 - System Generates Efficiency Reports and Identifies Waste Reduction Opportunities (Priority: P2)

Managers need automated reports showing production efficiency metrics: average time per stage, bottleneck identification, waste patterns, scrap rates by stage, and predictive alerts for stages trending behind schedule. Reports should be viewable in dashboard and exportable for management review.

**Why this priority**: Efficiency reporting enables continuous improvement and waste reduction (constitutional principles). P2 because real-time tracking (P1) must work first; efficiency optimization is the secondary insight layer.

**Independent Test**: Can be fully tested by: (1) navigating to Reports section, (2) selecting "Efficiency Analysis" report type, (3) choosing date range, (4) verifying report displays stage metrics and waste patterns, (5) downloading PDF export. Delivers actionable optimization data.

**Acceptance Scenarios**:

1. **Given** manager navigates to Reports section, **When** page loads, **Then** "Efficiency Analysis" option is available alongside other report types
2. **Given** manager opens Efficiency Analysis report, **When** report generates (date range: last 7 days), **Then** report displays: average time per stage, trend arrows (↑ slower, ↓ faster, → stable), stage ranking from fastest to slowest
3. **Given** Efficiency Analysis report is displayed, **When** manager reviews data, **Then** stages trending ≥10% slower than historical average are highlighted in yellow with alert icon
4. **Given** historical data shows Curing stage averages 4 days, **When** current week shows 4.8 days, **Then** report flags "Curing stage 20% slower than average" and suggests investigation
5. **Given** multiple batches show defects requiring rework, **When** Efficiency report generates, **Then** "Scrap & Rework" section displays: defect count by stage, rework rate by stage (%), cost impact of rework
6. **Given** manager views Efficiency report, **When** manager clicks "Export to PDF", **Then** professional PDF downloads containing: charts for all metrics, detailed data table, timestamp of report generation, and prepopulated fields for manager notes
7. **Given** report identifies Packaging as bottleneck (longest stage duration), **When** manager clicks on that stage, **Then** drill-down view shows: all batches currently in Packaging, individual batch details, and comparison to other facilities (if available)
8. **Given** efficiency data is available, **When** manager views dashboard, **Then** widget shows "Production Velocity: 47 batches/day" and "Bottleneck Alert: Curing stage" without requiring report navigation

---

### User Story 6 - Quality Controller Records Inspection Results and Approvals (Priority: P2)

Quality controllers need a structured workflow to inspect batches in the Quality stage, record pass/fail results, document defects, and approve or reject batches. Rejections must include reason codes to enable root-cause tracking.

**Why this priority**: Quality control is critical for product integrity but comes after batches reach the Quality stage. P2 because it's essential but only affects batches reaching that stage.

**Independent Test**: Can be fully tested by: (1) logging in as quality controller, (2) selecting batch in Quality stage, (3) recording inspection (pass/fail/conditional), (4) adding defect documentation if needed, (5) submitting approval. Delivers quality gate enforcement.

**Acceptance Scenarios**:

1. **Given** quality controller logs in, **When** controller views dashboard, **Then** "Quality Inspections" section displays batches waiting in Quality stage with batch ID, entry time, and material type
2. **Given** quality controller selects a batch for inspection, **When** inspection form loads, **Then** form displays: batch ID, material type used, previous stage completion timestamp, acceptance criteria, and empty result fields
3. **Given** quality controller completes inspection and batch passes, **When** controller selects "Approve" and submits, **Then** batch moves to Packaging stage, timestamp is recorded, and controller's name is logged
4. **Given** quality controller finds defects, **When** controller selects "Reject", **Then** rejection reason dropdown appears with standardized codes: (Surface Defects, Dimensional OOT, Structural Failure, Color Issue, Contamination, Other)
5. **Given** batch is rejected with reason "Surface Defects", **When** controller submits rejection, **Then** batch returns to Finishing stage with note "Quality rejected: Surface Defects - Inspector [Name]" and supervisor is notified
6. **Given** batch has minor defects not warranting full rejection, **When** controller selects "Approve with Rework", **Then** batch moves to designated rework queue and required rework steps are displayed
7. **Given** quality controller records multiple defects, **When** controller documents each defect (quantity, location, severity), **Then** system categorizes data for root-cause analysis and waste reduction reporting
8. **Given** batch approval is recorded, **When** manager views batch traceability later, **Then** complete inspection results are visible including: approval date/time, inspector name, defect details, and photos (if attached)

---

### User Story 7 - System Enforces Data Integrity with Complete Audit Trail (Priority: P2)

Every action in the system (stage transitions, quality approvals, efficiency updates) is logged with timestamp, responsible user, and change details. The audit trail enables compliance verification, investigation of production anomalies, and accountability.

**Why this priority**: Data integrity is a constitutional requirement and essential for regulatory compliance, but is a background feature that doesn't directly affect user workflows. P2 ensures it's implemented but not the critical path.

**Independent Test**: Can be fully tested by: (1) performing a series of batch transitions and quality checks, (2) accessing audit trail view, (3) verifying every action is logged with user, timestamp, and details, (4) exporting audit log. Delivers compliance-grade traceability.

**Acceptance Scenarios**:

1. **Given** worker logs stage completion, **When** update is recorded, **Then** system creates audit entry: timestamp (YYYY-MM-DD HH:MM:SS UTC), worker ID, action ("Stage transition"), batch ID, from_stage, to_stage
2. **Given** quality controller approves or rejects a batch, **When** decision is submitted, **Then** audit entry records: timestamp, controller ID, action ("Quality approval/rejection"), batch ID, result (Pass/Fail/Conditional), defect_details
3. **Given** production data is being viewed, **When** authorized user (audit reviewer) accesses audit log viewer, **Then** user can filter by: date range, batch ID, user ID, action type, and results are displayed in reverse chronological order
4. **Given** sensitive action occurs (stage reversal due to error), **When** action is logged, **Then** audit entry includes: reason for reversal, approving supervisor, timestamp, and original and new values
5. **Given** batch data needs to be investigated, **When** manager exports audit trail for batch ABC-123, **Then** export includes all associated entries with complete audit context (who did what, when, why)
6. **Given** system processes a stage transition, **When** transition completes, **Then** audit entry is atomic and immutable (cannot be edited after creation, only new entries created if reversal occurs)
7. **Given** unauthorized user attempts to access audit logs, **When** user navigates to audit section, **Then** access is denied and denial is logged as security event

---

### User Story 8 - Mobile-First Dashboard Experience for Factory Floor (Priority: P2)

Workers and supervisors accessing the system on factory floor need a mobile-optimized interface that functions on 4G/limited bandwidth, displays critical information without excessive scrolling, and provides quick access to key functions (batch search, status update, next stage navigation).

**Why this priority**: Mobile-first is a constitutional principle, and P2 because the system works on desktop first (P1) but factory floor operations require mobile optimization to be practical.

**Independent Test**: Can be fully tested by: (1) accessing dashboard on mobile device ≤768px width, (2) verifying all information is readable without horizontal scroll, (3) testing touch interactions, (4) confirming load time on 4G is ≤2 seconds. Delivers factory floor usability.

**Acceptance Scenarios**:

1. **Given** worker accesses application on mobile device with screen width 375px, **When** dashboard loads, **Then** layout adapts with: stage cards stack vertically, batch list displays single-column layout, interactive elements have ≥44px touch targets
2. **Given** mobile dashboard is displayed, **When** worker needs to log stage completion, **Then** "Quick Action" button is prominently placed (bottom-right, sticky footer, or top navigation) and requires ≤2 taps to reach completion dialog
3. **Given** worker is on factory floor with weak 4G signal (2G speeds), **When** worker opens batch search, **Then** page loads within 2 seconds (graceful degradation: lower-resolution images, minimal animations, essential data only)
4. **Given** mobile page is fully loaded, **When** user views color-coded status indicators (green/yellow/red), **Then** colors are not sole indicator of status—icons or text labels are also used to ensure color-blind accessibility
5. **Given** worker is viewing batch details on mobile, **When** batch has extensive data (many defects, multiple stage transitions), **Then** data is organized in collapsible sections and worker can navigate without excessive scrolling
6. **Given** worker is on mobile device, **When** worker uses "Back" or "Close" button in app, **Then** navigation is intuitive and matches mobile OS conventions (iOS or Android)
7. **Given** application is loaded on mobile, **When** device orientation changes from portrait to landscape, **Then** layout adapts correctly and user's position in form/view is preserved

---

### Edge Cases

- **What happens when a worker attempts to move a batch to a stage without completing mandatory quality checks in the previous stage?** System displays error: "Quality check required. Contact Quality department." and blocks transition.

- **How does the system handle concurrent updates when two workers independently mark the same batch as complete?** First submission succeeds and updates timestamp. Second submission fails with message "Batch already moved to [Stage]. Cannot re-submit." Audit log shows both attempts.

- **What happens if a batch is in Quality stage for >24 hours without approval/rejection?** Supervisor receives automated alert "Batch ABC-123 waiting in Quality > 24 hours. Status approval needed." and batch is highlighted in efficiency reporting as bottleneck.

- **How does the system handle lost internet connection during mobile data entry?** Completion is queued locally with visual indicator "⚠️ Offline - syncing when connection restored". Once connection restored, queued actions sync within 30 seconds.

- **What happens if a quality controller's approval is entered but then that controller's authorization is revoked?** Historical approval remains valid in audit trail with timestamp. Future approvals are blocked. System does not retroactively invalidate past actions.

- **How does system handle duplicate batch IDs or data entry mistakes?** Batch ID is auto-generated or scanned via barcode—manual entry is discouraged. If duplicate is detected during entry, system shows "This batch ID already exists. Did you mean [similar batch ID]?" with suggestions.

- **What happens when a batch requires rework and must return to an earlier stage (e.g., Finishing → Molding)?** System records rework transition with special notation. Audit trail shows "Rework: returned from Finishing to Molding by Supervisor [Name], reason: Surface defects". Batch takes new path through remaining stages.

- **How does the system handle power loss at factory floor workstation?** Session is preserved in browser local storage. Upon power recovery and reconnection, user is restored to last navigated page with unsaved form data recovered (with option to confirm or discard).

- **What happens if a worker is assigned to multiple simultaneous batches in the same stage?** "My Current Work" displays all assigned batches with "Priority" labels. Worker can toggle between batches and complete them in any order. Completion is logged individually per batch.

- **How does system validate material consistency through manufacturing?** System tracks material batch used in Mixing stage. During Quality inspection, system displays original material batch and flags if different material was used in that batch's history (potential cross-contamination).

## Requirements

### Functional Requirements

- **FR-001**: System MUST support Google OAuth2 federated authentication with automatic user role assignment based on Google Workspace organizational units or custom attributes.

- **FR-002**: System MUST provide role-based access control with minimum roles: Worker, Supervisor, Production Manager, Quality Controller, Admin. Each role MUST have distinct dashboard and feature access.

- **FR-003**: System MUST display real-time production status dashboard showing all 8 manufacturing stages (Planning, Mixing, Molding, Curing, Finishing, Quality, Packaging, Shipping) with current batch counts and stage durations updated at least every 30 seconds.

- **FR-004**: System MUST record and store complete batch traceability data including: batch ID, creation timestamp, all stage transitions with timestamps, responsible user for each transition, stage duration, quality results, shipping details, and material batch used.

- **FR-005**: System MUST provide batch search and detail view enabling production managers to retrieve complete manufacturing history for any batch by batch ID, including timeline visualization and stage metadata.

- **FR-006**: System MUST enable workers to log stage completion via mobile interface with minimal input (batch ID scan or selection, confirmation button). Completion MUST be recorded with worker ID, timestamp, and stage transition.

- **FR-007**: System MUST provide structured quality inspection workflow enabling quality controllers to: (a) select batch in Quality stage, (b) record pass/fail/conditional result, (c) document defects with standardized reason codes, (d) approve or reject batch, (e) route rejections back to appropriate stage.

- **FR-008**: System MUST generate Efficiency Analysis reports showing: average time per stage, stage-to-stage trends, bottleneck identification (stages ≥10% slower than historical average), rework rates by stage, scrap cost impact, and predictive alerts.

- **FR-009**: System MUST maintain immutable audit trail for all batch operations (stage transitions, quality decisions, user actions) with: timestamp (UTC), responsible user ID, action type, affected batch, before/after values, and reason for reversals.

- **FR-010**: System MUST support mobile-first interface with responsive design functioning on viewport widths ≥320px and ≤1920px. All core workflows (authentication, stage logging, batch search) MUST be fully functional on mobile devices ≤768px width.

- **FR-011**: System MUST enforce workflow rules: (a) batches cannot advance past Quality stage until quality approval is recorded, (b) rework batches cannot bypass stages, (c) batches cannot reverse to completed stages without supervisor override with audit logging.

- **FR-012**: System MUST support data export (PDF and CSV formats) for: individual batch audit trails, efficiency reports, quality inspection records, and custom date-range production summaries.

- **FR-013**: System MUST implement offline capability for mobile workers: queuing stage completions when connection is lost and syncing when connection is restored. Queued actions MUST include clear visual indication of pending sync status.

- **FR-014**: System MUST provide automated alerts and notifications for: (a) batches waiting in stage >24 hours, (b) quality rejections, (c) stage efficiency trends below target, (d) production velocity declining >10% from baseline. Alerts MUST be dismissible and logged.

- **FR-015**: System MUST support optional barcode/QR code scanning for batch ID entry to reduce manual typing errors and improve factory floor data accuracy.

- **FR-016**: System MUST prevent data loss during stage transitions: (a) confirmations before destructive actions, (b) undo capability within 5 seconds of completion logging, (c) rollback support for erroneous transitions with audit trail documentation.

### Key Entities

- **Batch**: Represents a unit of gypsum tile production. Attributes: batch_id (unique identifier), creation_timestamp, current_stage (enum: Planning/Mixing/Molding/Curing/Finishing/Quality/Packaging/Shipping), material_batch_used (reference to material batch), status (active/completed/reworked/rejected). Relationships: contains multiple stage_transitions, has one quality_inspection result, has one shipping_record (if applicable).

- **Stage Transition**: Records movement of batch from one manufacturing stage to next. Attributes: batch_id (foreign key), from_stage, to_stage, transition_timestamp, completed_by_user_id, duration_in_stage (calculated), notes/reason. Relationships: belongs to one batch, references one user (worker).

- **Quality Inspection**: Records quality control decision for batch. Attributes: batch_id (foreign key), inspection_timestamp, inspector_id, result (enum: pass/fail/conditional), defect_count, defect_details (list of defects with reason codes), rework_required (boolean), approval_timestamp. Relationships: belongs to one batch, references one user (quality controller).

- **Defect Record**: Individual defect found during quality inspection. Attributes: defect_id, quality_inspection_id (foreign key), defect_type (enum: Surface Defects/Dimensional OOT/Structural Failure/Color Issue/Contamination/Other), location, quantity, severity_level (1-5), photo_url (optional).

- **Production Shift**: Represents manufacturing shift/work session. Attributes: shift_id, date, shift_start_time, shift_end_time, shift_type (day/night/weekend), production_manager_id, supervisor_id, active_batches_count. Relationships: can contain multiple batches, references multiple users.

- **Audit Log Entry**: Immutable record of all system actions. Attributes: entry_id, timestamp (UTC), user_id, action_type (enum: stage_transition/quality_approval/data_export/system_alert), affected_batch_id (nullable), before_value, after_value, reason/notes, source (mobile/desktop/api). Relationships: references one user, references one batch (if applicable).

- **User**: System user account representing factory personnel. Attributes: user_id, google_email, full_name, role (enum: Worker/Supervisor/Manager/QualityController/Admin), assigned_stage (nullable—workers assigned to specific stage), created_timestamp, last_login_timestamp. Relationships: has multiple stage_transitions (as responsible party), has multiple quality_inspections (if QC role).

- **Shipping Record**: Records batch shipment details. Attributes: shipping_id, batch_id (foreign key), destination, carrier, tracking_number, shipping_date, expected_delivery_date, shipped_by_user_id. Relationships: belongs to one batch, references one user.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete end-to-end authentication (Google OAuth2 login → dashboard access) in under 10 seconds on 4G networks, and authentication attempt failure rate is ≤0.1% (99.9% success rate).

- **SC-002**: Supervisors can identify production bottlenecks from dashboard within 30 seconds of login, visualized by stage color-coding (green/yellow/red) with bottleneck stage clearly highlighted.

- **SC-003**: Production managers can retrieve complete batch traceability (all stages, timestamps, quality results) for any historical batch within 5 seconds of entering batch ID.

- **SC-004**: Factory floor workers can log stage completion with ≤10 seconds of interaction time on mobile devices, achieving 95% first-attempt success rate (no errors or re-submission needed).

- **SC-005**: Real-time dashboard updates reflect batch stage transitions within 30 seconds of worker completing stage. All users viewing dashboard see consistent, updated state.

- **SC-006**: Quality inspection workflow is completable in ≤3 minutes per batch, including: batch selection, pass/fail recording, defect documentation, and approval/rejection decision.

- **SC-007**: System generates complete Efficiency Analysis reports within 10 seconds for any 30-day date range, identifying bottleneck stages and rework trends with 100% accuracy.

- **SC-008**: 100% of batch operations (stage transitions, quality approvals, data modifications) are logged in immutable audit trail with timestamp, user ID, and action details.

- **SC-009**: Mobile interface is fully functional on viewport widths ≥320px. All interactive elements meet minimum 44px touch target size. Page load time on mobile ≤2 seconds on 4G networks.

- **SC-010**: System maintains 99.5% data availability (uptime excluding scheduled maintenance). Batch data is never lost, even during network interruptions, through offline-first queuing and sync mechanisms.

- **SC-011**: Accessibility compliance: All screens and workflows meet WCAG 2.1 AA standards including ≥4.5:1 color contrast ratio for text, semantic HTML structure, keyboard-navigable forms, and screen reader compatibility.

- **SC-012**: Production velocity tracking: System accurately tracks and reports batches completed per 8-hour shift. Average shift production ≥40 batches/shift baseline, with trends tracked weekly.

- **SC-013**: Worker adoption: Within 30 days of launch, ≥80% of factory floor workers are using mobile interface for daily stage logging. System captures ≥95% of production events (batches moved) automatically.

- **SC-014**: Cost impact: System identifies and flags ≥50% of rework/scrap events within 24 hours through efficiency reporting, enabling quick intervention.

- **SC-015**: Compliance: Audit trail supports complete production history reconstruction for any batch within 24 hours, meeting regulatory/certification requirements.

## Assumptions

- **User Connectivity**: Factory floor has reliable 4G/WiFi coverage in production areas enabling frequent sync. Intermittent connectivity is expected and handled via offline queuing; persistent outages >2 hours are out of scope.

- **Existing Authentication Infrastructure**: Organization has existing Google Workspace domain and can provide OAuth2 credentials. User roles can be determined from Google Workspace organizational structure or custom directory attributes.

- **Batch Identification**: Batches are identified via unique batch ID generated by system (not manual entry). Barcode/QR code scanning infrastructure for batch IDs is optional (nice-to-have, not required for MVP).

- **Shift-Based Operations**: Manufacturing operates on shift basis (day/night shifts, Monday-Friday typical, weekend production possible). System assumes shift-level reporting; real-time data is aggregated at shift level, not per-minute granularity.

- **Material Consistency**: Material batches are tracked externally (separate system or manual records). Manufacturing system records which material batch was used in Mixing stage but does not manage material inventory itself.

- **Quality Standards**: Quality acceptance criteria and defect reason codes are predetermined by manufacturing operations. System provides UI for recording results but does not calculate acceptance thresholds (those are set by production rules).

- **Single-Facility Scope (v1)**: System is designed for single manufacturing facility. Multi-facility deployment, federation, and cross-facility reporting are out of scope for v1.

- **Device Types**: Workers access system via provided mobile devices (company-owned smartphones) or personal devices where applicable. System is not optimized for tablets as primary interface (though tablets may work). Desktop access is for managers/supervisors in office environments.

- **Historical Data**: System assumes ~6 months of historical production data for efficiency baseline calculations. If launching to new facility with no history, baseline comparisons use industry standards.

- **Regulatory Compliance**: System is designed to support standard manufacturing traceability and quality compliance (ISO 9001 typical). Specialized regulatory requirements (nuclear, pharmaceutical, etc.) are not assumed.

- **Manual Integration Points**: Shipping and logistics use external systems; manufacturing system records shipping decisions but does not directly interface with carrier systems. Shipping information may be manually entered by logistics team.

- **Scalability**: System is designed to handle ≥500 concurrent users and ≥10,000 batches per month. Higher volumes require infrastructure scaling but not architecture changes.

- **Data Retention**: Audit logs and batch records are retained indefinitely. Efficiency report calculation includes all available historical data. User request for data deletion is not supported in v1 (compliance/legal retention required).
