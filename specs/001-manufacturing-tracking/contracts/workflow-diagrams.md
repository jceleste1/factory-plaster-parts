# Manufacturing Workflow Diagrams

**Version**: 1.0.0 | **Format**: Mermaid Sequence & State Diagrams

---

## 1. Batch Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> PLANNING: Batch created
    
    PLANNING --> MIXING: Plan approved
    MIXING --> MOLDING: Mix complete
    MOLDING --> CURING: Mold complete
    CURING --> FINISHING: Cure complete
    FINISHING --> QUALITY: Finishing complete
    
    QUALITY --> PACKAGING: Quality PASSED
    QUALITY --> REWORKING: Quality FAILED or CONDITIONAL
    REWORKING --> FINISHING: Rework assigned (return to stage)
    
    PACKAGING --> SHIPPING: Packaged
    SHIPPING --> [*]: Shipped (COMPLETED)
    
    REWORKING --> [*]: Rework rejected (REJECTED)
```

**State Descriptions**:
- **PLANNING**: Batch order created, materials assigned, production scheduled. Duration: 2-3 hours.
- **MIXING**: Raw materials mixed according to recipe. Quality check on mixture. Duration: 1-2 hours.
- **MOLDING**: Mixture molded into tile forms in molds. Mold type and parameters recorded. Duration: 4-6 hours.
- **CURING**: Tiles cure in controlled temperature/humidity environment. Duration: 18-36 hours (longest stage).
- **FINISHING**: Surface finishing applied (sanding, sealing, etc.). Duration: 3-5 hours.
- **QUALITY**: Quality inspector examines batch, records pass/fail/conditional. Duration: 30-60 minutes.
- **PACKAGING**: Approved batch packaged for shipment. Duration: 1-2 hours.
- **SHIPPING**: Batch shipped to customer. Duration: ≤1 hour (handoff to carrier).
- **REWORKING**: Batch returned from Quality for corrections. Can loop back to any previous stage.
- **REJECTED**: Batch permanently failed quality; production ends.

---

## 2. Worker Stage Completion Workflow

```mermaid
sequenceDiagram
    participant Worker
    participant MobileApp as Mobile App
    participant Backend
    participant Database
    participant Dashboard as Supervisor Dashboard
    
    Worker->>MobileApp: Opens "Log Stage Completion"
    MobileApp->>MobileApp: Displays current batch & stage
    Worker->>MobileApp: Taps "Mark Complete"
    
    MobileApp->>MobileApp: Shows confirmation dialog
    MobileApp->>Worker: "Confirm: Move batch to [NEXT_STAGE]?"
    
    Worker->>MobileApp: Confirms (taps "Mark Complete")
    
    alt Network Connected
        MobileApp->>Backend: POST /batch/{id}/stage-completion
        Backend->>Database: Create StageTransition record
        Backend->>Database: Update Batch.current_stage
        Backend->>Database: Create AuditLogEntry
        Database-->>Backend: Success
        Backend-->>MobileApp: 200 OK with new stage
        MobileApp->>MobileApp: Display confirmation "Success!"
        MobileApp->>MobileApp: Show "Undo" button (5 sec timer)
    else Network Offline
        MobileApp->>MobileApp: Store in IndexedDB queue
        MobileApp->>Worker: "⚠️ Queued - will sync when online"
        MobileApp->>MobileApp: Retry on connection restore
    end
    
    Dashboard->>Backend: Polls /dashboard (every 30s)
    Backend-->>Dashboard: Updated stage counts
    Dashboard->>Dashboard: Refreshes stage card (batch count -1, +1 to next)
    Dashboard->>Supervisor: Dashboard updates within 30 seconds
    
    Note over Worker,Dashboard: Within 5 seconds...
    alt Worker clicks "Undo"
        Worker->>MobileApp: Clicks "Undo"
        MobileApp->>Backend: POST /batch/{id}/stage-completion/undo
        Backend->>Database: Create reversal AuditLogEntry
        Backend->>Database: Revert Batch.current_stage
        Database-->>Backend: Success
        Backend-->>MobileApp: 200 OK
        MobileApp->>Worker: "Reverted to [PREVIOUS_STAGE]"
    else 5 seconds expire
        MobileApp->>MobileApp: Hide "Undo" button
        Worker->>MobileApp: (Cannot undo after 5s)
    end
```

**Key Points**:
1. Worker operates primarily on mobile; minimal network latency acceptable
2. Confirmation required to prevent accidental completions
3. Undo window: 5 seconds only (data integrity concern if too long)
4. Offline support: Queuing in IndexedDB, sync when connection restored
5. Dashboard updates within 30 seconds via polling (satisfies real-time requirement)
6. Reversal creates new audit event (original event not edited, immutability preserved)

---

## 3. Quality Inspection Workflow

```mermaid
sequenceDiagram
    participant QC as Quality Controller
    participant QCApp as QC Tablet/Desktop
    participant Backend
    participant Database
    participant Supervisor
    participant SupervisorDash as Supervisor Dashboard
    
    QC->>QCApp: Navigates to "Quality Inspections" queue
    QCApp->>Backend: GET /quality/inspections
    Backend->>Database: Query batches in QUALITY stage
    Database-->>Backend: [Batch list]
    Backend-->>QCApp: Renders inspection queue (sorted by wait time)
    
    QC->>QCApp: Selects batch 2026-08-00040
    QCApp->>Backend: GET /quality/2026-08-00040/inspect
    Backend->>Database: Fetch batch + previous inspection history
    Database-->>Backend: Batch data
    Backend-->>QCApp: Load inspection form with acceptance criteria
    
    QC->>QCApp: Inspects physical batch in lab
    QC->>QCApp: Checks criteria: defects, dimensions, color, finish
    QC->>QCApp: Selects result: "CONDITIONAL" (minor defects found)
    
    QC->>QCApp: Adds defect record #1
    QCApp->>QCApp: Defect Type: SURFACE_DEFECTS
    QCApp->>QCApp: Location: "Top-left corner", Qty: 5, Severity: 2
    QCApp->>QCApp: Root Cause: FINISHING_SANDING_INCOMPLETE
    QC->>QCApp: Optional: Uploads photo of defect
    
    QC->>QCApp: Enters rework instructions
    QCApp->>QCApp: "Re-sand surface smooth, re-apply finish, reinspect"
    
    QC->>QCApp: Taps "Submit Inspection"
    QCApp->>Backend: POST /quality/2026-08-00040/inspect
    Backend->>Database: Create QualityInspection record
    Backend->>Database: Create DefectRecord entries
    Backend->>Database: Update Batch.quality_status = CONDITIONAL
    Backend->>Database: Create AuditLogEntry (QUALITY_APPROVAL)
    
    alt Result = PASSED
        Backend->>Database: Create StageTransition QUALITY→PACKAGING
        Backend->>Database: Update Batch.current_stage = PACKAGING
        Backend-->>QCApp: 200 OK "Batch approved, moved to Packaging"
    else Result = CONDITIONAL
        Backend->>Database: Create StageTransition QUALITY→PACKAGING
        Backend->>Database: Store rework_steps in QualityInspection
        Backend->>Database: Update Batch.current_stage = PACKAGING (with rework flag)
        Backend-->>QCApp: 200 OK "Batch approved with rework required"
    else Result = FAILED
        Backend->>Database: Create StageTransition QUALITY→FINISHING (rework=TRUE)
        Backend->>Database: Update Batch.status = REWORKING
        Backend->>Database: Update Batch.current_stage = FINISHING
        Backend-->>QCApp: 200 OK "Batch rejected, returned to Finishing"
        Backend->>Supervisor: Send notification "Batch rejected: [reason]"
    end
    
    QCApp->>QC: Show confirmation & next batch in queue
    
    SupervisorDash->>Backend: Polls /dashboard (30s interval)
    Backend-->>SupervisorDash: Updated stage distribution
    SupervisorDash->>Supervisor: Dashboard shows batch moved/rejected
```

**Key Workflows**:
1. **PASSED**: Batch advances to Packaging automatically
2. **CONDITIONAL**: Batch advances to Packaging with rework notes included (for customer/rework team)
3. **FAILED**: Batch returns to Finishing stage; supervisor notified for rework decision

---

## 4. Batch Reversal (Error Correction)

```mermaid
sequenceDiagram
    participant Worker
    participant Supervisor as Supervisor
    participant App
    participant Backend
    participant Database
    participant AuditLog as Audit Trail
    
    Worker->>App: Accidentally logs stage completion
    Worker->>App: Realizes error within 5 seconds
    Worker->>App: Clicks "Undo" button
    App->>Backend: POST /batch/{id}/stage-completion/undo
    
    Backend->>Database: Verify undo window (created_at + 5s > NOW)
    Backend->>Database: Get previous StageTransition
    Backend->>Database: Revert Batch.current_stage to previous stage
    Backend->>Database: Create new AuditLogEntry: action=BATCH_REVERSAL
    
    Database-->>Backend: Success
    Backend-->>App: 200 OK
    App->>Worker: "Successfully reverted to [PREVIOUS_STAGE]"
    
    AuditLog-->>Database: Record shows:
    Note over AuditLog: 1. Original transition: MOLDING→CURING @14:00
    Note over AuditLog: 2. Reversal event: Undo initiated @14:01 (within 5s)
    Note over AuditLog: 3. Current state: Batch back in MOLDING stage
    
    alt Error discovered >5 seconds later
        Supervisor->>App: Supervisor reviews audit trail
        Supervisor->>App: Identifies erroneous transition
        Supervisor->>App: Requests reversal (requires supervisor override)
        App->>Backend: POST /batch/{id}/reverse-stage (supervisor_id, reason)
        Backend->>Database: Verify supervisor role (SUPERVISOR or ADMIN)
        Backend->>Database: Create reversal AuditLogEntry with reason
        Backend->>Database: Revert Batch.current_stage
        Database-->>Backend: Success
        Backend-->>App: 200 OK
        AuditLog-->>Database: Record shows:
        Note over AuditLog: 1. Original transition: MOLDING→CURING @14:00
        Note over AuditLog: 2. Supervisor reversal: @16:30 (supervisor_id, reason)
        Note over AuditLog: 3. Current state: Batch back in MOLDING stage
    end
```

**Immutability Guarantee**:
- Original StageTransition record never edited or deleted
- Reversals create new AuditLogEntry records
- Complete history preserved for compliance/investigation
- Supervisor reversals require explicit override (not automated)

---

## 5. Report Generation & Export

```mermaid
sequenceDiagram
    participant Manager
    participant ManagerApp as Reports Dashboard
    participant Backend
    participant Database
    participant Analytics as Analytics Engine
    participant Storage as File Storage
    
    Manager->>ManagerApp: Navigates to "Efficiency Analysis"
    ManagerApp->>ManagerApp: Shows date range picker
    Manager->>ManagerApp: Selects start_date, end_date, frequency
    Manager->>ManagerApp: Clicks "Generate Report"
    
    ManagerApp->>Backend: GET /reports/efficiency?start_date=...&end_date=...
    
    Backend->>Database: Query StageTransition aggregates
    Backend->>Database: SELECT AVG(duration_in_from_stage) by from_stage
    Backend->>Database: Query QualityInspection results (pass/fail/rework rates)
    Backend->>Database: Query DefectRecord by defect_type
    Backend->>Database: Query production velocity (batches per shift)
    
    Database-->>Backend: Aggregated data
    
    Backend->>Analytics: Compute:
    Note over Analytics: 1. Stage metrics (avg, trend, status)
    Note over Analytics: 2. Bottleneck detection (stages >10% slower)
    Note over Analytics: 3. Scrap cost impact
    Note over Analytics: 4. Historical comparisons
    
    Analytics-->>Backend: Results JSON
    
    Backend-->>ManagerApp: Render report UI (charts, tables, alerts)
    ManagerApp->>Manager: Display "Efficiency Analysis" dashboard
    
    alt Manager clicks "Export PDF"
        Manager->>ManagerApp: Clicks "Export to PDF"
        ManagerApp->>Backend: POST /reports/efficiency/export (report_data, format=pdf)
        
        Backend->>Backend: Generate PDF:
        Note over Backend: 1. Layout: header, date, charts
        Note over Backend: 2. Embed company branding (logo, footer)
        Note over Backend: 3. Render tables & metrics
        Note over Backend: 4. Add recommendations
        
        Backend->>Storage: Write PDF to cloud storage (S3/GCS)
        Storage-->>Backend: File URL
        Backend-->>ManagerApp: 200 OK (download link)
        ManagerApp->>Manager: Download starts: efficiency_report_2026-07-25_to_2026-08-01.pdf
        
    else Manager clicks "Export CSV"
        Manager->>ManagerApp: Clicks "Export CSV"
        ManagerApp->>Backend: POST /reports/efficiency/export (report_data, format=csv)
        Backend-->>ManagerApp: CSV stream
        ManagerApp->>Manager: Download starts: efficiency_report_2026-07-25_to_2026-08-01.csv
    end
```

---

## 6. Real-Time Dashboard Update Flow

```mermaid
sequenceDiagram
    participant Worker
    participant MobileApp
    participant Backend
    participant Database
    participant Supervisor
    participant SupervisorDashboard as Dashboard (Supervisor)
    
    loop Every 30 seconds
        SupervisorDashboard->>Backend: GET /batches/dashboard
        Backend->>Database: SELECT COUNT(*) by current_stage WHERE status=ACTIVE
        Database-->>Backend: Stage distribution
        Backend-->>SupervisorDashboard: JSON {PLANNING: 12, MIXING: 8, ...}
        SupervisorDashboard->>SupervisorDashboard: Update UI (stage cards)
        SupervisorDashboard->>Supervisor: Dashboard reflects current state
    end
    
    par
        Worker->>MobileApp: Logs stage completion (time T)
        MobileApp->>Backend: POST /batch/XXXX/stage-completion
        Backend->>Database: Create StageTransition (time T)
        Backend->>Database: Update Batch.current_stage (time T)
        Database-->>Backend: Success
        Backend-->>MobileApp: 200 OK (time T+0.5s)
    and
        Note over Supervisor: @ time T, Dashboard still shows old stage distribution
        SupervisorDashboard->>Backend: No data change yet (polling not run)
        
        Note over Supervisor: @ time T+30s, Dashboard polls again
        SupervisorDashboard->>Backend: GET /batches/dashboard
        Backend->>Database: Query stage counts (includes update at T)
        Database-->>Backend: Updated counts (old stage -1, new stage +1)
        Backend-->>SupervisorDashboard: JSON with updated distribution
        SupervisorDashboard->>SupervisorDashboard: Re-render cards
        SupervisorDashboard->>Supervisor: Dashboard updates within 30s of worker action
    end
```

**Timeline**:
- T+0: Worker logs completion
- T+0.5s: Backend confirms to mobile (worker sees success)
- T+30s: Supervisor dashboard refreshes, shows batch moved
- T+30s-60s: Next dashboard refresh (depends on polling cycle)

**Key Point**: 30-second update window meets specification. Real-time push (WebSocket) not required.

---

## 7. Offline → Online Sync Flow

```mermaid
sequenceDiagram
    participant Worker
    participant MobileApp
    participant IndexedDB
    participant Backend
    participant Database
    
    Note over Worker,MobileApp: OFFLINE SCENARIO
    Worker->>MobileApp: Network disconnected
    MobileApp->>MobileApp: navigator.onLine = false
    
    Worker->>MobileApp: Logs stage completion
    MobileApp->>MobileApp: Attempt POST /batch/XXXX/stage-completion
    MobileApp->>MobileApp: Network unavailable (catch error)
    MobileApp->>IndexedDB: Store in queue table
    IndexedDB->>IndexedDB: Record: {endpoint, payload, timestamp, retryCount:0, status:'pending'}
    MobileApp->>Worker: Display "⚠️ Queued - will sync when online"
    
    Note over Worker,MobileApp: ONLINE RESTORATION
    MobileApp->>MobileApp: Detect connection restore (navigator.onLine = true)
    MobileApp->>MobileApp: Run sync handler (background timer every 10s)
    
    MobileApp->>IndexedDB: SELECT * FROM queue WHERE status='pending'
    IndexedDB-->>MobileApp: [Queued action]
    
    MobileApp->>Backend: POST /batch/XXXX/stage-completion (retry 1/8)
    Backend->>Database: Create StageTransition
    Database-->>Backend: Success
    Backend-->>MobileApp: 200 OK
    
    MobileApp->>IndexedDB: UPDATE queue SET status='synced', timestamp=NOW()
    IndexedDB-->>MobileApp: Success
    
    MobileApp->>Worker: "✓ Synced" (notification)
    MobileApp->>MobileApp: Update UI (batch moved to new stage)
    
    Note over Worker,MobileApp: FAILURE SCENARIO
    alt Retry fails (server error, validation failure)
        MobileApp->>Backend: POST /batch/XXXX/stage-completion (retry 2/8)
        Backend-->>MobileApp: 422 Unprocessable Entity (batch already moved)
        MobileApp->>IndexedDB: UPDATE queue SET status='failed', retryCount=1
        MobileApp->>Worker: "⚠️ Sync failed: Batch already moved. Undo manually?"
    else Max retries exceeded
        MobileApp->>MobileApp: retryCount reaches 8
        MobileApp->>IndexedDB: UPDATE queue SET status='dead_letter'
        MobileApp->>Worker: "❌ Sync failed after retries. Contact support."
    end
```

**Sync Strategy**:
- Exponential backoff: 1s, 2s, 4s, max 8 retries
- Idempotent requests (same batch_id + timestamp = same transition)
- Failed requests moved to dead-letter queue for manual review

---

## 8. Rework Cycle

```mermaid
stateDiagram-v2
    [*] --> PLANNING
    PLANNING --> MIXING
    MIXING --> MOLDING
    MOLDING --> CURING
    CURING --> FINISHING
    FINISHING --> QUALITY
    
    QUALITY --> CONDITIONAL: Minor defects
    CONDITIONAL --> REWORK_FINISHING: Rework assigned
    
    REWORK_FINISHING --> REWORK_QUALITY: Rework complete
    REWORK_QUALITY --> PASSED: Reinspection passed
    
    PASSED --> PACKAGING: Approved
    PACKAGING --> SHIPPING
    SHIPPING --> [*]: Completed
    
    REWORK_QUALITY --> FAILED: Reinspection failed
    FAILED --> [*]: Rejected
    
    QUALITY --> PASSED: Inspection passed
    QUALITY --> FAILED: Critical defects
```

**Rework Transitions** (immutable events):
1. `QUALITY → FINISHING` (is_rework=TRUE) – Batch returns for corrections
2. Worker completes rework in Finishing stage
3. `FINISHING → QUALITY` (is_rework=TRUE) – Reinspection
4. Quality controller reinspects (reinspection_count incremented)
5. If PASSED: `QUALITY → PACKAGING` (no rework flag)
6. If FAILED: `QUALITY → REJECTED` (status=REJECTED, production ends)

**Audit Trail**:
- Original FINISHING → QUALITY transition: recorded as-is
- Quality rejected (CONDITIONAL): creates QUALITY_APPROVAL entry
- Rework assigned: creates reversal entry (QUALITY → FINISHING, is_rework=TRUE)
- Rework completion: creates new STAGE_TRANSITION entry
- Reinspection: creates new QUALITY_INSPECTION entry with is_reinspection=TRUE

