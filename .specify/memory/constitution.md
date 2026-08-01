# Factory Plaster Parts Manufacturing System Constitution

This constitution establishes non-negotiable principles for the development of a comprehensive manufacturing tracking and management system for gypsum tile production, from planning through fabrication to expedition.

## Core Principles

### I. Trust Through Evidence, Not Presumption
Every screen, interaction, and feature must actively demonstrate credibility and professionalism. Trust is built through visible proof: clear data presentation, accurate tracking information, documented processes, and transparent status updates. The system must establish professional authority from the first interaction. All features MUST include evidence of manufacturing stage validity and traceability.

### II. Mobile-First & Responsive Design
The system is optimized for mobile devices as the primary interface, ensuring factory floor workers, supervisors, and managers can access critical information on smartphones and tablets. Desktop interfaces expand functionality but must not compromise mobile usability. All workflows must function seamlessly on devices with screen sizes from 320px to 768px width.

### III. Clarity Over Empty Aesthetics
Visual design serves clarity and usability, never decoration. Every design element communicates information or enables action. Unnecessary visual flourishes are eliminated. Professional consistency is maintained through systematic use of color, typography, and spacing—not through complexity. Data visualization MUST be immediately understandable without legends or explanations when possible.

### IV. Professionalism & Consistency
The interface presents a unified, polished professional image across all modules (planning, fabrication, expedition, tracking). Design system adherence is mandatory. Visual consistency builds user confidence in the system's reliability. All UI patterns MUST follow established design guidelines; no ad-hoc component creation.

### V. Accessibility as a Core Requirement (Not Optional)
All features MUST meet WCAG 2.1 AA accessibility standards. This includes semantic HTML structure, keyboard navigation, color contrast ratios ≥4.5:1 for text, screen reader compatibility, and form accessibility. Accessibility is validated during development, not as an afterthought.

### VI. Performance as Part of Quality
Page load times, interaction responsiveness, and data retrieval speed directly impact user trust and system reliability. Core pages MUST load in ≤2 seconds on 4G connections. Database queries MUST return results within 500ms for standard operations. Performance is measured continuously and regressions are treated as defects.

### VII. Clean Code & Maintainability
Code is written for humans to read and understand first, machines second. All code MUST follow clean code principles: single responsibility, meaningful naming, minimal nesting, clear separation of concerns. Technical debt is tracked explicitly. Code reviews verify readability and maintainability before merge.

### VIII. Semantic Structure & Local SEO
HTML structure uses semantic elements correctly (nav, main, article, section). Heading hierarchy is logical and non-decorative. Microdata or schema.org markup is applied where appropriate. Local SEO optimization supports business discoverability through structured data and semantic clarity.

### IX. Rastreabilidade & Data Integrity
Every action in the system creates an auditable trail. Manufacturing stages, changes, and updates MUST be logged with timestamps and user attribution. Data integrity constraints are enforced at the database level. No silent failures; all errors are logged and reported.

## Product & Content Requirements

- **Manufacturing Process Mapping**: Every fabrication stage (mixing, molding, curing, finishing, quality check, packaging, shipping) MUST be representable and trackable in the system.
- **Real-Time Status Updates**: Production status changes MUST be reflected immediately or within 30 seconds maximum.
- **Traceability Records**: Each tile batch MUST maintain complete provenance from production start to expedition.
- **Efficiency Metrics**: System MUST surface waste reduction opportunities and production bottlenecks through data visualization.

## Technical Implementation Standards

- **Framework & Architecture**: Use modern, maintainable frameworks with proven production track records. Architecture MUST support independent scaling of frontend, backend, and database layers.
- **Database Design**: Normalized schema with explicit foreign keys. Audit tables for change tracking. No denormalization without documented performance justification.
- **API Contracts**: Clear, documented REST or GraphQL APIs with versioning strategy. Response formats MUST be consistent and self-describing.
- **Error Handling**: Fail explicitly with descriptive error messages. User-facing errors avoid technical jargon; logs capture technical detail.
- **Security**: Authentication and authorization at all endpoints. Sensitive data encrypted in transit and at rest. Input validation on all user entries. No automated tests is acceptable; quality assurance is manual and thorough.

## Code Organization & Maintenance

- **Repository Structure**: Logical folder hierarchy (components, services, models, utils, styles). Avoid monolithic files; functions under 50 lines preferentially.
- **Naming Conventions**: Names convey intent. Variables and functions clearly describe their purpose. No abbreviations except universally accepted ones (id, url, etc.).
- **Documentation**: README.md for each major module. Inline comments for complex logic only (not for obvious code). API documentation is auto-generated or maintained separately.
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH). Breaking changes increment MAJOR version and require migration documentation.

## Governance

This constitution supersedes all other project guidelines. All decisions—architectural, design, content, and technical—must align with these principles.

**Amendment Process**:
1. Amendments are documented with clear rationale and impact analysis
2. Changes that remove or fundamentally alter principles require stakeholder approval
3. All changes increment the version number according to semantic versioning
4. Compliance reviews occur quarterly and whenever major features are shipped

**Compliance Verification**:
- Code reviews verify adherence to technical principles
- Design reviews verify adherence to UX/UI/clarity principles  
- Testing and QA verify data integrity and rastreabilidade principles
- Performance monitoring tracks compliance with performance standards

**Version**: 1.0.0 | **Ratified**: 2026-08-01 | **Last Amended**: 2026-08-01
