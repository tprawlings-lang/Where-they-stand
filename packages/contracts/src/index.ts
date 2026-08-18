import { z } from "zod";

export const CandidateStanceSchema = z.enum(["SUPPORTS", "OPPOSES", "DIFFERENT_APPROACH", "NO_PUBLIC_POSITION", "DECLINED_TO_STATE"]);
export type CandidateStance = z.infer<typeof CandidateStanceSchema>;
export const CandidateIdSchema = z.string().uuid().brand<"CandidateId">();
export const RaceIdSchema = z.string().uuid().brand<"RaceId">();
export const IssueVersionIdSchema = z.string().uuid().brand<"IssueVersionId">();
export const EvidenceReferenceSchema = z.object({ id: z.string().uuid(), url: z.string().url(), sourceType: z.string(), publishedAt: z.string().datetime().nullable() });
export const StanceResultSchema = z.object({ candidateId: CandidateIdSchema, issueVersionId: IssueVersionIdSchema, label: CandidateStanceSchema, lastVerifiedAt: z.string().datetime(), evidence: z.array(EvidenceReferenceSchema) });
export const ApiResultSchema = <T extends z.ZodType>(data: T) => z.discriminatedUnion("ok", [z.object({ ok: z.literal(true), data }), z.object({ ok: z.literal(false), error: z.object({ code: z.string(), message: z.string() }) })]);

export const ElectionSchema = z.object({ id:z.string().uuid(), name:z.string(), cycle:z.number().int(), generalDate:z.coerce.date(), status:z.string() });
export const RaceSchema = z.object({ id:z.string().uuid(), electionId:z.string().uuid(), office:z.string(), state:z.string().length(2), district:z.string().nullable(), seatClass:z.string().nullable(), specialFlag:z.boolean() });
export const CandidateSchema = z.object({ id:z.string().uuid(), legalName:z.string(), displayName:z.string(), partyText:z.string().nullable(), fecCandidateId:z.string().nullable(), incumbentFlag:z.boolean() });
export const RaceCandidateSchema = z.object({ raceId:z.string().uuid(), candidateId:z.string().uuid(), ballotStatus:z.enum(["QUALIFIED","PENDING","WRITE_IN","WITHDRAWN","DISQUALIFIED","NOT_QUALIFIED"]), ballotOrder:z.number().int().nullable(), withdrawnAt:z.coerce.date().nullable(), disqualifiedAt:z.coerce.date().nullable(), fecFilingStatus:z.string().nullable() });
export const CandidateAccountSchema = z.object({ id:z.string().uuid(), candidateId:z.string().uuid(), platform:z.string(), accountId:z.string(), canonicalUrl:z.string().url(), verificationMethod:z.string(), status:z.string() });
export const IssueSchema = z.object({ id:z.string().uuid(), slug:z.string(), neutralTitle:z.string(), publicCategory:z.string(), versions:z.array(z.object({ id:z.string().uuid(), version:z.number().int(), cycle:z.number().int(), canonicalQuestion:z.string(), goal:z.string(), planJson:z.unknown(), effectiveAt:z.coerce.date(), status:z.string() })) });
