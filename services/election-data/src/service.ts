import { resolveCandidateIdentity } from "./identity";
import type { ElectionDataRepository } from "./repository";
import type { BallotStatus,CandidateImport } from "./types";
export class ElectionDataService {
 constructor(private readonly repository:ElectionDataRepository){}
 getElection(id:string){return this.repository.getElection(id)}
 listRaces(electionId:string,options={limit:50,offset:0}){return this.repository.listRaces(electionId,options)}
 getRace(id:string){return this.repository.getRace(id)}
 getCandidate(id:string){return this.repository.getCandidate(id)}
 async importCandidate(input:CandidateImport){
  if(input.ballotOrder!=null&&input.ballotOrder<0) throw new Error("ballot order must be nonnegative");
  const candidates=await this.repository.identityCandidates(input); const resolution=resolveCandidateIdentity(input,candidates);
  if(resolution.kind==="AMBIGUOUS"||resolution.kind==="CONFLICT") return {kind:resolution.kind,resolution} as const;
  const candidate=resolution.kind==="MATCH"?candidates.find(c=>c.id===resolution.candidateId)!:await this.repository.createCandidate(input);
  const attachment=await this.repository.attachExternalIds(candidate.id,input.identifiers);
  if(attachment.kind==="CONFLICT"){if(resolution.kind==="NEW")await this.repository.deleteUnassociatedCandidate(candidate.id);return {kind:"CONFLICT",resolution:attachment} as const}
  return {kind:"IMPORTED",candidate,raceCandidate:await this.repository.upsertRaceCandidate(input,candidate.id),created:resolution.kind==="NEW"} as const;
 }
 setBallotStatus(raceId:string,candidateId:string,status:BallotStatus,at=new Date()){return this.repository.setBallotStatus(raceId,candidateId,status,at)}
}
