import type { CandidateIdentityInput, CandidateRecord, ExternalIdentifierInput } from "./types";
export interface CandidateScope {office:string;state:string;cycle:number;specialElection:boolean}
export interface IdentityCandidate extends CandidateRecord { candidacies:readonly CandidateScope[]; identifiers:readonly ExternalIdentifierInput[]; website?:string; birthDate?:string }
export type IdentityResolution =
 | {kind:"MATCH";candidateId:string;reasons:string[]}
 | {kind:"NEW";reasons:string[]}
 | {kind:"AMBIGUOUS";candidateIds:string[];reasons:string[]}
 | {kind:"CONFLICT";candidateIds:string[];identifiers:ExternalIdentifierInput[];reasons:string[]};
const normalize=(value:string)=>value.trim().toLocaleLowerCase("en-US").normalize("NFKD").replace(/\p{Diacritic}/gu,"").replace(/[.,]/g,"").replace(/\s+/g," ");
const stableTypes=new Set(["CANDIDATE_ID","BIOGUIDE_ID","STATE_PERSON_ID"]);
const sameIdentifier=(a:ExternalIdentifierInput,b:ExternalIdentifierInput)=>a.authority===b.authority&&a.identifierType===b.identifierType&&a.externalId===b.externalId&&(stableTypes.has(a.identifierType)||(a.electionCycle??null)===(b.electionCycle??null));
export function resolveCandidateIdentity(input:CandidateIdentityInput,candidates:readonly IdentityCandidate[]):IdentityResolution {
 const owners=new Map<string,ExternalIdentifierInput[]>();
 for(const candidate of candidates) for(const identifier of input.identifiers) if(candidate.identifiers.some(existing=>sameIdentifier(existing,identifier))) owners.set(candidate.id,[...(owners.get(candidate.id)??[]),identifier]);
 const outOfScope=[...owners.keys()].filter(id=>{const candidate=candidates.find(value=>value.id===id)!;return !candidate.candidacies.some(scope=>scope.office===input.office&&scope.state===input.state);});
 if(outOfScope.length) return {kind:"CONFLICT",candidateIds:outOfScope,identifiers:input.identifiers.filter(i=>candidates.some(c=>outOfScope.includes(c.id)&&c.identifiers.some(e=>sameIdentifier(e,i)))),reasons:["identifier already belongs to an out-of-scope candidate"]};
 const scoped=candidates.filter(candidate=>candidate.candidacies.some(scope=>scope.office===input.office&&scope.state===input.state));
 const corroborated=scoped.filter(c=>owners.has(c.id)||Boolean(input.birthDate&&c.birthDate===input.birthDate)||Boolean(input.website&&c.website&&new URL(c.website).hostname===new URL(input.website).hostname));
 if(corroborated.length>1) return {kind:"AMBIGUOUS",candidateIds:corroborated.map(c=>c.id),reasons:["multiple corroborated identities require review"]};
 if(corroborated.length===1) return {kind:"MATCH",candidateId:corroborated[0]!.id,reasons:["office/state and incoming cycle context","corroborating identity"]};
 return {kind:"NEW",reasons:scoped.some(c=>normalize(c.legalName)===normalize(input.legalName))?["name alone is insufficient"]:["no corroborated identity"]};
}
