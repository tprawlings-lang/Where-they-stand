import type { CandidateIdentityInput, CandidateRecord, ExternalIdentifierInput } from "./types";
export interface CandidateScope {office:string;state:string;cycle:number;specialElection:boolean}
export interface IdentityCandidate extends CandidateRecord { candidacies:readonly CandidateScope[]; identifiers:readonly ExternalIdentifierInput[]; website?:string; birthDate?:string }
export type IdentityResolution =
 | {kind:"MATCH";candidateId:string;reasons:string[]}
 | {kind:"NEW";reasons:string[]}
 | {kind:"AMBIGUOUS";candidateIds:string[];reasons:string[]}
 | {kind:"CONFLICT";candidateIds:string[];identifiers:ExternalIdentifierInput[];reasons:string[]};
const normalize=(value:string)=>value.trim().toLocaleLowerCase("en-US").normalize("NFKD").replace(/\p{Diacritic}/gu,"").replace(/[.,]/g,"").replace(/\s+/g," ");
/** Identifier types not listed here are candidacy-scoped by default.  These are
 * the only identifiers whose issuing authorities define them as person-stable,
 * so they may bridge office, state, cycle, and regular/special candidacies. */
export const STABLE_PERSON_IDENTIFIER_TYPES = new Set(["BIOGUIDE_ID","STATE_PERSON_ID"]);
export const identifierTypePolicy=(identifierType:string):"STABLE_PERSON"|"CANDIDACY"=>STABLE_PERSON_IDENTIFIER_TYPES.has(identifierType)?"STABLE_PERSON":"CANDIDACY";
const sameRawIdentifier=(a:ExternalIdentifierInput,b:ExternalIdentifierInput)=>a.authority===b.authority&&a.identifierType===b.identifierType&&a.externalId===b.externalId;
const exactScope=(scope:CandidateScope,input:CandidateIdentityInput)=>scope.office===input.office&&scope.state===input.state&&scope.cycle===input.cycle&&scope.specialElection===input.specialElection;
export function resolveCandidateIdentity(input:CandidateIdentityInput,candidates:readonly IdentityCandidate[]):IdentityResolution {
 const owners=new Map<string,ExternalIdentifierInput[]>();
 for(const candidate of candidates) for(const identifier of input.identifiers) if(candidate.identifiers.some(existing=>sameRawIdentifier(existing,identifier))) owners.set(candidate.id,[...(owners.get(candidate.id)??[]),identifier]);
 const outOfScope=[...owners.keys()].filter(id=>{const candidate=candidates.find(value=>value.id===id)!;return (owners.get(id)??[]).every(identifier=>identifierTypePolicy(identifier.identifierType)==="CANDIDACY")&&!candidate.candidacies.some(scope=>exactScope(scope,input));});
 if(outOfScope.length) return {kind:"CONFLICT",candidateIds:outOfScope,identifiers:input.identifiers.filter(i=>candidates.some(c=>outOfScope.includes(c.id)&&c.identifiers.some(e=>sameRawIdentifier(e,i)))),reasons:["candidacy-scoped identifier already belongs to an incompatible office/state/cycle/special-election scope"]};
 const scoped=candidates.filter(candidate=>candidate.candidacies.some(scope=>exactScope(scope,input))||(owners.get(candidate.id)??[]).some(identifier=>identifierTypePolicy(identifier.identifierType)==="STABLE_PERSON"));
 const corroborated=scoped.filter(c=>owners.has(c.id)||Boolean(input.birthDate&&c.birthDate===input.birthDate)||Boolean(input.website&&c.website&&new URL(c.website).hostname===new URL(input.website).hostname));
 if(corroborated.length>1) return {kind:"AMBIGUOUS",candidateIds:corroborated.map(c=>c.id),reasons:["multiple corroborated identities require review"]};
 if(corroborated.length===1) return {kind:"MATCH",candidateId:corroborated[0]!.id,reasons:["compatible candidacy scope or documented stable-person identifier","corroborating identity"]};
 return {kind:"NEW",reasons:scoped.some(c=>normalize(c.legalName)===normalize(input.legalName))?["name alone is insufficient"]:["no corroborated identity"]};
}
