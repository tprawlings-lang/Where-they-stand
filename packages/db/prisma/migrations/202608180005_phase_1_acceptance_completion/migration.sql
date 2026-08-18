-- Complete Phase 1 acceptance enforcement for StanceEvidence reassignment.
-- A deferred UPDATE must revalidate both the association it removed and the
-- association it created; validating NEW alone can orphan a published stance.
CREATE OR REPLACE FUNCTION revalidate_stance_evidence_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM validate_published_stance(NEW."stanceId");
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM validate_published_stance(OLD."stanceId");
  ELSIF OLD."stanceId" = NEW."stanceId" THEN
    PERFORM validate_published_stance(NEW."stanceId");
  ELSE
    PERFORM validate_published_stance(OLD."stanceId");
    PERFORM validate_published_stance(NEW."stanceId");
  END IF;
  RETURN coalesce(NEW, OLD);
END $$;
