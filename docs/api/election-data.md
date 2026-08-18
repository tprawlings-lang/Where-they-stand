# Phase 1A election data spine

Election records are imported through `@where-they-stand/election-data`. The Phase 1A FEC adapter accepts checked-in fixtures only; it deliberately does not perform network requests. State ballot authorities can later implement `StateElectionSource` without changing import services.

Candidate identity is scoped by office, state, and cycle, then requires a matching external identifier or corroborating identity field. A name match alone creates a distinct record. FEC filing status and official ballot status are separate fields. Withdrawn and disqualified associations remain stored with timestamps.

## Issue seed

Run `pnpm --filter @where-they-stand/db db:seed`. The seed is idempotent. If the content hash or canonical question for an existing version differs, it stops rather than overwriting published wording; add a new versioned definition instead.

## Read-only API

All responses use `{ "ok": true, "data": ... }` or `{ "ok": false, "error": { "code", "message" } }`.

- `GET /api/v1/issues`
- `GET /api/v1/issues/{slug}`
- `GET /api/v1/elections/{electionId}/races`
- `GET /api/v1/races/{raceId}`
- `GET /api/v1/candidates/{candidateId}`

Party is returned only as factual candidate metadata. It is not supplied to any stance or identity decision.
