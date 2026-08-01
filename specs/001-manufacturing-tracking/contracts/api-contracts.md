# API Contracts: Manufacturing Tracking System

**Version**: 1.0.0 | **Base URL**: `https://api.factory.internal` | **Auth**: Bearer Token (Google OAuth2)

---

## Authentication Endpoints

### POST /auth/google-login
**Description**: Exchange Google OAuth token for session.

**Request**:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "google_email": "john.doe@factory.com",
    "full_name": "John Doe",
    "role": "WORKER",
    "assigned_stage": "MOLDING",
    "organization_id": "org_factory_001"
  },
  "session_expires_in": 2592000
}
```

**Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "This Google account is not authorized. Please contact your administrator."
}
```

---

### GET /auth/session
**Description**: Validate current session and return user profile.

**Response (200 OK)**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "google_email": "john.doe@factory.com",
  "full_name": "John Doe",
  "role": "WORKER",
  "assigned_stage": "MOLDING",
  "last_login_at": "2026-08-01T14:30:00Z"
}
```

**Response (401 Unauthorized)**: Session expired or missing.

---

### POST /auth/logout
**Description**: Clear session and log out user.

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Batch Endpoints

### GET /batches/dashboard
**Description**: Real-time production dashboard. Returns batch count per stage and overall metrics.

**Query Params**:
- `organization_id` (string, required): Organization identifier

**Response (200 OK)**:
```json
{
  "timestamp": "2026-08-01T15:00:00Z",
  "production_velocity": 47,
  "stages": [
    {
      "stage_name": "PLANNING",
      "batch_count": 12,
      "avg_duration_hours": 2.5,
      "status": "GREEN"
    },
    {
      "stage_name": "MIXING",
      "batch_count": 8,
      "avg_duration_hours": 1.2,
      "status": "GREEN"
    },
    {
      "stage_name": "MOLDING",
      "batch_count": 15,
      "avg_duration_hours": 4.0,
      "status": "YELLOW"
    },
    {
      "stage_name": "CURING",
      "batch_count": 22,
      "avg_duration_hours": 24.0,
      "status": "YELLOW"
    },
    {
      "stage_name": "FINISHING",
      "batch_count": 10,
      "avg_duration_hours": 3.5,
      "status": "GREEN"
    },
    {
      "stage_name": "QUALITY",
      "batch_count": 5,
      "avg_duration_hours": 0.75,
      "status": "GREEN"
    },
    {
      "stage_name": "PACKAGING",
      "batch_count": 8,
      "avg_duration_hours": 1.0,
      "status": "GREEN"
    },
    {
      "stage_name": "SHIPPING",
      "batch_count": 3,
      "avg_duration_hours": 0.5,
      "status": "GREEN"
    }
  ],
  "bottleneck_stage": "CURING",
  "total_active_batches": 83
}
```

---

### GET /batches/{batch_id}
**Description**: Retrieve complete batch details including full stage history.

**Response (200 OK)**:
```json
{
  "batch_id": "2026-08-00042",
  "status": "ACTIVE",
  "current_stage": "CURING",
  "quality_status": "PENDING",
  "created_at": "2026-08-01T06:00:00Z",
  "completed_at": null,
  "material_batch_id": "MAT-2026-08-0015",
  "priority": "NORMAL",
  "time_in_current_stage_seconds": 43200,
  "stage_transitions": [
    {
      "transition_id": "uuid-1",
      "from_stage": "START",
      "to_stage": "PLANNING",
      "transitioned_at": "2026-08-01T06:00:00Z",
      "completed_by_user_id": "550e8400-e29b-41d4-a716-446655440001",
      "completed_by_name": "Sarah Manager",
      "duration_in_from_stage": 0,
      "notes": "Batch created for order #2026-08-001"
    },
    {
      "transition_id": "uuid-2",
      "from_stage": "PLANNING",
      "to_stage": "MIXING",
      "transitioned_at": "2026-08-01T08:15:00Z",
      "completed_by_user_id": "550e8400-e29b-41d4-a716-446655440002",
      "completed_by_name": "Mike Supervisor",
      "duration_in_from_stage": 8100,
      "notes": "Material batch confirmed, ready for mixing"
    },
    {
      "transition_id": "uuid-3",
      "from_stage": "MIXING",
      "to_stage": "MOLDING",
      "transitioned_at": "2026-08-01T09:45:00Z",
      "completed_by_user_id": "550e8400-e29b-41d4-a716-446655440003",
      "completed_by_name": "John Doe",
      "duration_in_from_stage": 5400,
      "notes": "Mixture consistent, temperature within spec"
    },
    {
      "transition_id": "uuid-4",
      "from_stage": "MOLDING",
      "to_stage": "CURING",
      "transitioned_at": "2026-08-01T14:00:00Z",
      "completed_by_user_id": "550e8400-e29b-41d4-a716-446655440003",
      "completed_by_name": "John Doe",
      "duration_in_from_stage": 15300,
      "notes": null
    }
  ],
  "quality_inspection": null,
  "shipping_record": null
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Batch not found",
  "batch_id": "2026-08-99999"
}
```

---

### GET /batches/search
**Description**: Search batches by ID or filter by status/stage.

**Query Params**:
- `q` (string, optional): Search term (batch ID, partial ID, or material ID)
- `status` (string, optional): Filter by status (ACTIVE, COMPLETED, REWORKING, REJECTED)
- `stage` (string, optional): Filter by current stage
- `limit` (integer, default 50): Max results
- `offset` (integer, default 0): Pagination offset

**Response (200 OK)**:
```json
{
  "total": 145,
  "limit": 50,
  "offset": 0,
  "results": [
    {
      "batch_id": "2026-08-00042",
      "status": "ACTIVE",
      "current_stage": "CURING",
      "quality_status": "PENDING",
      "created_at": "2026-08-01T06:00:00Z",
      "time_in_current_stage_hours": 12.0
    },
    {
      "batch_id": "2026-08-00041",
      "status": "COMPLETED",
      "current_stage": "SHIPPING",
      "quality_status": "PASSED",
      "created_at": "2026-08-01T03:00:00Z",
      "time_in_current_stage_hours": 2.5
    }
  ]
}
```

---

### POST /batches/{batch_id}/stage-completion
**Description**: Log batch completion of current stage and advance to next stage.

**Request**:
```json
{
  "current_stage": "MOLDING",
  "notes": "All tiles properly formed, ready for curing"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "batch_id": "2026-08-00042",
  "previous_stage": "MOLDING",
  "new_stage": "CURING",
  "transitioned_at": "2026-08-01T14:00:00Z",
  "message": "Batch 2026-08-00042 moved to CURING stage"
}
```

**Response (409 Conflict)** (concurrent transition):
```json
{
  "error": "Batch already moved to CURING stage",
  "current_stage": "CURING"
}
```

**Response (422 Unprocessable Entity)** (quality gate not passed):
```json
{
  "error": "Cannot advance to PACKAGING: Quality check failed. Contact supervisor.",
  "reason": "Quality inspection required before advancing past QUALITY stage"
}
```

---

### POST /batches/{batch_id}/stage-completion/undo
**Description**: Undo last stage completion (within 5 seconds only).

**Response (200 OK)**:
```json
{
  "success": true,
  "batch_id": "2026-08-00042",
  "reverted_from": "CURING",
  "reverted_to": "MOLDING",
  "reverted_at": "2026-08-01T14:02:00Z",
  "message": "Stage transition reversed"
}
```

**Response (410 Gone)** (undo window expired):
```json
{
  "error": "Undo not available - more than 5 seconds have passed since completion"
}
```

---

### POST /batches/{batch_id}/audit-trail/export
**Description**: Export complete batch audit trail as CSV or PDF.

**Query Params**:
- `format` (string, required): `csv` or `pdf`

**Response (200 OK)**:
- Content-Type: `text/csv` or `application/pdf`
- Content-Disposition: `attachment; filename=batch-2026-08-00042_audit.csv`
- Body: CSV/PDF data stream

---

## Quality Inspection Endpoints

### GET /quality/inspections
**Description**: List batches awaiting quality inspection.

**Query Params**:
- `limit` (integer, default 50): Max results
- `status` (string, optional): PENDING, PASSED, FAILED, CONDITIONAL

**Response (200 OK)**:
```json
{
  "total": 12,
  "batches": [
    {
      "batch_id": "2026-08-00040",
      "material_type": "Standard Gray Tile",
      "entry_time": "2026-08-01T12:30:00Z",
      "wait_duration_hours": 2.5,
      "priority": "HIGH"
    },
    {
      "batch_id": "2026-08-00038",
      "material_type": "Textured White Tile",
      "entry_time": "2026-08-01T11:00:00Z",
      "wait_duration_hours": 4.0,
      "priority": "NORMAL"
    }
  ]
}
```

---

### GET /quality/{batch_id}/inspect
**Description**: Load quality inspection form for batch.

**Response (200 OK)**:
```json
{
  "batch_id": "2026-08-00040",
  "material_type": "Standard Gray Tile",
  "stage_entry_time": "2026-08-01T12:30:00Z",
  "acceptance_criteria": {
    "defect_max_count": 3,
    "critical_defect_allowed": false,
    "surface_finish_required": true
  },
  "previous_inspection": null,
  "defect_categories": [
    "SURFACE_DEFECTS",
    "DIMENSIONAL_OOT",
    "STRUCTURAL_FAILURE",
    "COLOR_ISSUE",
    "CONTAMINATION",
    "OTHER"
  ]
}
```

---

### POST /quality/{batch_id}/inspect
**Description**: Submit quality inspection result.

**Request**:
```json
{
  "result": "CONDITIONAL",
  "defects": [
    {
      "defect_type": "SURFACE_DEFECTS",
      "location": "Top-left corner, layers 2-4",
      "quantity": 5,
      "severity_level": 2,
      "root_cause_code": "FINISHING_SANDING_INCOMPLETE",
      "photo_url": null
    }
  ],
  "rework_steps": "Re-sand surface smooth, apply finish evenly",
  "notes": "Minor surface irregularities, otherwise acceptable"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "batch_id": "2026-08-00040",
  "result": "CONDITIONAL",
  "inspection_at": "2026-08-01T14:45:00Z",
  "defect_count": 1,
  "next_action": "Batch approved for Packaging with rework required"
}
```

---

## Reports & Analytics Endpoints

### GET /reports/efficiency
**Description**: Generate efficiency analysis report for date range.

**Query Params**:
- `start_date` (string, ISO 8601): Start date
- `end_date` (string, ISO 8601): End date
- `frequency` (string, optional): `daily`, `weekly`, `monthly` (default: daily)

**Response (200 OK)**:
```json
{
  "report_generated_at": "2026-08-01T15:30:00Z",
  "period": "2026-07-25 to 2026-08-01",
  "stage_metrics": [
    {
      "stage_name": "PLANNING",
      "avg_duration_hours": 2.3,
      "historical_avg_hours": 2.5,
      "trend": "IMPROVING",
      "trend_pct": -8.0,
      "status": "GREEN"
    },
    {
      "stage_name": "CURING",
      "avg_duration_hours": 25.5,
      "historical_avg_hours": 24.0,
      "trend": "DEGRADING",
      "trend_pct": 6.25,
      "status": "YELLOW"
    }
  ],
  "bottleneck_stage": "CURING",
  "scrap_metrics": {
    "total_defects_found": 34,
    "defect_by_type": {
      "SURFACE_DEFECTS": 14,
      "COLOR_ISSUE": 8,
      "DIMENSIONAL_OOT": 7,
      "STRUCTURAL_FAILURE": 3,
      "CONTAMINATION": 2
    },
    "rework_rate_pct": 8.5,
    "rejection_rate_pct": 2.1,
    "estimated_scrap_cost": 1200.50
  },
  "production_summary": {
    "total_batches_started": 400,
    "total_batches_completed": 385,
    "avg_production_per_shift": 48,
    "efficiency_pct": 96.25
  }
}
```

---

### POST /reports/efficiency/export
**Description**: Export efficiency report as PDF.

**Request**:
```json
{
  "start_date": "2026-07-25",
  "end_date": "2026-08-01",
  "include_charts": true,
  "include_recommendations": true
}
```

**Response (200 OK)**:
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=efficiency_report_2026-07-25_to_2026-08-01.pdf`

---

## Notifications & Alerts

### GET /alerts
**Description**: Get active alerts for current user.

**Query Params**:
- `limit` (integer, default 20): Max alerts to return
- `severity` (string, optional): INFO, WARNING, CRITICAL

**Response (200 OK)**:
```json
{
  "alerts": [
    {
      "alert_id": "uuid-1",
      "severity": "WARNING",
      "message": "Batch 2026-08-00025 has been in QUALITY stage for >24 hours",
      "batch_id": "2026-08-00025",
      "created_at": "2026-08-01T12:30:00Z",
      "dismissible": true
    },
    {
      "alert_id": "uuid-2",
      "severity": "CRITICAL",
      "message": "Curing stage is trending 20% slower than historical average",
      "created_at": "2026-08-01T14:00:00Z",
      "dismissible": true
    }
  ]
}
```

---

### POST /alerts/{alert_id}/dismiss
**Description**: Dismiss an alert.

**Response (200 OK)**:
```json
{
  "success": true,
  "alert_id": "uuid-1",
  "dismissed_at": "2026-08-01T15:00:00Z"
}
```

---

## Admin Endpoints

### GET /admin/users
**Description**: List all users (admin only).

**Query Params**:
- `role` (string, optional): Filter by role
- `status` (string, optional): active, inactive
- `limit` (integer, default 50): Max results

**Response (200 OK)**:
```json
{
  "total": 24,
  "users": [
    {
      "user_id": "uuid-1",
      "google_email": "john.doe@factory.com",
      "full_name": "John Doe",
      "role": "WORKER",
      "assigned_stage": "MOLDING",
      "is_active": true,
      "last_login_at": "2026-08-01T14:30:00Z"
    }
  ]
}
```

---

### POST /admin/users/{user_id}/deactivate
**Description**: Deactivate user account.

**Response (200 OK)**:
```json
{
  "success": true,
  "user_id": "uuid-1",
  "is_active": false,
  "deactivated_at": "2026-08-01T15:00:00Z"
}
```

---

## Error Response Format

All error responses follow standard format:

```json
{
  "error": "Error description",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field": "batch_id",
    "message": "Batch ID format invalid"
  },
  "timestamp": "2026-08-01T15:00:00Z",
  "request_id": "req_uuid_12345"
}
```

---

## Rate Limiting & Pagination

- **Rate Limit**: 100 requests per minute per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Pagination**: Offset-based (limit + offset query params); max 500 results per page

---

## Security Headers

All responses include:
- `Content-Security-Policy: default-src 'self'`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

