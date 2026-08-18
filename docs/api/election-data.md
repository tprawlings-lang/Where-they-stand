# Phase 1A election data spine

Election records are imported through `@where-they-stand/election-data`. The FEC adapter reads checked-in fixtures only. Future ballot-authority integrations implement `StateElectionSource`; Phase 1A contains no state scrapers.

## Identity and candidacy safety

`Candidate` stores stable person names only. Party, incumbency, filing identifiers/status, ballot status, and ballot provenance belong to a race candidacy. Identity matching requires office, state, cycle, election type, and corroborating data. A name or party never establishes identity. Identifier ownership conflicts return an explicit review result and are not attached.

Election, race, and ballot imports use deterministic, source-scoped keys. FEC filing never establishes ballot qualification. Withdrawals, disqualifications, replacements, and write-ins remain stored with provenance and effective/observation timestamps.

## Issue seed

Run `pnpm --filter @where-they-stand/db db:seed`. The loader discovers every versioned JSON file, validates its filename and contents, and compares it with the approved hash manifest. The transactional seed is idempotent and refuses to overwrite a changed version.

## Read-only API

Responses use strict `{ "ok": true, "data": ... }` or `{ "ok": false, "error": { "code", "message" } }` contracts. UUIDs, slugs, pagination, and allowed query fields are validated. List limits are at most 100.

- `GET /api/v1/issues?limit=50&offset=0`
- `GET /api/v1/issues/{slug}`
- `GET /api/v1/elections/{electionId}/races?limit=50&offset=0`
- `GET /api/v1/races/{raceId}`
- `GET /api/v1/candidates/{candidateId}`

Party is factual candidacy metadata only. Identity, ordering, evidence, and publication decisions do not accept party as a deciding input.
