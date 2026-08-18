import type { IdentityCandidate } from "./identity";
import type { BallotStatus,CandidateAccountRecord,CandidateImport,CandidateRecord,ElectionRecord,ExternalIdentifierInput,RaceCandidateRecord,RaceRecord } from "./types";
export type IdentifierAttachment={kind:"ATTACHED"}|{kind:"CONFLICT";candidateIds:string[];identifiers:ExternalIdentifierInput[]};
export interface ElectionDataRepository {
 getElection(id:string):Promise<ElectionRecord|null>; listRaces(electionId:string,options?:{limit:number;offset:number}):Promise<RaceRecord[]>;
 getRace(id:string):Promise<(RaceRecord&{candidates:(RaceCandidateRecord&{candidate:CandidateRecord})[]})|null>;
 getCandidate(id:string):Promise<(CandidateRecord&{races:RaceCandidateRecord[];accounts:CandidateAccountRecord[]})|null>;
 identityCandidates(input:CandidateImport):Promise<IdentityCandidate[]>; createCandidate(input:CandidateImport):Promise<CandidateRecord>;
 deleteUnassociatedCandidate(candidateId:string):Promise<void>;
 attachExternalIds(candidateId:string,ids:readonly ExternalIdentifierInput[]):Promise<IdentifierAttachment>;
 upsertRaceCandidate(input:CandidateImport,candidateId:string):Promise<RaceCandidateRecord>;
 setBallotStatus(raceId:string,candidateId:string,status:BallotStatus,at:Date):Promise<RaceCandidateRecord>;
}
