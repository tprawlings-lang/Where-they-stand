-- Revalidate support when a dependent row changes, and make stance history a DAG.
CREATE FUNCTION validate_published_stance(stance_id UUID) RETURNS void LANGUAGE plpgsql AS $$
DECLARE s "Stance"%ROWTYPE; ok BOOLEAN;
BEGIN
 SELECT * INTO s FROM "Stance" WHERE id=stance_id;
 IF NOT FOUND OR s.status <> 'PUBLISHED' THEN RETURN; END IF;
 IF s.label IN ('SUPPORTS','OPPOSES','DIFFERENT_APPROACH') THEN
  SELECT EXISTS(SELECT 1 FROM "StanceEvidence" se JOIN "Evidence" e ON e.id=se."evidenceId" WHERE se."stanceId"=s.id AND e."approvedAt" IS NOT NULL AND e."candidateId"=s."candidateId" AND e."issueVersionId"=s."issueVersionId") INTO ok;
 ELSIF s.label='NO_PUBLIC_POSITION' THEN
  SELECT EXISTS(SELECT 1 FROM "ResearchJob" r WHERE r."candidateId"=s."candidateId" AND r."issueVersionId"=s."issueVersionId" AND r.status='COMPLETED' AND r."finishedAt" IS NOT NULL) INTO ok;
 ELSE
  SELECT EXISTS(SELECT 1 FROM "CampaignResponse" r WHERE r."candidateId"=s."candidateId" AND r."issueVersionId"=s."issueVersionId" AND r.answer='DECLINED_TO_STATE' AND r."verifiedSubmitter") INTO ok;
 END IF;
 IF NOT coalesce(ok,false) THEN RAISE EXCEPTION 'published stance lacks required verification'; END IF;
END $$;

CREATE FUNCTION revalidate_stance_evidence_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN PERFORM validate_published_stance(coalesce(NEW."stanceId",OLD."stanceId")); RETURN coalesce(NEW,OLD); END $$;
CREATE CONSTRAINT TRIGGER stance_evidence_dependency AFTER INSERT OR UPDATE OR DELETE ON "StanceEvidence" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION revalidate_stance_evidence_change();

CREATE FUNCTION revalidate_evidence_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE stance_id UUID;
BEGIN
 FOR stance_id IN SELECT "stanceId" FROM "StanceEvidence" WHERE "evidenceId"=coalesce(NEW.id,OLD.id) LOOP PERFORM validate_published_stance(stance_id); END LOOP;
 RETURN coalesce(NEW,OLD);
END $$;
CREATE CONSTRAINT TRIGGER evidence_dependency AFTER UPDATE OR DELETE ON "Evidence" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION revalidate_evidence_change();

CREATE FUNCTION revalidate_research_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE stance_id UUID;
BEGIN
 FOR stance_id IN SELECT id FROM "Stance" WHERE label='NO_PUBLIC_POSITION' AND status='PUBLISHED' AND (("candidateId"=OLD."candidateId" AND "issueVersionId"=OLD."issueVersionId") OR (TG_OP<>'DELETE' AND "candidateId"=NEW."candidateId" AND "issueVersionId"=NEW."issueVersionId")) LOOP PERFORM validate_published_stance(stance_id); END LOOP;
 RETURN coalesce(NEW,OLD);
END $$;
CREATE CONSTRAINT TRIGGER research_dependency AFTER UPDATE OR DELETE ON "ResearchJob" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION revalidate_research_change();

CREATE FUNCTION revalidate_response_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE stance_id UUID;
BEGIN
 FOR stance_id IN SELECT id FROM "Stance" WHERE label='DECLINED_TO_STATE' AND status='PUBLISHED' AND (("candidateId"=OLD."candidateId" AND "issueVersionId"=OLD."issueVersionId") OR (TG_OP<>'DELETE' AND "candidateId"=NEW."candidateId" AND "issueVersionId"=NEW."issueVersionId")) LOOP PERFORM validate_published_stance(stance_id); END LOOP;
 RETURN coalesce(NEW,OLD);
END $$;
CREATE CONSTRAINT TRIGGER campaign_response_dependency AFTER UPDATE OR DELETE ON "CampaignResponse" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION revalidate_response_change();

CREATE OR REPLACE FUNCTION enforce_stance_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE prior "Stance"%ROWTYPE; cycle_found BOOLEAN;
BEGIN
 IF NEW."supersedesId" IS NOT NULL THEN
  IF NEW."supersedesId"=NEW.id THEN RAISE EXCEPTION 'stance cannot supersede itself'; END IF;
  SELECT * INTO prior FROM "Stance" WHERE id=NEW."supersedesId";
  IF prior."candidateId" IS DISTINCT FROM NEW."candidateId" OR prior."issueVersionId" IS DISTINCT FROM NEW."issueVersionId" THEN RAISE EXCEPTION 'stance history scope mismatch'; END IF;
  IF NEW."effectiveAt" < prior."effectiveAt" THEN RAISE EXCEPTION 'stance history effectiveAt must be chronological'; END IF;
  WITH RECURSIVE ancestors(id) AS (SELECT NEW."supersedesId" UNION SELECT s."supersedesId" FROM "Stance" s JOIN ancestors a ON s.id=a.id WHERE s."supersedesId" IS NOT NULL) SELECT EXISTS(SELECT 1 FROM ancestors WHERE id=NEW.id) INTO cycle_found;
  IF cycle_found THEN RAISE EXCEPTION 'stance history cycle'; END IF;
 END IF;
 PERFORM validate_published_stance(NEW.id);
 RETURN NEW;
END $$;
