import type { CandidateIdentityInput, CandidateRecord } from "./types.js";
export interface IdentityCandidate extends CandidateRecord { office: string; state: string; cycle: number; identifiers: Readonly<Record<string,string>>; website?: string; birthDate?: string }
export type IdentityResolution = { kind:"MATCH"; candidateId:string; reasons:string[] } | { kind:"NEW"; reasons:string[] } | { kind:"AMBIGUOUS"; candidateIds:string[]; reasons:string[] };
const normalized = (value: string) => value.trim().toLocaleLowerCase("en-US").replace(/[.,]/g, "").replace(/\s+/g, " ");
export function resolveCandidateIdentity(input: CandidateIdentityInput, candidates: readonly IdentityCandidate[]): IdentityResolution {
  const scoped = candidates.filter(c => c.office === input.office && c.state === input.state && c.cycle === input.cycle);
  const matches = scoped.filter(candidate => {
    const identifierMatch = Object.entries(input.identifiers ?? {}).some(([key,value]) => candidate.identifiers[key] === value);
    const identityFieldMatch = Boolean(input.birthDate && candidate.birthDate === input.birthDate) || Boolean(input.website && candidate.website && new URL(candidate.website).hostname === new URL(input.website!).hostname);
    // A name may corroborate an identity field, but is never sufficient on its own.
    return (identifierMatch || identityFieldMatch) && normalized(candidate.legalName) === normalized(input.legalName);
  });
  if (matches.length === 1) return { kind:"MATCH", candidateId: matches[0]!.id, reasons:["office/state/cycle", "corroborating identity"] };
  if (matches.length > 1) return { kind:"AMBIGUOUS", candidateIds:matches.map(c=>c.id), reasons:["multiple corroborated records"] };
  return { kind:"NEW", reasons: scoped.some(c => normalized(c.legalName) === normalized(input.legalName)) ? ["name alone is insufficient"] : ["no corroborated identity"] };
}
