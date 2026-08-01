# Data Model: Gypsum Tile Manufacturing Tracking System

**Version**: 1.0.0 | **Date**: 2026-08-01 | **Status**: Final

---

## Entity Relationship Overview

```
User (1) ------ (many) StageTransition
User (1) ------ (many) QualityInspection
User (1) ------ (many) AuditLogEntry
User (1) ------ (many) ShippingRecord

Batch (1) ------ (many) StageTransition
Batch (1) ------ (1) QualityInspection
Batch (1) ------ (many) DefectRecord
Batch (1) ------ (1) ShippingRecord
Batch (1) ------ (many) AuditLogEntry

QualityInspection (1) ------ (many) DefectRecord

ProductionShift (1) ------ (many) Batch
```

---

## Core Entities & Field Specifications

### 1. User

Represents factory personnel with role-based permissions.

**Fields**:
- `user_id` (UUID): Primary key, auto-generated on first login
- `google_email` (String, unique): User's Google Workspace email (e.g., john.doe@factory.com)
- `full_name` (String, max 255): User's full name from Google Workspace profile
- `role` (Enum): One of:
  - `WORKER` – Factory floor production worker
  - `SUPERVISOR` – Shift supervisor, authorizes rework/reversals
  - `MANAGER` – Production manager, views reports and efficiency metrics
  - `QUALITY_CONTROLLER` – Quality inspection and approval authority
  - `ADMIN` – System administration, user management
- `assigned_stage` (Enum, nullable): If WORKER role, optionally assigned to specific stage (Planning, Mixing, Molding, Curing, Finishing, Quality, Packaging, Shipping). NULL if multi-stage worker.
- `created_at` (Timestamp, UTC): Account creation timestamp
- `last_login_at` (Timestamp, UTC, nullable): Most recent login timestamp
- `is_active` (Boolean): TRUE if account is enabled; FALSE if deactivated by admin
- `organization_id` (String): Organization/facility identifier (supports multi-org future expansion)

**Constraints**:
- `google_email` unique per organization_id
- `role` cannot be NULL
- `created_at` and `last_login_at` must be in UTC, server-set (client time not trusted)

**Validation Rules**:
- Email must match regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- `full_name` length ≥3 characters, ≤255
- `assigned_stage` only valid if role is WORKER

**Indexes**:
- `(google_email, organization_id)` – Unique index for login lookups
- `(organization_id, role)` – For role-based queries (list all supervisors)
- `(last_login_at)` – For identifying inactive users

---

### 2. Batch

Represents a production unit (bundle of gypsum tiles) flowing through 8 stages.

**Fields**:
- `batch_id` (String, unique, immutable): Primary key. Format: `YYYY-MM-NNNNN` (e.g., `2026-08-00042`). Generated server-side via auto-increment sequence, never manual entry.
- `status` (Enum): Current batch state:
  - `ACTIVE` – Batch in production, moving through stages
  - `COMPLETED` – Batch finished Shipping stage, production complete
  - `REWORKING` – Batch rejected in Quality, returned for rework
  - `REJECTED` – Batch permanently rejected, does not continue production
- `current_stage` (Enum): One of: `PLANNING`, `MIXING`, `MOLDING`, `CURING`, `FINISHING`, `QUALITY`, `PACKAGING`, `SHIPPING`
- `created_at` (Timestamp, UTC): Batch creation time (when Planning stage is initiated)
- `completed_at` (Timestamp, UTC, nullable): Timestamp when batch reached Shipping stage completion
- `material_batch_id` (String, nullable, immutable): Reference to material batch used in Mixing stage (e.g., material ID from external inventory system). Tracked for traceability.
- `production_shift_id` (UUID, foreign key, nullable): Reference to shift batch was created in (for shift-level reporting)
- `priority` (Enum): `LOW`, `NORMAL`, `HIGH`. Informs worker queue prioritization.
- `quality_status` (Enum): Summary of Quality stage result:
  - `PENDING` – Batch awaiting quality inspection
  - `PASSED` – Quality inspection approved
  - `FAILED` – Quality inspection rejected
  - `CONDITIONAL` – Approved with rework required

**Constraints**:
- `batch_id` immutable (cannot change once created)
- `status` transitions follow rules: ACTIVE → COMPLETED or REWORKING or REJECTED; REWORKING → ACTIVE or REJECTED
- `current_stage` consistent with latest `StageTransition` record for this batch
- `quality_status` only PASSED or FAILED when current_stage is past QUALITY

**Validation Rules**:
- `batch_id` format matches regex: `^\d{4}-\d{2}-\d{5}$`
- `created_at` ≤ all stage transition timestamps (monotonic time)
- `material_batch_id` if present, must reference valid material batch
- `production_shift_id` if present, must reference valid shift

**Indexes**:
- `(batch_id)` – Primary key lookup (single-row queries fast)
- `(current_stage, created_at)` – For listing active batches per stage
- `(status, created_at)` – For filtering completed/rejected batches
- `(material_batch_id)` – For traceability by material
- `(production_shift_id)` – For shift-based reporting

**Derived Fields** (computed, not stored):
- `time_in_current_stage` – Calculated as NOW() - latest StageTransition.exit_timestamp (where exit_timestamp < next_stage entry, or NULL if current stage)
- `total_production_time` – Calculated as completed_at - created_at
- `stage_count` – Count of distinct stages batch has passed through

---

### 3. StageTransition

Records batch movement from one manufacturing stage to next. Immutable event record.

**Fields**:
- `transition_id` (UUID): Primary key, auto-generated
- `batch_id` (String, foreign key): Reference to Batch
- `from_stage` (Enum): Previous stage (or `START` if first transition from Planning)
- `to_stage` (Enum): Next stage. One of: `PLANNING`, `MIXING`, `MOLDING`, `CURING`, `FINISHING`, `QUALITY`, `PACKAGING`, `SHIPPING`, `END` (if reworked, can go to earlier stage)
- `transitioned_at` (Timestamp, UTC, immutable): Timestamp of transition, server-set
- `completed_by_user_id` (UUID, foreign key): User who logged completion (typically WORKER role)
- `duration_in_from_stage` (Integer, nullable): Seconds batch spent in previous stage. Calculated as transitioned_at - (previous transition).transitioned_at
- `notes` (String, max 500, nullable): Worker notes on stage completion (e.g., "Temperature slightly high but within tolerance")
- `revision_count` (Integer): Number of times this transition was undone and re-attempted (0 if first attempt, 1 if undone once, etc.)
- `next_stage_readiness` (Enum, nullable): Indicator for downstream stage:
  - `READY` – Batch ready for next stage (default)
  - `DELAY` – Batch delayed, next stage should wait
  - `HOLD` – Hold batch, do not advance (requires supervisor override)
- `is_rework` (Boolean): TRUE if this transition is part of rework cycle (returned from later stage)

**Constraints**:
- `transitioned_at` immutable (cannot be edited after creation)
- `batch_id` + `revision_count` must be unique per `from_stage` (cannot have two revisions of same transition with same revision count)
- `from_stage` and `to_stage` must be different

**Validation Rules**:
- `completed_by_user_id` user must have role WORKER or SUPERVISOR
- `to_stage` must follow logical sequence unless `is_rework=TRUE` (then can go to earlier stage)
- Quality stage transition: check `batch.quality_status` is PASSED before advancing to Packaging
- `duration_in_from_stage` must be ≥0
- `notes` stripped of leading/trailing whitespace; max 500 characters

**Indexes**:
- `(batch_id, transitioned_at DESC)` – Get transitions for batch in reverse chronological order (used for timeline view)
- `(from_stage, transitioned_at)` – For analyzing stage durations
- `(completed_by_user_id, transitioned_at)` – For worker productivity tracking
- `(is_rework, transitioned_at)` – For rework rate analysis

**Special Cases**:
- **Stage Reversal** (Rework): When batch must return to earlier stage (e.g., Quality → Finishing):
  - New transition: `from_stage=QUALITY, to_stage=FINISHING, is_rework=TRUE`
  - Original `FINISHING→QUALITY` transition remains in audit trail
  - `revision_count` incremented in reversal event (stored in AuditLogEntry, not here)

---

### 4. QualityInspection

Records quality control decision for batch. One per batch maximum (Batch.quality_status drives uniqueness).

**Fields**:
- `inspection_id` (UUID): Primary key
- `batch_id` (String, foreign key, unique): Reference to Batch (one inspection per batch)
- `inspection_at` (Timestamp, UTC): Timestamp when inspection was conducted
- `inspector_id` (UUID, foreign key): Quality controller who performed inspection
- `result` (Enum): Inspection outcome:
  - `PASSED` – Batch approved for next stage (Packaging)
  - `FAILED` – Batch rejected, returns to Finishing stage
  - `CONDITIONAL` – Approved with minor defects; rework required but batch continues to Packaging
- `defect_count` (Integer): Number of distinct defects found (0 if PASSED)
- `rework_required` (Boolean): TRUE if result is CONDITIONAL or FAILED and rework steps provided
- `rework_steps` (Text, nullable): Detailed rework instructions if defects found (e.g., "Sand surface smooth, re-inspect color match")
- `approval_timestamp` (Timestamp, UTC, nullable): When inspector formally approved/rejected. Equal to inspection_at for initial decision; differs if re-inspected after rework.
- `notes` (String, max 1000, nullable): Inspector observations, conclusions, or context for decision
- `is_reinspection` (Boolean): TRUE if batch was reworked and this is reinspection after rework

**Constraints**:
- `batch_id` unique (one inspection per batch; reinspection creates new inspection record with `is_reinspection=TRUE` and separate batch_id... actually, reinspection updates same record or creates linked record? Decision: Update same inspection record, increment re-inspection count field)
- Actually, data model revision: Add `reinspection_count` (Integer, starts at 0, increments each time reinspected)
- `result` cannot be NULL
- If `result=FAILED`, `rework_required` must be FALSE (rework not possible after rejection)
- If `result=CONDITIONAL`, `rework_required` must be TRUE

**Validation Rules**:
- `inspector_id` user must have role QUALITY_CONTROLLER
- `inspection_at` ≤ NOW() (timestamp cannot be in future)
- `defect_count` ≥0
- If `defect_count > 0`, must have at least one DefectRecord linked
- `rework_steps` length: if present, 10-500 characters

**Indexes**:
- `(batch_id)` – Lookup inspection for batch
- `(inspector_id, inspection_at)` – Track inspector productivity
- `(result, inspection_at)` – For pass/fail rate trending

**Post-Inspection Actions**:
- PASSED: Batch moves to Packaging stage automatically (via workflow)
- FAILED: Supervisor notified; batch returned to Finishing stage
- CONDITIONAL: Batch moves to Packaging with rework_steps stored for shipping notes

---

### 5. DefectRecord

Individual defect discovered during quality inspection. Multiple per QualityInspection possible.

**Fields**:
- `defect_id` (UUID): Primary key
- `inspection_id` (UUID, foreign key): Reference to QualityInspection
- `defect_type` (Enum): Standardized defect categories:
  - `SURFACE_DEFECTS` – Scratches, dents, texture issues
  - `DIMENSIONAL_OOT` – Dimensions out of tolerance
  - `STRUCTURAL_FAILURE` – Cracks, breaks, deformation
  - `COLOR_ISSUE` – Color mismatch or inconsistency
  - `CONTAMINATION` – Foreign material, staining
  - `OTHER` – Unclassified defect
- `location` (String, max 100): Where on tile/batch defect is found (e.g., "Top-left corner", "Center tile, layer 2")
- `quantity` (Integer): Number of tiles affected or instances of defect in batch
- `severity_level` (Integer, 1-5): Defect severity:
  - `1` – Minor (cosmetic, does not affect function)
  - `2` – Low (minor functional impact)
  - `3` – Medium (moderate functional impact)
  - `4` – High (significant functional impact)
  - `5` – Critical (safety risk or non-functional)
- `photo_url` (String, nullable): URL/path to photo of defect (stored in cloud storage, e.g., S3)
- `root_cause_code` (String, nullable): Code linking defect to manufacturing stage where it originated (e.g., `MIXING_TEMP_HIGH`, `MOLD_WEAR`, `CURE_TIME_SHORT`)
- `recorded_at` (Timestamp, UTC): When defect record created

**Constraints**:
- `inspection_id` must reference existing QualityInspection
- `quantity` > 0
- `severity_level` in range [1, 5]

**Validation Rules**:
- `defect_type` must be valid enum value
- `location` non-empty, ≤100 characters
- `root_cause_code` if present, must match known code list (maintained in backend config)
- `photo_url` if present, must be valid URL format

**Indexes**:
- `(inspection_id)` – Get all defects for inspection
- `(defect_type, recorded_at)` – Analyze defect trends by type
- `(severity_level)` – Filter critical defects for escalation

**Defect Type → Root Cause Mapping** (for efficiency analysis):
- SURFACE_DEFECTS ← FINISHING_SANDING_INCOMPLETE, FINISHING_CONTAMINATION
- DIMENSIONAL_OOT ← MOLDING_TEMPERATURE, MOLD_WEAR, MOLDING_PRESSURE
- STRUCTURAL_FAILURE ← MIXING_RATIO_WRONG, CURING_TIME_SHORT, CURING_TEMPERATURE
- COLOR_ISSUE ← MIXING_PIGMENT_ERROR, MATERIAL_BATCH_CONTAMINATION
- CONTAMINATION ← MIXING_ENVIRONMENT_DIRTY, FINISHING_WORKSPACE_DIRTY

---

### 6. AuditLogEntry

Immutable record of all system actions. Append-only table; no updates or deletes.

**Fields**:
- `entry_id` (UUID): Primary key
- `timestamp` (Timestamp, UTC, immutable): When action occurred, server-set (client time not trusted)
- `user_id` (UUID, foreign key, nullable): User who performed action (NULL for system-generated events like alerts)
- `action_type` (Enum): Category of action:
  - `STAGE_TRANSITION` – Batch moved to next stage
  - `QUALITY_APPROVAL` – Quality controller approved/rejected batch
  - `BATCH_REVERSAL` – Stage transition undone
  - `DEFECT_RECORDED` – Defect logged during inspection
  - `EXPORT_INITIATED` – User exported batch audit trail
  - `ALERT_GENERATED` – System created alert (e.g., batch >24h in stage)
  - `DATA_IMPORT` – Admin imported batch data (future)
- `affected_batch_id` (String, foreign key, nullable): Batch affected by action (NULL for user management actions)
- `affected_user_id` (UUID, foreign key, nullable): User affected (for admin actions like deactivation)
- `before_value` (JSON, nullable): Previous state (e.g., `{"stage": "MOLDING", "status": "ACTIVE"}`)
- `after_value` (JSON, nullable): New state (e.g., `{"stage": "CURING", "status": "ACTIVE"}`)
- `reason_for_change` (String, max 500, nullable): Explanation for action (e.g., "Undo: incorrectly marked complete", "Rework: surface defects")
- `source` (Enum): Origin of action:
  - `MOBILE_APP` – Worker/supervisor on mobile device
  - `DESKTOP_APP` – Manager/admin on desktop
  - `API` – Direct API call (future integrations)
  - `SYSTEM` – Automated system action (alerts, cleanup)
- `ip_address` (String, nullable): Client IP address (for security audit trail)
- `metadata` (JSON, nullable): Additional context (e.g., `{"retry_count": 2, "sync_status": "deferred"}` for offline-synced actions)

**Constraints**:
- `entry_id` immutable (append-only table)
- `timestamp` immutable
- `action_type` cannot be NULL
- Entries never updated or deleted; create new entries for reversals

**Validation Rules**:
- `timestamp` must be valid UTC datetime, ≤ NOW() + 5 seconds (client clock skew tolerance)
- `user_id` if present, must reference existing User
- `affected_batch_id` if present, must reference existing Batch
- `before_value` and `after_value` must be valid JSON
- `reason_for_change` max 500 characters
- `source` must be valid enum value

**Indexes**:
- `(affected_batch_id, timestamp DESC)` – Get audit events for batch (compliance queries, timeline reconstruction)
- `(user_id, timestamp DESC)` – Get actions by user (security audit, productivity tracking)
- `(action_type, timestamp)` – Filter by action type for reporting
- `(timestamp DESC)` – Global audit log chronological order
- `(affected_batch_id, action_type)` – Compound query: all stage transitions for batch

**Immutability Strategy**:
- Database constraint: No UPDATE or DELETE permissions on audit_logs table
- Application: Treat audit_logs as read-only; never attempt updates
- Retention: Archive entries older than 7 years (regulatory compliance); never delete

---

### 7. ShippingRecord

Records batch shipment details. One per completed batch.

**Fields**:
- `shipping_id` (UUID): Primary key
- `batch_id` (String, foreign key, unique): Reference to completed Batch
- `destination` (String, max 255): Shipment destination address/customer name
- `carrier` (String, max 100): Shipping carrier (e.g., "FedEx", "UPS", "Local Truck")
- `tracking_number` (String, max 100, nullable): Carrier tracking number (for proof of delivery)
- `shipped_at` (Timestamp, UTC): Date/time batch left facility
- `expected_delivery_date` (Date): Expected arrival date at destination
- `actual_delivery_date` (Date, nullable): Actual delivery date (updated post-delivery)
- `shipped_by_user_id` (UUID, foreign key): User (typically Packaging/Shipping worker) who logged shipment
- `notes` (String, max 500, nullable): Special handling instructions, delivery notes, etc.
- `rework_notes` (String, max 500, nullable): If batch had rework, notes on rework outcome for customer

**Constraints**:
- `batch_id` unique (one shipment per batch)
- `shipped_at` ≤ NOW() (timestamp cannot be future)
- `expected_delivery_date` ≥ DATE(shipped_at)
- `actual_delivery_date` ≥ DATE(shipped_at), if populated

**Validation Rules**:
- `destination` non-empty, ≤255 characters
- `carrier` non-empty, ≤100 characters
- `tracking_number` alphanumeric if present
- `shipped_by_user_id` must reference User with role WORKER or SUPERVISOR

**Indexes**:
- `(batch_id)` – Lookup shipment for batch
- `(shipped_at)` – For shipment date range queries
- `(tracking_number)` – Lookup shipment by carrier tracking
- `(destination)` – Group shipments by customer/location

---

### 8. ProductionShift

Represents a manufacturing shift/work session (day shift, night shift, weekend).

**Fields**:
- `shift_id` (UUID): Primary key
- `date` (Date): Date of shift
- `shift_type` (Enum): `DAY`, `NIGHT`, `WEEKEND`
- `start_time` (Time): Shift start time (e.g., 06:00 for day shift)
- `end_time` (Time): Shift end time (e.g., 14:00)
- `production_manager_id` (UUID, foreign key): Manager responsible for shift
- `supervisor_id` (UUID, foreign key, nullable): Shift supervisor (if different from manager)
- `target_production_count` (Integer, nullable): Target batches for shift
- `actual_production_count` (Integer): Actual batches completed in shift (calculated)
- `notes` (String, max 1000, nullable): Shift notes (e.g., "Equipment downtime 1 hour", "High defect rate, investigating")

**Constraints**:
- `start_time` < `end_time`
- `production_manager_id` must reference User with role MANAGER or SUPERVISOR
- `actual_production_count` ≥ 0

**Validation Rules**:
- `date` cannot be future date
- `shift_type` must be valid enum

**Indexes**:
- `(date, shift_type)` – Lookup shift details
- `(production_manager_id, date)` – Shifts managed by user

**Derived Fields** (not stored):
- `duration_hours` – Calculated from start_time and end_time
- `production_velocity` – Calculated as actual_production_count / duration_hours
- `efficiency_pct` – Calculated as (actual_production_count / target_production_count) * 100

---

## State Machines & Workflows

### Batch Lifecycle State Machine

```
START
  ↓
PLANNING (batch created, assigned material batch)
  ↓
MIXING (material mixed, composition recorded)
  ↓
MOLDING (tiles molded, mold type recorded)
  ↓
CURING (tiles cured, time/temperature recorded)
  ↓
FINISHING (surface finishing applied)
  ↓
QUALITY (inspection performed)
  ├─→ [PASSED] → PACKAGING (quality approved)
  ├─→ [FAILED] → REJECTED (batch discarded, production ends)
  └─→ [CONDITIONAL] → PACKAGING (approved with rework notes)
  ↓
PACKAGING (batch packaged for shipment)
  ↓
SHIPPING (batch shipped to customer)
  ↓
END (batch production complete)
  
REWORK PATH (from any stage after QUALITY):
  - Quality rejects batch → returns to FINISHING stage
  - New inspection required before advancing
  - Multiple rework cycles possible
```

**Status Mapping**:
- `ACTIVE`: Batch in stages PLANNING through SHIPPING (in production)
- `COMPLETED`: Batch reached END (shipped)
- `REWORKING`: Batch returned from QUALITY to earlier stage
- `REJECTED`: Batch failed and did not continue

**Quality Status Lifecycle**:
```
PENDING (batch created, not yet inspected)
  ↓
[Batch reaches QUALITY stage]
  ↓
Quality inspection performed
  ├─→ PASSED (approved, advances to PACKAGING)
  ├─→ FAILED (rejected, returns to FINISHING)
  └─→ CONDITIONAL (approved with rework, advances to PACKAGING)
  
[If CONDITIONAL and rework performed, reinspection occurs]
  ↓
PASSED or FAILED (after rework)
```

### Defect Root Cause Analysis Chain

```
Defect found in Quality stage
  ↓
Categorized by type (SURFACE_DEFECTS, DIMENSIONAL_OOT, etc.)
  ↓
Inspector assigns root_cause_code (e.g., MOLDING_TEMPERATURE)
  ↓
Batch reworked (if CONDITIONAL) or rejected (if FAILED)
  ↓
Efficiency report aggregates by root_cause_code
  ↓
Production team prioritizes fixes for top root causes
  ↓
Stage-specific SLAs adjusted if needed
```

---

## Validation Rules Summary

### Business Logic Validations

1. **Stage Progression**: Batch can only advance to next stage if:
   - Previous stage quality_status is PASSED (or N/A for pre-Quality stages)
   - No hold conditions exist (next_stage_readiness ≠ HOLD)

2. **Quality Gate**: Batch cannot advance past QUALITY stage unless:
   - QualityInspection.result is PASSED (or CONDITIONAL)
   - QualityInspection.inspection_at is recorded

3. **Rework Logic**: Rejected batch can only re-enter production if:
   - Supervisor approves rework (creates audit log entry)
   - Batch transitions to FINISHING or earlier stage with is_rework=TRUE
   - Quality reinspection required before advancing past QUALITY again

4. **Audit Trail Immutability**: Once StageTransition or QualityInspection recorded:
   - Timestamps cannot be edited
   - Records can only be reversed by creating new reversal event in AuditLogEntry
   - Original record remains visible in audit trail

5. **Worker Assignment**: If User.assigned_stage is set:
   - Worker can only log completions for batches in that stage
   - Assignment can be overridden by SUPERVISOR role

6. **Concurrent Transition Prevention**: If two workers attempt to transition same batch simultaneously:
   - First request succeeds, updates batch.current_stage and creates StageTransition
   - Second request fails with 409 Conflict, error message "Batch already moved to [STAGE]"
   - Both attempts recorded in AuditLogEntry for audit trail

---

## Data Integrity Constraints

### Primary Keys
- `User.user_id`, `Batch.batch_id`, `StageTransition.transition_id`, etc. – Must be unique, never NULL

### Foreign Keys
- `StageTransition.batch_id` → `Batch.batch_id` (ON DELETE RESTRICT – prevent deleting batch with transitions)
- `QualityInspection.batch_id` → `Batch.batch_id` (ON DELETE RESTRICT)
- `DefectRecord.inspection_id` → `QualityInspection.inspection_id` (ON DELETE CASCADE – delete defects if inspection deleted)
- `ShippingRecord.batch_id` → `Batch.batch_id` (ON DELETE RESTRICT)
- `AuditLogEntry.affected_batch_id` → `Batch.batch_id` (ON DELETE RESTRICT – keep audit trail even if batch deleted in future)

### Unique Constraints
- `User.(google_email, organization_id)` – No duplicate emails per organization
- `Batch.batch_id` – Globally unique
- `QualityInspection.batch_id` – One inspection per batch (max)
- `ShippingRecord.batch_id` – One shipment per batch (max)

### Check Constraints
- `StageTransition.duration_in_from_stage ≥ 0`
- `DefectRecord.quantity > 0`
- `DefectRecord.severity_level BETWEEN 1 AND 5`
- `Batch.created_at ≤ Batch.completed_at` (if completed_at populated)

---

## Performance Considerations

### Query Patterns & Optimization

**High-Volume Queries** (real-time dashboard):
```sql
-- Query 1: Batch count per stage (every 30s)
SELECT current_stage, COUNT(*) as batch_count
FROM Batch
WHERE status = 'ACTIVE' AND organization_id = ?
GROUP BY current_stage;

Optimization: Index (status, current_stage, organization_id)
```

**Medium-Volume Queries** (batch detail view):
```sql
-- Query 2: Complete batch history (on-demand)
SELECT * FROM StageTransition 
WHERE batch_id = ?
ORDER BY transitioned_at DESC;

Optimization: Index (batch_id, transitioned_at DESC)
```

**Low-Volume Queries** (reports, analytics):
```sql
-- Query 3: Efficiency metrics (hourly aggregation)
SELECT from_stage, AVG(duration_in_from_stage) as avg_duration
FROM StageTransition
WHERE transitioned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY from_stage;

Optimization: Materialized view or nightly batch job
```

### Scaling Strategies

1. **Batch Table Sharding**: As batch records grow, shard by date range (data older than 1 year archived to cold storage)
2. **Audit Log Archival**: Separate archive table for entries older than 1 year (regulatory compliance, 7-year retention)
3. **Read Replicas**: Reporting queries hit read replica, not primary
4. **Cache Layer**: Real-time dashboard metrics cached in Redis (30s TTL) to reduce database load

---

## Version Control & Migration Strategy

**Schema Version**: 1.0.0

**Future Migrations** (v2.0+):
- Adding material inventory tracking (separate Material and MaterialInventory tables)
- Multi-facility federation (organization_id becomes true multi-tenant)
- Equipment tracking (associate stages with equipment serial numbers)
- Predictive analytics (ML model predictions stored in separate table)

**No-Breaking-Changes Policy**:
- New columns added as nullable; old code continues working
- Old columns deprecated but never removed in same major version
- API versioning allows old client code to work with new backend

