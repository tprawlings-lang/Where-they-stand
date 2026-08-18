-- Election data provenance, identity aliases, and immutable issue definition metadata.
ALTER TABLE "Election" ADD CONSTRAINT "Election_cycle_name_key" UNIQUE ("cycle", "name");
CREATE UNIQUE INDEX "Race_electionId_office_state_district_specialFlag_key" ON "Race"("electionId", "office", "state", "district", "specialFlag");

CREATE TABLE "CandidateExternalId" (
  "id" UUID NOT NULL,
  "candidateId" UUID NOT NULL,
  "authority" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateExternalId_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateExternalId_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CandidateExternalId_authority_externalId_key" ON "CandidateExternalId"("authority", "externalId");
CREATE INDEX "CandidateExternalId_candidateId_idx" ON "CandidateExternalId"("candidateId");

ALTER TABLE "RaceCandidate"
  ADD COLUMN "disqualifiedAt" TIMESTAMP(3),
  ADD COLUMN "fecFilingStatus" TEXT,
  ADD COLUMN "sourceAuthority" TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN "sourceRecordId" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX "RaceCandidate_sourceAuthority_sourceRecordId_key" ON "RaceCandidate"("sourceAuthority", "sourceRecordId");

ALTER TABLE "IssueVersion"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN "definitionHash" TEXT NOT NULL DEFAULT '';
