# Architecture notes

## Request and authorization path

```mermaid
flowchart LR
  A[Browser / future mobile app] --> B[Next.js routes or versioned API]
  B --> C[Supabase Auth cookie or bearer token]
  C --> D[Server role guard]
  D --> E[PostgreSQL + RLS]
  E --> F[Realtime changes]
  F --> A
```

The browser uses a publishable key and receives only rows allowed by RLS.
Privileged moderation and payment orchestration use a server-only client after
their own role/input checks.

## Core marketplace relationships

```mermaid
erDiagram
  USERS ||--o| FREELANCER_PROFILES : owns
  USERS ||--o{ SERVICES : publishes
  USERS ||--o{ ORDERS : creates
  ORDERS ||--o{ PROPOSALS : receives
  ORDERS ||--o| DEALS : becomes
  DEALS ||--o{ TRANSACTIONS : settles
  DEALS ||--o{ DISPUTES : may_have
  DEALS ||--o{ REVIEWS : receives
  CONVERSATIONS ||--o{ CONVERSATION_PARTICIPANTS : includes
  CONVERSATIONS ||--o{ MESSAGES : contains
  USERS ||--o{ NOTIFICATIONS : receives
```

## Boundaries

- `app`: transport and rendering. Business rules should not accumulate here.
- `features`: use cases and provider contracts.
- `entities`: domain vocabulary shared between features.
- `shared`: framework integration and reusable primitives with no marketplace
  feature ownership.
- PostgreSQL: integrity, ownership and row authorization.

Chat messages are cursor-paginated by `(created_at, id)`. Realtime is a delivery
optimization, not the source of truth; reconnects must fetch missed rows.

The payment event inbox is private. Raw payload retention and redaction must be
agreed with each provider and local compliance requirements before launch.
