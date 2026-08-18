import { z } from "zod";

export const CandidateStanceSchema = z.enum(["SUPPORTS", "OPPOSES", "DIFFERENT_APPROACH", "NO_PUBLIC_POSITION", "DECLINED_TO_STATE"]);
export type CandidateStance = z.infer<typeof CandidateStanceSchema>;
export const CandidateIdSchema = z.string().uuid().brand<"CandidateId">();
export const RaceIdSchema = z.string().uuid().brand<"RaceId">();
export const IssueVersionIdSchema = z.string().uuid().brand<"IssueVersionId">();
export const EvidenceReferenceSchema = z.object({ id: z.string().uuid(), url: z.string().url(), sourceType: z.string(), publishedAt: z.string().datetime().nullable() });
export const StanceResultSchema = z.object({ candidateId: CandidateIdSchema, issueVersionId: IssueVersionIdSchema, label: CandidateStanceSchema, lastVerifiedAt: z.string().datetime(), evidence: z.array(EvidenceReferenceSchema) });
export const ApiResultSchema = <T extends z.ZodType>(data: T) => z.discriminatedUnion("ok", [z.object({ ok: z.literal(true), data }), z.object({ ok: z.literal(false), error: z.object({ code: z.string(), message: z.string() }) })]);
