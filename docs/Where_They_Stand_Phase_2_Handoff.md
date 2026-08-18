# Where They Stand - Phase 2 Public MVP Handoff

Prepared: August 18, 2026

Repository: `tprawlings-lang/Where-they-stand`

Long-lived integration branch: `agent/repository-foundation`

Accepted Phase 1 baseline: `c4fcdf49f1c250681156176693f456f9a3449593`

Draft foundation PR: `#1`, from `agent/repository-foundation` into `main`

## 1. Purpose

Phase 1 is accepted. Phase 2 turns the accepted data foundation into the first public-facing product without starting research automation, live candidate scraping, AI classification, campaign outreach, or voter matching.

The technical handoff defines Phase 2 as the Public MVP:

- Home, issue, race, candidate, and methodology pages.
- Address and district lookup.
- Static stance records entered through an admin workflow.
- Evidence viewing and source links.
- A responsive, politically neutral design system.

This handoff divides that scope into smaller pull requests. The first implementation task is Phase 2A, the public read-only experience. Later Phase 2 work must build on the same accepted branch and must not be folded prematurely into Phase 2A.

## 2. Phase 1 baseline that must be reused

The following work already exists and must not be rebuilt:

### Repository and runtime foundation

- pnpm 10 workspace and Turborepo monorepo.
- Next.js App Router web application with TypeScript strict mode.
- Shared `contracts`, `db`, `issue-definitions`, and `ui` packages.
- Python worker skeleton with Ruff, mypy, and pytest checks.
- PostgreSQL and Redis local infrastructure.
- Frozen `pnpm-lock.yaml` dependency resolution.
- GitHub Actions jobs for JavaScript/TypeScript, PostgreSQL, build, and Python validation.

### Election and issue data spine

- All 15 approved issue definitions and versioned issue seeding.
- Strict protection against silently overwriting active canonical issue wording.
- Election, Race, Candidate, RaceCandidate, CandidateAccount, and CandidateExternalId models.
- Separation of FEC filing status from official ballot status.
- Preservation of withdrawn, disqualified, write-in, and replacement candidate records.
- Fixture-based FEC normalization without live network collection.
- A state election-source interface for later official ballot adapters.
- Candidate identity resolution using office, state, cycle, special-election status, and documented external-identifier rules.
- Stable-person bridging only for approved stable identifier types.
- Unknown identifier types treated as candidacy-scoped.
- Conflict and ambiguity handling that prevents incorrect candidate associations.

### Existing read-only APIs

- `GET /api/v1/issues`
- `GET /api/v1/issues/{slug}`
- `GET /api/v1/elections/{electionId}/races`
- `GET /api/v1/races/{raceId}`
- `GET /api/v1/candidates/{candidateId}`
- Typed success/error envelopes and Zod contracts.

### Position and evidence integrity

- Source, SourcePassage, Evidence, Stance, StanceEvidence, ResearchJob, CampaignResponse, CorrectionCase, and AuditEvent models.
- Published substantive stances require qualifying approved evidence.
- `NO_PUBLIC_POSITION` requires a completed research record.
- `DECLINED_TO_STATE` requires a qualifying verified campaign response.
- Deferred database enforcement when evidence, research records, or campaign responses are changed or removed.
- Revalidation of both old and new stances when StanceEvidence is reassigned.
- Versioned stance history with scope, chronological, branching, self-reference, and cycle protections.
- Uncached PostgreSQL acceptance tests with required `DATABASE_URL` forwarding.

### Accepted quality state

- Phase 1 acceptance review returned `PASS: Phase 1 accepted`.
- GitHub Actions passed at the accepted Phase 1 head.
- PostgreSQL integration tests execute in CI rather than silently skipping.
- README and both PDF handoffs remain preserved.
- No Phase 1 implementation blockers remain.

## 3. Current gaps Phase 2 must address

- Public route files exist but most are placeholders.
- Shared UI components are minimal structural primitives rather than a finished Public MVP system.
- The current public APIs do not yet provide race comparison, candidate stance history, or stance evidence responses.
- Address and district lookup is not implemented.
- There is no safe admin workflow for entering and publishing static stances.
- There is no completed accessible evidence drawer.
- Public page accessibility and end-to-end coverage are not yet at Phase 2 acceptance level.

## 4. Phase 2 delivery plan

### Phase 2A - Public read-only experience

Build the public home, issue, race, candidate, and methodology experiences. Add the typed public read models and APIs needed for published stance history and evidence. Complete the neutral responsive UI components and their test coverage.

### Phase 2B - Address and district lookup

Add address-based race lookup behind a provider interface, with raw-address discard by default. Add state/district manual fallback, strict input validation, rate limiting, safe logs, and mocked CI tests that require no external key.

### Phase 2C - Static stance entry and controlled publication

Add a server-protected admin workflow for manually entering sources, evidence, and static stance records. Do not expose an unauthenticated write route. If an authentication provider has not been selected, stop for that owner decision before adding a vendor-specific login system. Preserve reviewer approval, audit history, evidence prerequisites, and versioned publication.

### Phase 2D - Public MVP acceptance and hardening

Add end-to-end tests for public navigation, issue browsing, race comparison, candidate history, evidence viewing, address lookup, and the authorized static-publication path. Complete WCAG 2.2 AA checks for the Phase 2 flows, mobile testing, metadata, privacy checks, performance checks, and the final Phase 2 acceptance review.

## 5. Phase 2A implementation handoff

Copy the task below into a new Codex task.

### Repository selection

- Repository: `tprawlings-lang/Where-they-stand`
- Starting branch: `agent/repository-foundation`
- Expected starting commit: `c4fcdf49f1c250681156176693f456f9a3449593`, or a later descendant containing it
- Pull-request base: `agent/repository-foundation`
- Never target or merge into `main`

### Exact Codex task

```text
Implement Phase 2A of the Where They Stand Public MVP.

Repository: tprawlings-lang/Where-they-stand
Starting branch: agent/repository-foundation
Accepted Phase 1 baseline: c4fcdf49f1c250681156176693f456f9a3449593
Pull-request base: agent/repository-foundation

Do not merge anything into main. Do not update the base of draft PR #1. Work on a new task branch and open a pull request back into agent/repository-foundation.

Before making changes:

1. Confirm the selected starting branch contains commit c4fcdf49f1c250681156176693f456f9a3449593. A later descendant is acceptable.
2. Confirm the working tree is clean.
3. Read README.md completely.
4. Read both PDF handoffs in /docs completely, page by page:
   - docs/where_they_stand_repo_coding_handoff.pdf
   - docs/where_they_stand_technical_handoff.pdf
5. Inspect the existing schema, migrations, Phase 1 acceptance tests, election-data service, contracts, APIs, UI package, route placeholders, and CI workflow.
6. Treat the accepted Phase 1 implementation as the baseline. Reuse it. Do not rebuild or weaken it.

Preservation requirements:

- Preserve README.md and both handoff PDFs unchanged.
- Do not edit any already-applied migration. Use an additive migration only if Phase 2A truly requires a database change.
- Do not weaken, skip, delete, or cache existing PostgreSQL acceptance tests.
- Preserve all Phase 1 identity, evidence, publication, and stance-history protections.
- Do not rewrite Git history or force-push.

Implement only Phase 2A: the public read-only experience.

A. Public read contracts and data access

- Extend shared TypeScript/Zod contracts for public race comparison, candidate stances, stance history, and stance evidence.
- Add the smallest maintainable read/query layer needed by the public pages.
- Add read-only endpoints or server-side query functions for:
  - race comparison;
  - candidate current published stances and prior published stance history;
  - stance evidence and public source provenance.
- Return only public-safe data.
- Never expose draft or pending stances, reviewer identity, internal reviewer notes, correction contact data, raw voter addresses, model prompts, model confidence, private source content, or internal audit details.
- Validate all path and query parameters with typed error envelopes.
- Return stable not-found, empty-state, and internal-error responses.

B. Publication and evidence rules in the read layer

- Public views may display only records that satisfy the existing database publication rules.
- A substantive published stance must have qualifying approved evidence.
- NO_PUBLIC_POSITION must represent a completed research pass with no qualifying public position, never opposition.
- DECLINED_TO_STATE must come from a qualifying verified campaign response.
- Display stance history without deleting or hiding earlier published positions.
- Keep party affiliation as factual metadata only. It must never determine, rank, filter, infer, or style a stance.

C. Public pages

Replace the current placeholders with working pages:

1. Home page `/`
   - Product promise.
   - Primary Find My Races action.
   - Secondary Browse the 15 Issues action.
   - Three-step explanation: find the race, compare positions, inspect sources.
   - All 15 issues grouped under the approved neutral subject categories.
   - Methodology statement: no endorsements, no party inference, every published substantive stance sourced.
   - Do not build live address lookup in this task. The Find action may lead to the existing Phase 2B placeholder with honest coming-next language.

2. Issues index `/issues`
   - Show all active issue versions in the fixed approved order.
   - Group them under the neutral subject categories from the technical handoff.
   - Do not use partisan labels or visual grouping.

3. Issue detail `/issue/[slug]`
   - Neutral title.
   - Working bill concept.
   - Goal.
   - Exact canonical question.
   - Election cycle and version.
   - Plain explanation of the stance labels.
   - Clear versioning language stating that material wording changes create a new version.

4. Race page `/races/[raceId]`
   - Office, state/district, election date, special-election status, and official-source metadata when present.
   - Every active ballot-qualified candidate shown under the same inclusion rule.
   - Use official ballot order when available. Otherwise sort alphabetically by surname with a stable tie-breaker.
   - Disclose which ordering rule was used.
   - Give every candidate equal card/table geometry and the same fields.
   - Show one neutral text stance label per issue for each candidate.
   - On mobile, use issue-by-issue cards instead of a squeezed comparison table.
   - Do not present a preferred candidate, recommendation, ideology score, or winner.

5. Candidate page `/candidate/[candidateId]`
   - Display name, office/race context, factual party metadata, ballot status, and verified official accounts when present.
   - Current published stances.
   - Prior published stance history with effective dates.
   - Equal presentation for every stance label.
   - Do not show internal identity-resolution data or private records.

6. Methodology `/methodology`
   - Explain stance labels, evidence hierarchy, issue versioning, neutrality rules, candidate ordering, source links, and correction principles using the existing approved documentation.
   - State directly that party affiliation cannot establish a stance and silence is not opposition.

D. Evidence viewing

- Build an accessible evidence drawer, dialog, or disclosure component.
- It must show:
  - stance label;
  - canonical issue question/version;
  - evidence/source type;
  - source title when available;
  - statement/publication date when available;
  - retrieval or verification date;
  - a short permitted excerpt or neutral summary;
  - external source link;
  - position-history context when applicable.
- Do not republish large copyrighted passages.
- Support keyboard opening, focus management, Escape to close when using a dialog, visible focus, screen-reader labeling, and focus return.
- Evidence links must clearly identify that they leave Where They Stand when external.

E. Neutral responsive design system

- Reuse and extend packages/ui rather than copying components into pages.
- Use the approved visual direction: warm white/light gray, charcoal/deep slate, and muted teal accent.
- Do not use political red-versus-blue styling, flags as decoration, patriotic campaign imagery, thumbs-up/down icons, podium imagery, or horse-race graphics.
- Supports and Opposes must use identical geometry, font weight, prominence, and interaction behavior.
- All stance meaning must be available in text, not color alone.
- Add responsive navigation, consistent page containers, readable typography, cards, tables/card alternatives, chips, evidence controls, loading states, empty states, errors, and not-found pages.
- Respect reduced motion.
- Use server components by default. Add client components only where interaction requires them.

F. Test data and fixtures

- Use deterministic, fictional, multi-party and independent fixtures for tests and previews.
- Do not scrape, fetch, identify, or classify live candidates.
- Do not silently add fake candidates to the normal production seed.
- If a development-only demo seed is useful, make it an explicit command, clearly label it non-production, make it idempotent, and test that it cannot run accidentally in production.

G. Required tests

- Contract tests for every new public response.
- Query/repository tests proving only public-safe published records are returned.
- PostgreSQL integration coverage for the new public read paths where database behavior matters.
- Race ordering tests for official ballot order and alphabetical fallback.
- Equal candidate inclusion tests.
- Stance-history ordering tests.
- Evidence filtering and provenance tests.
- Tests proving draft/private/internal records are never returned.
- Neutrality regression tests including party swap, silence, question-version parity, candidate ordering, and equal stance presentation.
- Component/page tests for loading, empty, not-found, and error states.
- Accessibility tests for keyboard operation, accessible names, focus behavior, headings, and text-based stance meaning.
- Responsive behavior tests where practical.
- At least one public navigation smoke test covering home -> issues -> issue detail and race -> candidate -> evidence.

H. Required validation

Run and report:

- pnpm install --frozen-lockfile
- pnpm --filter @where-they-stand/db exec prisma migrate deploy with a disposable PostgreSQL database
- pnpm --filter @where-they-stand/db db:validate
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm test:db with DATABASE_URL present; report executed test counts and confirm zero skipped database suites
- pnpm build
- the direct neutrality suite
- cd apps/worker && python -m pip install -e '.[dev]'
- cd apps/worker && ruff check .
- cd apps/worker && mypy src tests
- cd apps/worker && pytest
- git diff --check
- a final clean-working-tree check after committing

Do not hide a failure behind passWithNoTests, describe.skip, missing environment variables, test filtering, or Turbo cache. If the local Codex environment cannot download Prisma engines, still fix repository failures, use GitHub Actions as the required final execution environment, and report the environment limitation separately. Do not treat an unexecuted test as passing.

I. Explicit exclusions for Phase 2A

Do not implement:

- address-to-district lookup or Google Civic calls;
- production address retention;
- voter accounts or saved voter answers;
- voter match or candidate agreement scoring;
- admin stance-entry or publication forms;
- authentication provider integration;
- live FEC or state imports;
- candidate website crawling;
- social platform collection;
- AI extraction, stance classification, or automatic publication;
- campaign outreach, campaign responses, or correction intake;
- recommendation language such as Best Candidate or Recommended Candidate;
- advertising, donations, targeting, or analytics based on political answers;
- a finished brand identity beyond the approved neutral Public MVP system.

J. Commit and pull-request workflow

- Work in logical commits. Suggested units:
  1. feat: add public stance and evidence read contracts
  2. feat: add public read queries and API routes
  3. feat: build neutral public UI system
  4. feat: implement issue and methodology pages
  5. feat: implement race and candidate pages
  6. test: add Phase 2A public and accessibility coverage
- Rebase or update safely from agent/repository-foundation before opening the PR if the base moved.
- Push the task branch.
- Open a pull request with base agent/repository-foundation, not main.
- Leave the PR open for review. Do not merge it.
- Do not mark draft PR #1 ready and do not merge draft PR #1 into main.

K. Definition of done

Phase 2A is complete only when:

- all six public pages above are functional and no longer placeholders;
- published stance and evidence data reach the UI through typed public-safe reads;
- evidence viewing is keyboard and screen-reader usable;
- candidate ordering and equal presentation rules are visible and tested;
- all 15 issue definitions render from the protected versioned source;
- responsive mobile layouts work without compressing the comparison table into an unusable view;
- draft/private/internal data are excluded by tests;
- the existing Phase 1 PostgreSQL acceptance suite still executes and passes;
- all required JavaScript, TypeScript, PostgreSQL, Python, neutrality, accessibility, and production-build checks pass in GitHub Actions;
- README.md and both PDF handoffs remain unchanged;
- the pull request targets agent/repository-foundation and remains unmerged.

At completion, report:

- branch and commit list;
- pull-request URL and base branch;
- files and public routes changed;
- database or API changes;
- exact test commands, counts, skipped tests, and results;
- GitHub Actions result;
- confirmation that README.md and both PDFs are unchanged;
- remaining work for Phase 2B, 2C, and 2D;
- any genuine owner decision required before the next task.
```

## 6. Owner instructions for starting Phase 2A

1. Open a new Codex task.
2. Select `tprawlings-lang/Where-they-stand`.
3. Select `agent/repository-foundation` as the starting branch.
4. Paste the Exact Codex task above.
5. Start the task.
6. When Codex opens the pull request, confirm the top line says it will merge into `agent/repository-foundation`.
7. Do not merge the pull request until every GitHub Actions check is green and a separate acceptance review passes.
8. Do not merge draft PR #1 into `main`.

## 7. Review handoff after implementation

After the implementation PR is green, start a separate read-only Codex review from `agent/repository-foundation` after the Phase 2A PR is merged into that branch. The review must read both PDFs again, verify the Phase 2A definition of done, run all available tests, inspect public-data privacy boundaries, and report PASS or FAIL without changing files.
