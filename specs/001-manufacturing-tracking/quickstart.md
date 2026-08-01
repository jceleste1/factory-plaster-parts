# Quick Start & Validation Scenarios

**Version**: 1.0.0 | **Date**: 2026-08-01 | **Purpose**: End-to-end validation that feature works as designed

---

## Prerequisites

### System Setup
1. **Database**: PostgreSQL 14+ with schema initialized (run migrations)
2. **Backend**: Node.js API running on `https://api.factory.internal`
3. **Frontend**: React app running on `https://factory.internal`
4. **Authentication**: Google OAuth2 credentials configured for organization
5. **Users**: Test users provisioned in Google Workspace with appropriate roles

### Test User Accounts
Create the following test accounts in Google Workspace:

| Email | Role | Assigned Stage | Purpose |
|-------|------|-----------------|---------|
| worker.john@factory.com | WORKER | MOLDING | Test stage completion logging |
| supervisor.mike@factory.com | SUPERVISOR | (none) | Test production oversight |
| manager.sarah@factory.com | MANAGER | (none) | Test reporting & efficiency analysis |
| qc.inspector@factory.com | QUALITY_CONTROLLER | (none) | Test quality inspections |
| admin.user@factory.com | ADMIN | (none) | Test user management |

### Environment Variables
```bash
VITE_API_BASE_URL=https://api.factory.internal
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
REACT_APP_ORG_ID=org_factory_001
```

---

## Scenario 1: User Authentication (P1 Requirement)

**Objective**: Verify Google OAuth2 authentication flow and dashboard access

**Prerequisites**: User account provisioned in Google Workspace

### Test Steps

1. **Navigate to Login Page**
   - Open `https://factory.internal/auth/login` in browser
   - Expected: Login page displays with "Sign in with Google" button
   - ✓ Button is large (44px+), clearly visible, accessible (keyboard/screen reader)

2. **Initiate OAuth Flow**
   - Click "Sign in with Google" button
   - Expected: Browser redirects to Google OAuth consent screen
   - User is on domain `accounts.google.com`
   - ✓ Redirect happens within 2 seconds

3. **Complete Google Authentication**
   - Enter test user credentials (e.g., worker.john@factory.com)
   - Consent to application access
   - Expected: Browser redirects back to `https://factory.internal/dashboard`
   - ✓ Redirect happens within 5 seconds
   - ✓ Dashboard loads

4. **Verify Dashboard Content**
   - Expected: Dashboard displays with user name "John Worker" in header
   - Expected: User role-appropriate content is displayed
     - WORKER: "My Current Work" section, stage cards, log completion button
     - SUPERVISOR: Full production dashboard, all stage cards visible
     - MANAGER: Dashboard + Reports tab visible
     - QC: Quality Inspections tab visible
     - ADMIN: Admin Users tab visible
   - ✓ Correct role-based content shown

5. **Verify Session Persistence (30-day window)**
   - Close and reopen browser
   - Navigate to `https://factory.internal/dashboard`
   - Expected: User is still authenticated (no redirect to login)
   - ✓ Session restored from cookie

6. **Test Logout**
   - Click user menu → "Logout"
   - Expected: Session cleared, user redirected to login page
   - Navigate to `/dashboard` again
   - Expected: Redirected back to login page
   - ✓ Logout successfully clears session

7. **Test Unauthorized Account**
   - Attempt login with Google account NOT in organization whitelist
   - Expected: Error message "This Google account is not authorized. Please contact your administrator."
   - Login blocked
   - ✓ Authorization check prevents unauthorized access

**Validation Checklist**:
- [ ] OAuth redirect to Google consent screen works
- [ ] Redirect back to application succeeds
- [ ] Dashboard displays correct role-based content
- [ ] Session persists across browser close/reopen
- [ ] Logout clears session and redirects to login
- [ ] Unauthorized accounts are blocked with clear error message
- [ ] Load time ≤10 seconds on 4G network
- [ ] Keyboard navigation works (Tab through buttons, Enter to activate)
- [ ] Screen reader announces page titles and button labels

---

## Scenario 2: Supervisor Views Real-Time Dashboard (P1 Requirement)

**Objective**: Verify real-time production status display with auto-refresh

**Prerequisites**: 
- Supervisor account logged in
- ≥5 active batches distributed across 8 stages in database

### Test Steps

1. **Load Dashboard**
   - Log in as supervisor.mike@factory.com
   - Navigate to Dashboard
   - Expected: Page loads with all 8 manufacturing stages visible
   - ✓ Load time ≤2 seconds on 4G network
   - ✓ All stages displayed (PLANNING, MIXING, MOLDING, CURING, FINISHING, QUALITY, PACKAGING, SHIPPING)

2. **Verify Stage Card Data**
   - Each stage card displays:
     - Stage name
     - Batch count
     - Average duration
     - Trend indicator (↑ slower, ↓ faster, → stable)
     - Color status (Green, Yellow, or Red)
   - ✓ Data is visible without horizontal scrolling on mobile (320px width)
   - ✓ All numbers accurate (match database counts)

3. **Test Metrics Overview**
   - Dashboard shows top metrics:
     - "Production Velocity: 47 batches/day"
     - "Bottleneck: CURING"
   - ✓ Metrics calculated correctly from batch data

4. **Simulate Batch Completion (Auto-Refresh)**
   - Note current batch counts (e.g., MOLDING: 15, CURING: 22)
   - Open terminal/database client and manually create stage transition:
     ```sql
     INSERT INTO stage_transitions (batch_id, from_stage, to_stage, transitioned_at, completed_by_user_id)
     VALUES ('2026-08-00042', 'MOLDING', 'CURING', NOW(), '<worker-uuid>');
     UPDATE batches SET current_stage = 'CURING' WHERE batch_id = '2026-08-00042';
     ```
   - Wait ≤30 seconds for next dashboard poll cycle
   - Expected: Dashboard updates automatically
     - MOLDING count decreases by 1 (15 → 14)
     - CURING count increases by 1 (22 → 23)
   - ✓ Update occurs within 30 seconds of database change
   - ✓ No manual refresh required

5. **Verify Color-Coded Status**
   - Check stage with slowest average duration (likely CURING)
   - Expected: Color status matches performance:
     - Green (✓) = Within target SLA
     - Yellow (⚠) = Approaching SLA threshold
     - Red (⛔) = Behind SLA
   - Click stage card to drill down
   - Expected: Detailed view shows specific SLA metrics
   - ✓ Status colors and text labels are not sole indicator (icon + text for color-blind users)

6. **Test Mobile Responsiveness**
   - Open dashboard on mobile device (375px width or use DevTools viewport)
   - Expected: Stage cards stack vertically (single column)
   - ✓ All text is readable (no text smaller than 14px)
   - ✓ All interactive elements have ≥44px touch targets
   - ✓ No horizontal scroll required

7. **Verify Empty Stage Display**
   - Create scenario where one stage has 0 batches:
     ```sql
     DELETE FROM batches WHERE current_stage = 'PLANNING' AND status = 'ACTIVE';
     ```
   - Refresh dashboard
   - Expected: PLANNING stage shows "No active batches" message
   - ✓ Message includes link to "View last completed batch"

**Validation Checklist**:
- [ ] All 8 stages visible on dashboard
- [ ] Stage cards display accurate batch counts
- [ ] Average duration calculated correctly
- [ ] Trend indicators (↑↓→) show correct direction
- [ ] Color status (Green/Yellow/Red) reflects SLA
- [ ] Dashboard auto-updates within 30 seconds of database change
- [ ] No manual refresh required
- [ ] Mobile layout (≤768px) is readable and functional
- [ ] Touch targets ≥44px on mobile
- [ ] Empty stage shows "No active batches" message
- [ ] Load time ≤2 seconds on 4G network
- [ ] Color contrast ≥4.5:1 (tested with Contrast Checker tool)

---

## Scenario 3: Batch Traceability & Timeline (P1 Requirement)

**Objective**: Verify complete batch history from Planning to Shipping

**Prerequisites**: 
- Batch with complete history (has passed through multiple stages)
- Batch ID: `2026-08-00042`

### Test Steps

1. **Search for Batch**
   - Log in as any user
   - Click search bar or navigate to search page
   - Enter batch ID: `2026-08-00042`
   - Expected: Search results show matching batch
   - ✓ Search returns within 2 seconds

2. **Open Batch Detail**
   - Click on batch result
   - Navigate to `/batch/2026-08-00042`
   - Expected: Batch detail page loads
   - ✓ Load time ≤3 seconds

3. **Verify Batch Info Box**
   - Expected info displayed:
     - Batch ID: 2026-08-00042 ✓
     - Status: ACTIVE ✓
     - Current Stage: CURING ✓
     - Quality Status: PENDING ✓
     - Created timestamp: 2026-08-01 06:00 ✓
     - Material batch ID: MAT-2026-08-0015 ✓
     - Time in current stage: (calculated correctly) ✓

4. **Verify Complete Timeline**
   - Expected: Timeline shows all stages in order
   - For each completed stage, verify:
     - Stage name ✓
     - Entry timestamp ✓
     - Exit timestamp ✓
     - Duration ✓
     - Responsible worker name (not just ID) ✓
     - Optional notes ✓
   - Example timeline:
     ```
     ✓ PLANNING: 2026-08-01 06:00 → 08:15 (2h 15m)
     ✓ MIXING: 2026-08-01 08:15 → 09:45 (1h 30m)
     ✓ MOLDING: 2026-08-01 09:45 → 14:00 (4h 15m)
     ◆ CURING: 2026-08-01 14:00 → (ongoing)
     ○ FINISHING: (pending)
     ```

5. **Expand Stage Details**
   - Click on "MOLDING" stage in timeline
   - Expected: Detailed view expands showing stage-specific data:
     - Mold type: "Standard Form A" ✓
     - Mold temperature: 45°C ✓
     - Cycle time: 4h 15m ✓
     - Exit inspection results: "All molds released successfully" ✓
   - ✓ Expansion happens within 1 second (no additional loading)

6. **Quality Results Display** (if applicable)
   - If batch has reached QUALITY stage and been inspected:
   - Expected: Quality section displays
     - Pass/Fail status ✓
     - Defect count ✓
     - Defect details with root cause codes ✓
     - Inspector name and timestamp ✓
     - Photos (if attached) ✓

7. **Shipping Information** (if shipped)
   - If batch has been shipped:
   - Expected: Shipping section displays
     - Destination address ✓
     - Carrier (FedEx, UPS, etc.) ✓
     - Tracking number ✓
     - Shipped timestamp ✓
     - Expected delivery date ✓

8. **Export Audit Trail**
   - Click "Download Audit Trail" button
   - Expected: Two export options
     - Export as PDF ✓
     - Export as CSV ✓
   - Click "Export as PDF"
   - Expected: Browser downloads file named `batch-2026-08-00042_audit.pdf`
   - ✓ File downloads within 5 seconds
   - Open PDF:
     - ✓ Contains batch ID and complete timeline
     - ✓ Timestamps in UTC
     - ✓ Professional formatting with logo/branding
     - ✓ All text is selectable (not image-based)
   - Click "Export as CSV"
   - Expected: Browser downloads file named `batch-2026-08-00042_audit.csv`
   - ✓ Open in Excel/Sheets, verify:
     - ✓ Columns: batch_id, stage, entry_timestamp, exit_timestamp, worker_name, notes
     - ✓ One row per stage ✓
     - ✓ All timestamps in consistent format (ISO 8601)

9. **Test on Mobile**
   - Open batch detail on mobile device (375px width)
   - Expected: Timeline renders vertically
   - ✓ Timeline markers visible and tappable (44px+ touch targets)
   - ✓ Stage details expand without breaking layout
   - ✓ Download buttons accessible

**Validation Checklist**:
- [ ] Batch search returns results within 2 seconds
- [ ] Batch detail page loads within 3 seconds
- [ ] Batch info box displays all required fields accurately
- [ ] Timeline shows all stages in chronological order
- [ ] Each stage shows entry/exit timestamps, duration, responsible worker, notes
- [ ] Stage details expand on tap/click
- [ ] Quality results displayed if batch inspected
- [ ] Shipping info displayed if batch shipped
- [ ] PDF export contains complete audit trail, professional formatting
- [ ] CSV export is valid and opens in spreadsheet software
- [ ] Mobile layout is readable and functional (375px width)
- [ ] All timestamps are in UTC and consistent format

---

## Scenario 4: Worker Logs Stage Completion (P1 Requirement)

**Objective**: Verify reliable stage completion logging with undo capability

**Prerequisites**:
- Worker account logged in
- Worker assigned to MOLDING stage
- Active batch currently in MOLDING stage (batch ID: 2026-08-00042)

### Test Steps

1. **Navigate to Work Queue**
   - Log in as worker.john@factory.com
   - Click "My Current Work" or similar
   - Expected: Page displays batches assigned to worker
   - ✓ Current batch shows: ID, Stage, Time in Stage
   - ✓ Button "Log Stage Completion" is prominent (large, contrasting color)

2. **Initiate Completion**
   - Click "Log Stage Completion"
   - Expected: Confirmation dialog appears
   - Dialog shows:
     - Batch ID: 2026-08-00042 ✓
     - Current stage: MOLDING ✓
     - Time in stage: 4h 15m ✓
     - Next stage: CURING ✓
   - ✓ Dialog has two buttons: "Cancel" and "Mark Complete"

3. **Add Optional Notes**
   - In notes field, type: "Temperature within spec, all molds released successfully"
   - ✓ Text field accepts input
   - ✓ Character limit enforced (max 500)

4. **Confirm Completion**
   - Click "Mark Complete" button
   - Expected: Request sent to backend
   - Backend response: 200 OK with new stage
   - Expected UI feedback: Success message appears
   - Message shows: "✓ Batch 2026-08-00042 completed MOLDING stage"
   - ✓ Message visible for 3 seconds (auto-dismiss)

5. **Verify Database State**
   - Check database for stage transition:
     ```sql
     SELECT * FROM stage_transitions 
     WHERE batch_id = '2026-08-00042' 
     ORDER BY transitioned_at DESC LIMIT 1;
     ```
   - Expected: New row with:
     - from_stage: MOLDING ✓
     - to_stage: CURING ✓
     - transitioned_at: NOW() ✓
     - completed_by_user_id: worker.john's UUID ✓
     - notes: "Temperature within spec..." ✓
   - Check batch current_stage:
     ```sql
     SELECT current_stage FROM batches WHERE batch_id = '2026-08-00042';
     ```
   - Expected: `CURING` ✓

6. **Test Undo Within Window**
   - Complete new stage transition for batch 2026-08-00041
   - Immediately (within 2 seconds) click "Undo" button
   - Expected: Undo button visible with countdown timer "4 seconds remaining"
   - ✓ Click undo
   - Expected: Batch reverts to previous stage
   - Message: "✓ Reverted to MOLDING stage"
   - Check database:
     ```sql
     SELECT current_stage FROM batches WHERE batch_id = '2026-08-00041';
     ```
   - Expected: Back to `MOLDING` ✓
   - Check audit log:
     ```sql
     SELECT * FROM audit_log_entries 
     WHERE affected_batch_id = '2026-08-00041' 
     ORDER BY timestamp DESC LIMIT 2;
     ```
   - Expected: Two entries:
     1. Original transition (MOLDING→CURING)
     2. Reversal event ✓

7. **Test Undo After Window Expires**
   - Complete stage transition
   - Wait >5 seconds
   - Try to click "Undo" button
   - Expected: "Undo" button disabled or hidden
   - Error message if attempted: "Undo not available - more than 5 seconds have passed"
   - ✓ Batch remains in new stage

8. **Test Offline Scenario**
   - Simulate offline: Disable network in DevTools or mobile
   - Worker clicks "Log Stage Completion"
   - Complete confirmation
   - Expected: Network error handled gracefully
   - Message: "⚠️ Queued - will sync when online"
   - ✓ UI remains responsive (no freeze)
   - ✓ Batch shown with pending indicator
   - Restore network connection
   - Expected: Completion synced to backend within 30 seconds
   - Message: "✓ Synced"
   - Database now shows stage transition ✓

9. **Test Conflicting Completion (Concurrent Updates)**
   - Two workers simultaneously attempt to log same batch completion
   - Worker 1 completes: Batch transitions from MOLDING → CURING (succeeds)
   - Worker 2 attempts same: Batch already in CURING
   - Expected: Worker 2 receives 409 Conflict error
   - Message: "Batch already moved to CURING. Cannot re-submit."
   - ✓ Audit log shows both attempts
   - Database is consistent (no duplicate transition)

10. **Test Quality Gate**
    - Batch in QUALITY stage, quality check FAILED
    - Worker attempts to move to PACKAGING
    - Expected: Error "Cannot advance to PACKAGING: Quality check failed. Contact supervisor."
    - ✓ Transition blocked, batch remains in QUALITY

11. **Test Mobile UX**
    - Open "My Current Work" on mobile (375px)
    - Expected: Layout optimized for mobile
    - ✓ Batch card full-width and easily tappable
    - ✓ "Mark Complete" button takes up full width, 56px+ height
    - ✓ Confirmation dialog modal, easy to dismiss
    - ✓ Success message visible and readable
    - ✓ No horizontal scroll required

**Validation Checklist**:
- [ ] "My Current Work" displays assigned batches
- [ ] "Log Stage Completion" button is prominent (large, high contrast)
- [ ] Confirmation dialog shows correct batch and stage info
- [ ] Notes field accepts up to 500 characters
- [ ] Completion succeeds with 200 OK response
- [ ] Database records StageTransition correctly
- [ ] Batch.current_stage updates immediately
- [ ] Worker ID is recorded (not generic system ID)
- [ ] Undo works within 5-second window, creates reversal entry
- [ ] Undo unavailable after 5 seconds
- [ ] Offline scenario: Stage completion queued locally
- [ ] Online sync: Queued completions sync within 30 seconds
- [ ] Concurrent completions: Second worker receives 409 error, batch not duplicated
- [ ] Quality gate: Transition blocked if quality not passed
- [ ] Mobile layout: 375px width, all elements readable and tappable
- [ ] Success message displays for 3 seconds

---

## Scenario 5: Quality Controller Inspects Batch (P2 Requirement)

**Objective**: Verify quality inspection workflow and defect recording

**Prerequisites**:
- QC account logged in (qc.inspector@factory.com)
- Batch in QUALITY stage: 2026-08-00040
- Quality inspection form loads

### Test Steps

1. **Load Quality Inspections Queue**
   - Log in as qc.inspector@factory.com
   - Navigate to Quality Inspections
   - Expected: List of batches waiting in QUALITY stage
   - ✓ Each batch shows ID, material type, wait time, priority

2. **Select Batch for Inspection**
   - Click on batch 2026-08-00040
   - Expected: Inspection form loads
   - ✓ Form shows batch info and acceptance criteria

3. **Record Inspection Result: CONDITIONAL**
   - Select "CONDITIONAL" (minor defects found)
   - Expected: Form expands to show defect recording section

4. **Add Defect Record**
   - Fill defect form:
     - Defect Type: SURFACE_DEFECTS ✓
     - Location: "Top-left corner, layers 2-4" ✓
     - Quantity: 5 ✓
     - Severity: 2 (Low) ✓
     - Root Cause: FINISHING_SANDING_INCOMPLETE ✓
   - Click "+ Add Another Defect" (optional)
   - ✓ Multiple defects can be recorded

5. **Upload Defect Photo**
   - Click "Upload Photo"
   - Select image file from device
   - ✓ Preview shows thumbnail
   - ✓ File uploads successfully

6. **Enter Rework Instructions**
   - Fill "Rework Steps" field:
     - "Re-sand surface smooth, apply finish evenly, reinspect"
   - ✓ Text is saved

7. **Submit Inspection**
   - Click "Submit Inspection"
   - Expected: Form submits, shows confirmation
   - Confirmation: "Inspection submitted for batch 2026-08-00040"
   - ✓ Request sent to backend (POST /quality/{batch_id}/inspect)

8. **Verify Backend State**
   - Check database:
     ```sql
     SELECT * FROM quality_inspections WHERE batch_id = '2026-08-00040';
     ```
   - Expected: Record created with:
     - result: CONDITIONAL ✓
     - defect_count: 1 ✓
     - rework_required: true ✓
     - rework_steps: "Re-sand surface..." ✓
   - Check defect records:
     ```sql
     SELECT * FROM defect_records WHERE inspection_id = (SELECT inspection_id FROM quality_inspections WHERE batch_id = '2026-08-00040');
     ```
   - Expected: One record with:
     - defect_type: SURFACE_DEFECTS ✓
     - location: "Top-left corner, layers 2-4" ✓
     - quantity: 5 ✓
     - severity_level: 2 ✓
     - root_cause_code: FINISHING_SANDING_INCOMPLETE ✓

9. **Verify Batch State Transition**
   - Check batch:
     ```sql
     SELECT current_stage, quality_status FROM batches WHERE batch_id = '2026-08-00040';
     ```
   - Expected: 
     - current_stage: PACKAGING (batch approved to move forward) ✓
     - quality_status: CONDITIONAL ✓

10. **Test PASSED Result**
    - Select different batch in QUALITY (2026-08-00039)
    - Inspection finds no defects
    - Select "PASSED"
    - Submit inspection
    - Expected: Batch moves to PACKAGING automatically
    - quality_status: PASSED ✓

11. **Test FAILED Result**
    - Select different batch in QUALITY (2026-08-00041)
    - Inspection finds critical defects
    - Select "FAILED"
    - Required rejection reason: Select from dropdown
    - Submit inspection
    - Expected: Batch transitions back to FINISHING
    - Supervisor notified: Alert/notification generated
    - quality_status: FAILED ✓
    - Audit log shows rejection with reason ✓

12. **Verify Mobile QC Interface**
    - Open quality inspection on mobile (375px)
    - Expected: Form displays vertically
    - ✓ Defect form easily tappable
    - ✓ Dropdown menus expand without overflow
    - ✓ Submit button full-width, 44px+ height

**Validation Checklist**:
- [ ] Quality Inspections queue loads with batches
- [ ] Inspection form shows batch info and acceptance criteria
- [ ] PASSED result moves batch to PACKAGING
- [ ] CONDITIONAL result records defects and rework steps
- [ ] FAILED result returns batch to FINISHING stage
- [ ] Defect records created with all fields
- [ ] Root cause codes tracked for analysis
- [ ] Photos attached to defect records
- [ ] Batch status updated correctly (PASSED/CONDITIONAL/FAILED)
- [ ] Supervisor notified on rejection
- [ ] Audit log records quality approval/rejection with timestamp and inspector ID
- [ ] Reinspection after rework creates new inspection record
- [ ] Mobile interface is functional (375px width)

---

## Scenario 6: Production Efficiency Report (P2 Requirement)

**Objective**: Verify efficiency analysis and bottleneck identification

**Prerequisites**:
- Manager account logged in
- ≥7 days of historical batch data

### Test Steps

1. **Navigate to Reports**
   - Log in as manager.sarah@factory.com
   - Click "Reports" tab
   - Expected: Report types displayed (Efficiency, Quality, Production Summary)

2. **Generate Efficiency Report**
   - Click "Efficiency Analysis"
   - Select date range: Last 7 days
   - Click "Generate Report"
   - Expected: Report loads within 10 seconds
   - ✓ No manual SQL knowledge required

3. **Verify Metrics Calculation**
   - Expected metrics displayed:
     - Total batches started: 385 ✓
     - Total batches completed: 385 ✓
     - Average production per shift: 48 batches ✓
     - Overall efficiency: 96.25% ✓
   - ✓ Numbers match database calculations

4. **Verify Stage Performance Table**
   - Expected table with columns:
     - Stage Name
     - Average Duration
     - Trend (↓ faster, → stable, ↑ slower)
     - Status (Green/Yellow/Red)
   - Example:
     ```
     PLANNING  | 2.3 hrs  | ↓ -8%   | Green
     MOLDING   | 4.0 hrs  | ↑ +2%   | Green
     CURING    | 25.5 hrs | ↑ +6%   | Yellow  ← Bottleneck
     FINISHING | 3.5 hrs  | → 0%    | Green
     ```
   - ✓ Trend calculations correct (compared to 7-day historical baseline)
   - ✓ Bottleneck identified (CURING = longest stage)

5. **Verify Bottleneck Alert**
   - Expected alert: "⚠ CURING stage 20% slower than historical average (24.0 hrs)"
   - ✓ Alert includes stage name, metric, and recommendation to investigate

6. **Verify Scrap & Rework Analysis**
   - Expected section: "Scrap & Rework Analysis"
   - Metrics displayed:
     - Total defects found: 34 ✓
     - Defect breakdown by type:
       - SURFACE_DEFECTS: 14 (41%)
       - COLOR_ISSUE: 8 (24%)
       - DIMENSIONAL_OOT: 7 (21%)
       - STRUCTURAL_FAILURE: 3 (9%)
       - CONTAMINATION: 2 (5%)
     - Rework rate: 8.5% ✓
     - Rejection rate: 2.1% ✓
     - Estimated scrap cost: $1,200.50 ✓
   - ✓ All percentages sum to 100%

7. **Test Drill-Down**
   - Click on "CURING" stage (bottleneck)
   - Expected: Drill-down view shows:
     - Batches currently in CURING stage
     - Average time per batch
     - Comparison to other shifts/days
   - ✓ Drill-down loads within 2 seconds
   - Click on "SURFACE_DEFECTS" defect type
   - Expected: Filter view shows:
     - Batches with surface defects
     - Defect locations and severity
     - Root causes (e.g., FINISHING_SANDING_INCOMPLETE)
   - ✓ Filter results load within 2 seconds

8. **Export Report as PDF**
   - Click "Export to PDF"
   - Expected: PDF downloads as `efficiency_report_2026-07-25_to_2026-08-01.pdf`
   - ✓ File downloads within 10 seconds
   - Open PDF:
     - ✓ Contains report title, date range, metrics
     - ✓ Charts rendered (line chart for stage trends, bar chart for defects)
     - ✓ Professional formatting with logo
     - ✓ All text is selectable (not image-based)
     - ✓ Includes recommendations/insights

9. **Export Report as CSV**
   - Click "Export to CSV"
   - Expected: CSV file downloads
   - Open in Excel/Sheets:
     - ✓ Columns: stage_name, avg_duration, trend_pct, status
     - ✓ One row per stage
     - ✓ Defect data in separate sheet or columns
     - ✓ All numbers match report displayed

10. **Verify Mobile Report View**
    - Open efficiency report on mobile (375px)
    - Expected: Report displays vertically
    - ✓ Charts scale to mobile width (no horizontal scroll)
    - ✓ Table data readable (possibly rotated or scrollable)
    - ✓ Drill-down fully functional on mobile

**Validation Checklist**:
- [ ] Reports tab accessible to MANAGER role
- [ ] Efficiency Analysis report generates within 10 seconds
- [ ] Metrics calculated correctly and match database
- [ ] Stage performance table shows all 8 stages with accurate data
- [ ] Trend calculations compare to historical baseline
- [ ] Bottleneck identified (longest average stage)
- [ ] Bottleneck alert displayed with reason and recommendation
- [ ] Scrap & Rework section shows defect breakdown by type
- [ ] Rework rate and rejection rate calculated correctly
- [ ] Drill-down by stage works and loads within 2 seconds
- [ ] Drill-down by defect type works and loads within 2 seconds
- [ ] PDF export is professional and contains all report data
- [ ] CSV export is valid and opens in spreadsheet software
- [ ] Mobile layout is readable and functional (375px width)

---

## End-to-End Validation Workflow

**Complete Journey**: From authentication through batch completion to efficiency reporting

1. ✓ Scenario 1: Authentication (P1)
2. ✓ Scenario 2: Dashboard (P1)
3. ✓ Scenario 4: Worker completes PLANNING stage
4. Dashboard auto-updates to show batch moved to MIXING
5. ✓ Scenario 4: Worker completes MIXING, MOLDING, CURING stages
6. ✓ Scenario 5: QC inspects batch in QUALITY (CONDITIONAL result)
7. Dashboard shows batch moved to PACKAGING with rework flag
8. ✓ Scenario 4: Worker completes PACKAGING, SHIPPING
9. ✓ Scenario 3: Manager views complete batch traceability
10. ✓ Scenario 6: Generate efficiency report showing batch in metrics

**Expected Outcome**: All scenarios complete without data loss, timing requirements met, no UI defects

**Sign-Off**: 
- [ ] All scenarios validated
- [ ] No critical defects
- [ ] Performance targets met (load times ≤2s, updates ≤30s)
- [ ] Accessibility compliance verified (WCAG 2.1 AA)
- [ ] Mobile functionality confirmed (375px, 768px widths)
- [ ] Offline sync tested and working
- [ ] Audit trail complete and immutable

---

