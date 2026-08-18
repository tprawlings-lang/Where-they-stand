import type { PrismaClient } from "@where-they-stand/db";
import type { ElectionDataRepository } from "./repository.js";
import type { BallotStatus, CandidateImport } from "./types.js";

export class PrismaElectionDataRepository implements ElectionDataRepository {
  constructor(private readonly db: PrismaClient) {}
  getElection(id:string){ return this.db.election.findUnique({where:{id}}); }
  listRaces(electionId:string){ return this.db.race.findMany({where:{electionId},orderBy:[{state:"asc"},{office:"asc"},{district:"asc"}]}) as never; }
  getRace(id:string){ return this.db.race.findUnique({where:{id},include:{candidates:{include:{candidate:true},orderBy:[{ballotOrder:"asc"},{candidate:{displayName:"asc"}}]}}}) as never; }
  getCandidate(id:string){ return this.db.candidate.findUnique({where:{id},include:{races:true,accounts:true}}) as never; }
  async identityCandidates(input:CandidateImport) {
    const rows=await this.db.candidate.findMany({where:{races:{some:{race:{office:input.office,state:input.state,election:{cycle:input.cycle}}}}},include:{externalIds:true,races:{include:{race:{include:{election:true}}}}}});
    return rows.map((c: { externalIds: Array<{authority:string;externalId:string}> } & Record<string,unknown>)=>({...c,office:input.office,state:input.state,cycle:input.cycle,identifiers:Object.fromEntries(c.externalIds.map((x:{authority:string;externalId:string})=>[x.authority,x.externalId]))})) as never;
  }
  createCandidate(input:CandidateImport){ return this.db.candidate.create({data:{legalName:input.legalName,displayName:input.displayName,partyText:input.partyText,fecCandidateId:input.identifiers?.FEC,incumbentFlag:input.incumbentFlag??false}}); }
  async attachExternalIds(candidateId:string,ids:Readonly<Record<string,string>>) { for(const [authority,externalId] of Object.entries(ids)) await this.db.candidateExternalId.upsert({where:{authority_externalId:{authority,externalId}},create:{candidateId,authority,externalId},update:{}}); }
  upsertRaceCandidate(input:CandidateImport,candidateId:string){ return this.db.raceCandidate.upsert({where:{sourceAuthority_sourceRecordId:{sourceAuthority:input.sourceAuthority,sourceRecordId:input.sourceRecordId}},create:{raceId:input.raceId,candidateId,ballotStatus:input.ballotStatus,ballotOrder:input.ballotOrder,fecFilingStatus:input.fecFilingStatus,sourceAuthority:input.sourceAuthority,sourceRecordId:input.sourceRecordId},update:{fecFilingStatus:input.fecFilingStatus}}) as never; }
  setBallotStatus(raceId:string,candidateId:string,status:BallotStatus,at:Date){ return this.db.raceCandidate.update({where:{raceId_candidateId:{raceId,candidateId}},data:{ballotStatus:status,withdrawnAt:status==="WITHDRAWN"?at:undefined,disqualifiedAt:status==="DISQUALIFIED"?at:undefined}}) as never; }
}
