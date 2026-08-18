export const BALLOT_STATUSES = ["PENDING", "QUALIFIED", "WRITE_IN", "WITHDRAWN", "DISQUALIFIED", "NOT_QUALIFIED", "REPLACED"] as const;
export type BallotStatus = typeof BALLOT_STATUSES[number];
export type BallotStatusTransition =
  | { status: "REPLACED"; replacementCandidateId: string }
  | { status: Exclude<BallotStatus, "REPLACED"> };
export type Office = "HOUSE" | "SENATE" | "PRESIDENT" | "OTHER";
export type VerificationStatus = "UNVERIFIED" | "VERIFIED" | "DISPUTED" | "REJECTED";
export interface ElectionRecord { id:string; name:string; cycle:number; generalDate:Date; status:string; sourceAuthority:string; sourceRecordId:string; importKey:string }
export interface RaceRecord { id:string; electionId:string; office:Office; state:string; district:string|null; seatClass:string|null; specialFlag:boolean; sourceAuthority:string; sourceRecordId:string; importKey:string }
export interface CandidateRecord { id:string; legalName:string; displayName:string }
export interface ExternalIdentifierInput { authority:string; identifierType:string; externalId:string; sourceAuthority:string; sourceRecordId:string; electionCycle?:number; validFrom?:Date; validUntil?:Date; verificationMethod:string; verificationStatus:VerificationStatus; confidence:number; observedAt:Date }
export interface RaceCandidateRecord { raceId:string; candidateId:string; ballotStatus:BallotStatus; ballotOrder:number|null; partyText:string|null; incumbentFlag:boolean; fecCandidateId:string|null; filingStatus:string|null; withdrawnAt:Date|null; disqualifiedAt:Date|null; replacedAt:Date|null; replacementCandidateId:string|null; writeIn:boolean; sourceAuthority:string; sourceRecordId:string; importKey:string; observedAt:Date; effectiveAt:Date }
export interface CandidateAccountRecord { id:string; candidateId:string; platform:string; accountId:string; canonicalUrl:string; verificationMethod:string; status:VerificationStatus; sourceAuthority:string; sourceRecordId:string; validFrom:Date|null; validUntil:Date|null; observedAt:Date }
export interface CandidateIdentityInput { legalName:string; displayName:string; office:Office; state:string; cycle:number; specialElection:boolean; identifiers:readonly ExternalIdentifierInput[]; website?:string; birthDate?:string }
export interface CandidateImport extends CandidateIdentityInput { raceId:string; partyText?:string|null; incumbentFlag?:boolean; ballotStatus:BallotStatus; ballotOrder?:number|null; filingStatus?:string|null; replacementCandidateId?:string|null; sourceAuthority:string; sourceRecordId:string; observedAt:Date; effectiveAt:Date; importKey:string; fecCandidateId?:string|null }
export const deterministicImportKey = (...parts:readonly (string|number|boolean|null|undefined)[]) => parts.map(value=>String(value??"∅").normalize("NFKC").trim().toLocaleLowerCase("en-US")).join("|");
export const externalIdentifierKey = (identifier: ExternalIdentifierInput) => deterministicImportKey(identifier.authority,identifier.identifierType,identifier.externalId,["BIOGUIDE_ID","STATE_PERSON_ID"].includes(identifier.identifierType)?"stable":identifier.electionCycle,identifier.validFrom?.toISOString(),identifier.validUntil?.toISOString());
