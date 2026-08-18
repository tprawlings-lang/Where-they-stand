import type { BallotStatus, CandidateAccountRecord, CandidateImport, CandidateRecord, ElectionRecord, IdentityCandidate, RaceCandidateRecord, RaceRecord } from "./index.js";
export interface ElectionDataRepository {
  getElection(id:string): Promise<ElectionRecord|null>; listRaces(electionId:string):Promise<RaceRecord[]>; getRace(id:string):Promise<(RaceRecord & { candidates:(RaceCandidateRecord & { candidate:CandidateRecord })[] })|null>;
  getCandidate(id:string):Promise<(CandidateRecord & { races:RaceCandidateRecord[]; accounts:CandidateAccountRecord[] })|null>;
  identityCandidates(input:CandidateImport):Promise<IdentityCandidate[]>; createCandidate(input:CandidateImport):Promise<CandidateRecord>; attachExternalIds(candidateId:string, ids:Readonly<Record<string,string>>):Promise<void>;
  upsertRaceCandidate(input:CandidateImport,candidateId:string):Promise<RaceCandidateRecord>; setBallotStatus(raceId:string,candidateId:string,status:BallotStatus,at:Date):Promise<RaceCandidateRecord>;
}
