-- Phase 1A hardening. Candidate is a person; candidacy facts belong to RaceCandidate.
CREATE TYPE "BallotStatus" AS ENUM ('PENDING','QUALIFIED','WRITE_IN','WITHDRAWN','DISQUALIFIED','NOT_QUALIFIED','REPLACED');
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED','VERIFIED','DISPUTED','REJECTED');

ALTER TABLE "Election" ADD COLUMN "sourceAuthority" TEXT NOT NULL, ADD COLUMN "sourceRecordId" TEXT NOT NULL, ADD COLUMN "importKey" TEXT NOT NULL;
CREATE UNIQUE INDEX "Election_importKey_key" ON "Election"("importKey");
ALTER TABLE "Race" ADD COLUMN "sourceAuthority" TEXT NOT NULL, ADD COLUMN "sourceRecordId" TEXT NOT NULL, ADD COLUMN "importKey" TEXT NOT NULL;
CREATE UNIQUE INDEX "Race_importKey_key" ON "Race"("importKey");
-- NULLS NOT DISTINCT closes the PostgreSQL nullable-key hole for at-large and Senate races.
DROP INDEX IF EXISTS "Race_electionId_office_state_district_specialFlag_key";
CREATE UNIQUE INDEX "Race_natural_key" ON "Race"("electionId","office","state","district","seatClass","specialFlag") NULLS NOT DISTINCT;

ALTER TABLE "RaceCandidate" ADD COLUMN "partyText" TEXT, ADD COLUMN "incumbentFlag" BOOLEAN NOT NULL DEFAULT false,
 ADD COLUMN "fecCandidateId" TEXT, ADD COLUMN "replacedAt" TIMESTAMP(3), ADD COLUMN "replacementCandidateId" UUID,
 ADD COLUMN "writeIn" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "importKey" TEXT NOT NULL,
 ADD COLUMN "observedAt" TIMESTAMP(3) NOT NULL, ADD COLUMN "effectiveAt" TIMESTAMP(3) NOT NULL;
ALTER TABLE "RaceCandidate" RENAME COLUMN "fecFilingStatus" TO "filingStatus";
ALTER TABLE "RaceCandidate" ALTER COLUMN "ballotStatus" TYPE "BallotStatus" USING "ballotStatus"::"BallotStatus";
DROP INDEX IF EXISTS "RaceCandidate_sourceAuthority_sourceRecordId_key";
CREATE UNIQUE INDEX "RaceCandidate_raceId_sourceAuthority_sourceRecordId_key" ON "RaceCandidate"("raceId","sourceAuthority","sourceRecordId");
CREATE UNIQUE INDEX "RaceCandidate_importKey_key" ON "RaceCandidate"("importKey");
ALTER TABLE "RaceCandidate" ADD CONSTRAINT "RaceCandidate_ballotOrder_check" CHECK ("ballotOrder" IS NULL OR "ballotOrder" >= 0),
 ADD CONSTRAINT "RaceCandidate_provenance_check" CHECK (length("sourceAuthority") > 0 AND length("sourceRecordId") > 0),
 ADD CONSTRAINT "RaceCandidate_time_check" CHECK ("observedAt" >= "effectiveAt"),
 ADD CONSTRAINT "RaceCandidate_withdrawn_check" CHECK (("ballotStatus" = 'WITHDRAWN') = ("withdrawnAt" IS NOT NULL)),
 ADD CONSTRAINT "RaceCandidate_disqualified_check" CHECK (("ballotStatus" = 'DISQUALIFIED') = ("disqualifiedAt" IS NOT NULL)),
 ADD CONSTRAINT "RaceCandidate_replaced_check" CHECK (("ballotStatus" = 'REPLACED') = ("replacedAt" IS NOT NULL AND "replacementCandidateId" IS NOT NULL)),
 ADD CONSTRAINT "RaceCandidate_writeIn_check" CHECK (("ballotStatus" = 'WRITE_IN') = "writeIn"),
 ADD CONSTRAINT "RaceCandidate_replacementCandidateId_fkey" FOREIGN KEY ("replacementCandidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT;
UPDATE "RaceCandidate" rc SET "partyText"=c."partyText", "incumbentFlag"=c."incumbentFlag", "fecCandidateId"=c."fecCandidateId" FROM "Candidate" c WHERE c.id=rc."candidateId";
ALTER TABLE "Candidate" DROP COLUMN "partyText", DROP COLUMN "incumbentFlag", DROP COLUMN "fecCandidateId";

DROP TABLE "CandidateExternalId";
CREATE TABLE "CandidateExternalId" (
 "id" UUID NOT NULL, "candidateId" UUID NOT NULL, "authority" TEXT NOT NULL, "identifierType" TEXT NOT NULL,
 "externalId" TEXT NOT NULL, "identityKey" TEXT NOT NULL, "sourceAuthority" TEXT NOT NULL, "sourceRecordId" TEXT NOT NULL, "electionCycle" INTEGER,
 "validFrom" TIMESTAMP(3), "validUntil" TIMESTAMP(3), "verificationMethod" TEXT NOT NULL,
 "verificationStatus" "VerificationStatus" NOT NULL, "confidence" DECIMAL(4,3) NOT NULL,
 "firstObservedAt" TIMESTAMP(3) NOT NULL, "lastObservedAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "CandidateExternalId_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "CandidateExternalId_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT,
 CONSTRAINT "CandidateExternalId_confidence_check" CHECK ("confidence" BETWEEN 0 AND 1),
 CONSTRAINT "CandidateExternalId_validity_check" CHECK ("validUntil" IS NULL OR "validFrom" IS NULL OR "validUntil" >= "validFrom"),
 CONSTRAINT "CandidateExternalId_observation_check" CHECK ("lastObservedAt" >= "firstObservedAt")
);
CREATE UNIQUE INDEX "CandidateExternalId_identityKey_key" ON "CandidateExternalId"("identityKey");
CREATE UNIQUE INDEX "CandidateExternalId_candidateId_sourceAuthority_sourceRecordId_key" ON "CandidateExternalId"("candidateId","sourceAuthority","sourceRecordId");
CREATE INDEX "CandidateExternalId_candidateId_idx" ON "CandidateExternalId"("candidateId");

ALTER TABLE "CandidateAccount" DROP CONSTRAINT "CandidateAccount_platform_accountId_key";
ALTER TABLE "CandidateAccount" ADD COLUMN "sourceAuthority" TEXT NOT NULL, ADD COLUMN "sourceRecordId" TEXT NOT NULL,
 ADD COLUMN "validFrom" TIMESTAMP(3), ADD COLUMN "validUntil" TIMESTAMP(3), ADD COLUMN "observedAt" TIMESTAMP(3) NOT NULL;
ALTER TABLE "CandidateAccount" ALTER COLUMN "status" TYPE "VerificationStatus" USING "status"::"VerificationStatus";
CREATE UNIQUE INDEX "CandidateAccount_candidateId_platform_accountId_key" ON "CandidateAccount"("candidateId","platform","accountId");
ALTER TABLE "CandidateAccount" ADD CONSTRAINT "CandidateAccount_validity_check" CHECK ("validUntil" IS NULL OR "validFrom" IS NULL OR "validUntil" >= "validFrom");

ALTER TABLE "Stance" ADD COLUMN "current" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "Stance_one_current_published" ON "Stance"("candidateId","issueVersionId") WHERE "status"='PUBLISHED' AND "current";
CREATE UNIQUE INDEX "Stance_supersedesId_key" ON "Stance"("supersedesId") WHERE "supersedesId" IS NOT NULL;

CREATE FUNCTION enforce_evidence_scope() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE source_candidate UUID;
BEGIN
 SELECT s."candidateId" INTO source_candidate FROM "SourcePassage" p JOIN "Source" s ON s.id=p."sourceId" WHERE p.id=NEW."sourcePassageId";
 IF source_candidate IS DISTINCT FROM NEW."candidateId" THEN RAISE EXCEPTION 'evidence candidate does not match source candidate'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER evidence_scope BEFORE INSERT OR UPDATE ON "Evidence" FOR EACH ROW EXECUTE FUNCTION enforce_evidence_scope();

CREATE FUNCTION enforce_stance_evidence_scope() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE sc UUID; si UUID; ec UUID; ei UUID; approved TIMESTAMP;
BEGIN
 SELECT "candidateId","issueVersionId" INTO sc,si FROM "Stance" WHERE id=NEW."stanceId";
 SELECT "candidateId","issueVersionId","approvedAt" INTO ec,ei,approved FROM "Evidence" WHERE id=NEW."evidenceId";
 IF sc IS DISTINCT FROM ec OR si IS DISTINCT FROM ei THEN RAISE EXCEPTION 'stance evidence scope mismatch'; END IF;
 IF approved IS NULL THEN RAISE EXCEPTION 'stance evidence must be approved'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER stance_evidence_scope BEFORE INSERT OR UPDATE ON "StanceEvidence" FOR EACH ROW EXECUTE FUNCTION enforce_stance_evidence_scope();

CREATE FUNCTION enforce_stance_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pc UUID; pi UUID; ok BOOLEAN;
BEGIN
 IF NEW."supersedesId" IS NOT NULL THEN
  SELECT "candidateId","issueVersionId" INTO pc,pi FROM "Stance" WHERE id=NEW."supersedesId";
  IF pc IS DISTINCT FROM NEW."candidateId" OR pi IS DISTINCT FROM NEW."issueVersionId" THEN RAISE EXCEPTION 'stance history scope mismatch'; END IF;
 END IF;
 IF NEW.status='PUBLISHED' THEN
  IF NEW.label IN ('SUPPORTS','OPPOSES','DIFFERENT_APPROACH') THEN
   SELECT EXISTS(SELECT 1 FROM "StanceEvidence" se JOIN "Evidence" e ON e.id=se."evidenceId" WHERE se."stanceId"=NEW.id AND e."approvedAt" IS NOT NULL AND e."candidateId"=NEW."candidateId" AND e."issueVersionId"=NEW."issueVersionId") INTO ok;
  ELSIF NEW.label='NO_PUBLIC_POSITION' THEN
   SELECT EXISTS(SELECT 1 FROM "ResearchJob" r WHERE r."candidateId"=NEW."candidateId" AND r."issueVersionId"=NEW."issueVersionId" AND r.status='COMPLETED' AND r."finishedAt" IS NOT NULL) INTO ok;
  ELSE
   SELECT EXISTS(SELECT 1 FROM "CampaignResponse" r WHERE r."candidateId"=NEW."candidateId" AND r."issueVersionId"=NEW."issueVersionId" AND r.answer='DECLINED_TO_STATE' AND r."verifiedSubmitter") INTO ok;
  END IF;
  IF NOT coalesce(ok,false) THEN RAISE EXCEPTION 'published stance lacks required verification'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER stance_integrity AFTER INSERT OR UPDATE ON "Stance" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_stance_integrity();
