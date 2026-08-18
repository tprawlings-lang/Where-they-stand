export const BALLOT_STATUSES = ["QUALIFIED", "PENDING", "WRITE_IN", "WITHDRAWN", "DISQUALIFIED", "NOT_QUALIFIED"] as const;
export type BallotStatus = typeof BALLOT_STATUSES[number];
export type Office = "HOUSE" | "SENATE" | "PRESIDENT" | "OTHER";
export interface ElectionRecord { id: string; name: string; cycle: number; generalDate: Date; status: string }
export interface RaceRecord { id: string; electionId: string; office: Office; state: string; district: string | null; seatClass: string | null; specialFlag: boolean }
export interface CandidateRecord { id: string; legalName: string; displayName: string; partyText: string | null; fecCandidateId: string | null; incumbentFlag: boolean }
export interface RaceCandidateRecord { raceId: string; candidateId: string; ballotStatus: BallotStatus; ballotOrder: number | null; withdrawnAt: Date | null; disqualifiedAt: Date | null; fecFilingStatus: string | null; sourceAuthority: string; sourceRecordId: string }
export interface CandidateAccountRecord { id: string; candidateId: string; platform: string; accountId: string; canonicalUrl: string; verificationMethod: string; status: string }
export interface CandidateIdentityInput { legalName: string; displayName: string; office: Office; state: string; cycle: number; partyText?: string | null; incumbentFlag?: boolean; identifiers?: Readonly<Record<string,string>>; website?: string; birthDate?: string }
export interface CandidateImport extends CandidateIdentityInput { raceId: string; ballotStatus: BallotStatus; ballotOrder?: number | null; fecFilingStatus?: string | null; sourceAuthority: string; sourceRecordId: string }
