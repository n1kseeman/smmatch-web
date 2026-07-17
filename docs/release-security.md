# Release security checklist

SMMatch is secure by default for its current scope: Supabase RLS is the data
authorization boundary, dashboard layouts enforce roles server-side, and the
application exposes no payment credentials to the client.

## Required before public traffic

1. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin. It must exactly match
   the URL configured in Supabase Auth redirect URLs.
2. Generate and persist `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` in the deployment
   secret manager. All running web instances must receive the same value.
3. Terminate TLS before the app. HSTS is enabled only in production, so the
   domain must be HTTPS-capable before deployment.
4. Apply the Supabase migration and enable email confirmation, password breach
   protection and a rate limit appropriate for the production traffic profile.
5. Keep `SUPABASE_SERVICE_ROLE_KEY`, payment secrets and webhook signing keys
   server-only. Never use a `NEXT_PUBLIC_` name for them.
6. Add the final public domain to Next.js Server Actions `allowedOrigins` only
   if a reverse proxy changes the host seen by the app. Do not use wildcards.
7. Run `npm run check` and `npm audit --omit=dev`; deploy the Docker image as
   the non-root `nextjs` user with a read-only filesystem.

## Protections present in the codebase

- Content Security Policy, clickjacking protection, restrictive permissions
  policy, referrer policy and cross-origin isolation headers.
- CSRF origin validation on route-handler mutations, plus Next.js Server Action
  same-origin validation for the order publishing flow.
- Private no-store caching for authenticated routing and sign-out responses.
- Strict Zod validation for user input and integer minor units for money.
- PostgreSQL constraints, immutable financial order fields after publication,
  RLS policies, and trusted-server boundaries for future payments.

## Scope that remains intentionally disabled

Live payment capture, bePaid/WebPay adapters and payment webhooks are not
enabled until their sandbox credentials, signing specifications and provider
certification are available. The interface and database lifecycle exist, but
`PAYMENTS_ENABLED` must remain `false` until that work is completed.
