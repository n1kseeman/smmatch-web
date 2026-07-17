# SMMatch

Production-oriented MVP foundation for an SMM marketplace. The new application
uses Next.js App Router, TypeScript, Tailwind CSS, Supabase/PostgreSQL and
Framer Motion.

The original static prototype remains untouched in the repository (`index.html`,
`css/`, `js/` and the existing HTML route folders). The Next.js application
lives in `src/`, allowing a staged migration instead of a destructive rewrite.

## Start locally

Requirements: Node.js 20.9+ (Node 22 is used by CI/Docker), npm and a Supabase
project. Docker is required only for the optional local Supabase stack.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and the Supabase publishable key before
testing authentication. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

For a horizontally scaled production deployment, generate one persistent
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` and store it in the platform secret
manager. See [the release security checklist](docs/release-security.md) before
exposing the app publicly.

To use local Supabase:

```bash
npx supabase start
npx supabase db reset
npm run db:types
```

Run the full verification pipeline:

```bash
npm run check
```

## Structure

```text
src/
├── app/                 # routes, route groups, layouts, loading/error states
├── entities/            # stable domain types
├── features/            # auth, chat and payment capabilities
├── shared/
│   ├── api/supabase/    # browser, server, admin and proxy clients
│   ├── config/          # runtime environment validation
│   ├── store/           # client-only UI state (Zustand)
│   ├── types/           # generated database types
│   └── ui/              # reusable accessible primitives
└── widgets/             # composed application sections and shells
supabase/
├── migrations/          # schema, constraints, indexes, functions and RLS
└── config.toml          # local Supabase services
```

Server state stays in Supabase and Server Components. Zustand is deliberately
limited to ephemeral UI state; duplicating orders, sessions or chat history in
a global client store would create stale and insecure state.

## Roles and access

- `guest`: anonymous Supabase/Auth context, never persisted as a database user.
- `customer`: customer dashboard and own orders/deals.
- `freelancer`: specialist dashboard, services and proposals.
- `admin`: server-guarded administration workspace.

`src/proxy.ts` refreshes/validates the cookie session. Role-specific layouts
then query `public.users` server-side and enforce role access. PostgreSQL RLS is
the final authorization boundary; UI and route checks are not treated as
security controls.

Self-registration accepts only `customer` or `freelancer`. A database trigger
creates the public profile and ignores attempts to self-assign `admin`.

## Database

The initial migration creates all requested tables:

`users`, `freelancer_profiles`, `services`, `orders`, `proposals`, `deals`,
`messages`, `reviews`, `disputes`, `transactions`, `reports`, and
`notifications`.

It also creates:

- `conversations` and `conversation_participants` for scalable realtime chat;
- `payment_webhook_events` for verified, idempotent webhook processing;
- `device_tokens` for future iOS/Android/web push;
- currency/amount checks, lifecycle enums, foreign keys and query indexes;
- RLS policies for every exposed table;
- Realtime publication for messages, notifications and deal status changes.

Money is stored as integer minor units (`amount_minor`), never floating point.
Provider event IDs and internal idempotency keys are unique.

Apply the migration through the Supabase CLI or the dashboard before enabling
authentication.

## Payments

`src/features/payments/model/provider.ts` defines the provider-neutral contract
for checkout, refund and verified webhook parsing. bePaid and WebPay adapters
must be implemented and certified against provider sandboxes before
`PAYMENTS_ENABLED=true`.

Payment lifecycle writes belong in trusted server code:

1. create a pending `transactions` row with an idempotency key;
2. call the selected adapter;
3. verify the raw webhook signature before parsing;
4. insert the provider event into `payment_webhook_events`;
5. update the transaction and deal in one database transaction;
6. acknowledge duplicate provider events without applying them twice.

Neither payment secrets nor service-role credentials may be imported by Client
Components.

## Deployment

The app supports a normal Node.js deployment and a non-root multi-stage Docker
image. `compose.production.yaml` adds a read-only filesystem, dropped Linux
capabilities and no-new-privileges for a single-host deployment. Configure
environment variables in the target platform, apply migrations as a separate
release step, and use `/api/v1/health` for liveness checks.

Before launch, configure Supabase Auth redirect URLs and update the confirmation
email template to point to:

```text
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
```

Do not use the legacy localStorage auth implementation for production traffic.
