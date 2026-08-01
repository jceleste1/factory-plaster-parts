<!-- SPECKIT START -->
For technical context, architecture decisions, and implementation details, refer to:

**Implementation Plan**: [specs/001-manufacturing-tracking/plan.md](../specs/001-manufacturing-tracking/plan.md)
- Technical Context: React 19, TypeScript 5.7, TailwindCSS 4, ShadcnUI, Google OAuth2
- Project Structure: Feature-based organization (src/features/*, src/shared/*, src/layouts/*)
- Design Decisions: Auth, real-time updates, mobile-first responsive design, accessibility, performance
- Deliverables: Dashboard, batch tracking, quality inspection, efficiency reports, offline support

**Research & Technology Rationale**: [specs/001-manufacturing-tracking/research.md](../specs/001-manufacturing-tracking/research.md)
- 12 technology decisions (I-XII): Authentication, Real-Time Data, UI Framework, Forms, Traceability, Offline, Performance, Accessibility, Routing, Components, Export, Testing

**Data Model & Entities**: [specs/001-manufacturing-tracking/data-model.md](../specs/001-manufacturing-tracking/data-model.md)
- User, Batch, StageTransition, QualityInspection, DefectRecord, AuditLogEntry, ShippingRecord

**API Contracts & Workflows**: [specs/001-manufacturing-tracking/contracts/](../specs/001-manufacturing-tracking/contracts/)
- api-contracts.md: REST endpoint specifications
- ui-wireframes.md: Page layouts and component mockups
- workflow-diagrams.md: Batch lifecycle and user flows
- data-model-diagram.md: Entity relationship diagram

**Quick Start & Validation**: [specs/001-manufacturing-tracking/quickstart.md](../specs/001-manufacturing-tracking/quickstart.md)
- End-to-end testing scenarios, prerequisites, test user setup
<!-- SPECKIT END -->

