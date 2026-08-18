import {orderRaceCandidates} from "./order";
import type { PrismaClient } from "@where-they-stand/db";
import type { ElectionDataRepository,IdentifierAttachment } from "./repository";
import {externalIdentifierKey,type BallotStatusTransition,type CandidateImport,type ExternalIdentifierInput} from "./types";
export class PrismaElectionDataRepository implements ElectionDataRepository {
 constructor(private readonly db:PrismaClient){}
 getElection(id:string){return this.db.election.findUnique({where:{id}}) as never}
 listRaces(electionId:string,options={limit:50,offset:0}){return this.db.race.findMany({where:{electionId},take:options.limit,skip:options.offset,orderBy:[{state:"asc"},{office:"asc"},{district:"asc"}]}) as never}
 async getRace(id:string){const result=await this.db.race.findUnique({where:{id},include:{candidates:{include:{candidate:true},orderBy:[{ballotOrder:"asc"},{candidate:{displayName:"asc"}}]}}});if(!result)return null;return {...result,candidates:orderRaceCandidates(result.candidates.map(({updatedAt:_,...entry})=>entry) as never)} as never}
 async getCandidate(id:string){const result=await this.db.candidate.findUnique({where:{id},include:{races:true,accounts:true}});if(!result)return null;return {...result,races:result.races.map(({updatedAt:_,...entry})=>entry)} as never}
 async identityCandidates(input:CandidateImport){
  // Load every owner of the raw identifier. The resolver applies the explicit
  // stable-person versus candidacy scope policy after seeing all owners.
  const identifiers=input.identifiers.map(({authority,identifierType,externalId})=>({authority,identifierType,externalId}));
  const rows=await this.db.candidate.findMany({where:{OR:[{races:{some:{race:{office:input.office,state:input.state,election:{cycle:input.cycle},specialFlag:input.specialElection}}}},{externalIds:{some:{OR:identifiers}}}]},include:{externalIds:true,races:{include:{race:{include:{election:true}}}}}});
  return rows.map(candidate=>({...candidate,identifiers:candidate.externalIds,candidacies:candidate.races.map(({race})=>({office:race.office,state:race.state,cycle:race.election.cycle,specialElection:race.specialFlag}))})) as never;
 }
 createCandidate(input:CandidateImport){return this.db.candidate.create({data:{legalName:input.legalName,displayName:input.displayName}})}
 async deleteUnassociatedCandidate(candidateId:string){await this.db.candidate.deleteMany({where:{id:candidateId,races:{none:{}},externalIds:{none:{}}}})}
 async attachExternalIds(candidateId:string,ids:readonly ExternalIdentifierInput[]):Promise<IdentifierAttachment>{
  return this.db.$transaction(async tx=>{
   const conflicts=[] as ExternalIdentifierInput[]; const owners=new Set<string>();
   for(const id of ids){const existing=await tx.candidateExternalId.findUnique({where:{identityKey:externalIdentifierKey(id)}});if(existing&&existing.candidateId!==candidateId){conflicts.push(id);owners.add(existing.candidateId)}}
   if(conflicts.length)return {kind:"CONFLICT",candidateIds:[...owners],identifiers:conflicts};
   for(const id of ids){
    const identityKey=externalIdentifierKey(id);
    await tx.candidateExternalId.upsert({
     where:{identityKey},
     create:{
      id:crypto.randomUUID(),candidateId,identityKey,authority:id.authority,identifierType:id.identifierType,
      externalId:id.externalId,sourceAuthority:id.sourceAuthority,sourceRecordId:id.sourceRecordId,
      electionCycle:id.electionCycle??null,validFrom:id.validFrom??null,validUntil:id.validUntil??null,
      verificationMethod:id.verificationMethod,verificationStatus:id.verificationStatus,confidence:id.confidence,
      firstObservedAt:id.observedAt,lastObservedAt:id.observedAt
     },
     update:{lastObservedAt:id.observedAt,verificationStatus:id.verificationStatus,confidence:id.confidence}
    });
   }
   return {kind:"ATTACHED"};
  },{isolationLevel:"Serializable"});
 }
 upsertRaceCandidate(input:CandidateImport,candidateId:string){return this.db.$transaction(async tx=>{
  const key={raceId:input.raceId,sourceAuthority:input.sourceAuthority,sourceRecordId:input.sourceRecordId}; const existing=await tx.raceCandidate.findUnique({where:{raceId_sourceAuthority_sourceRecordId:key}});
  if(existing&&existing.candidateId!==candidateId)throw new Error("BALLOT_SOURCE_IDENTITY_CONFLICT");
  const statusTimes={withdrawnAt:input.ballotStatus==="WITHDRAWN"?input.effectiveAt:null,disqualifiedAt:input.ballotStatus==="DISQUALIFIED"?input.effectiveAt:null,replacedAt:input.ballotStatus==="REPLACED"?input.effectiveAt:null};
  return tx.raceCandidate.upsert({where:{raceId_sourceAuthority_sourceRecordId:key},create:{raceId:input.raceId,candidateId,ballotStatus:input.ballotStatus,ballotOrder:input.ballotOrder,partyText:input.partyText,incumbentFlag:input.incumbentFlag??false,fecCandidateId:input.fecCandidateId,filingStatus:input.filingStatus,sourceAuthority:input.sourceAuthority,sourceRecordId:input.sourceRecordId,importKey:input.importKey,observedAt:input.observedAt,effectiveAt:input.effectiveAt,writeIn:input.ballotStatus==="WRITE_IN",replacementCandidateId:input.replacementCandidateId,...statusTimes},update:{ballotOrder:input.ballotOrder,partyText:input.partyText,incumbentFlag:input.incumbentFlag??false,filingStatus:input.filingStatus,observedAt:input.observedAt}})
 },{isolationLevel:"Serializable"}) as never}
 setBallotStatus(raceId:string,candidateId:string,transition:BallotStatusTransition,at:Date){const status=transition.status;return this.db.raceCandidate.update({where:{raceId_candidateId:{raceId,candidateId}},data:{ballotStatus:status,withdrawnAt:status==="WITHDRAWN"?at:null,disqualifiedAt:status==="DISQUALIFIED"?at:null,replacedAt:status==="REPLACED"?at:null,replacementCandidateId:status==="REPLACED"?transition.replacementCandidateId:null,writeIn:status==="WRITE_IN"}}) as never}
}
