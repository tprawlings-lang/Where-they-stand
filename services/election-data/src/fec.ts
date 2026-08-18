import { z } from "zod";
import { deterministicImportKey, type CandidateImport, type Office } from "./types";
const FecCandidateSchema=z.object({candidate_id:z.string().min(1),name:z.string().min(1),office:z.enum(["H","S","P"]),state:z.string().length(2),district:z.string().nullable().optional(),party_full:z.string().nullable().optional(),candidate_status:z.string().nullable().optional(),incumbent_challenge:z.string().nullable().optional(),election_years:z.array(z.number().int()),principal_committees:z.array(z.string()).optional()}).strict();
export type FecCandidate=z.infer<typeof FecCandidateSchema>;
const offices:Record<FecCandidate["office"],Office>={H:"HOUSE",S:"SENATE",P:"PRESIDENT"};
export class FixtureFecAdapter {
 normalize(raw:unknown,context:{raceId:string;cycle:number;specialElection?:boolean;observedAt?:Date}):CandidateImport {
  const record=FecCandidateSchema.parse(raw); if(!record.election_years.includes(context.cycle)) throw new Error("FEC record does not include requested election cycle");
  const parts=record.name.split(",").map(v=>v.trim()); const displayName=parts.length>1?`${parts.slice(1).join(" ")} ${parts[0]}`:record.name; const observedAt=context.observedAt??new Date();
  const sourceRecordId=`${record.candidate_id}:${context.cycle}`;
  return {raceId:context.raceId,legalName:displayName,displayName,office:offices[record.office],state:record.state,cycle:context.cycle,specialElection:context.specialElection??false,partyText:record.party_full??null,incumbentFlag:record.incumbent_challenge==="I",identifiers:[{authority:"FEC",identifierType:"CANDIDATE_ID",externalId:record.candidate_id,sourceAuthority:"FEC",sourceRecordId,electionCycle:context.cycle,verificationMethod:"OFFICIAL_RECORD",verificationStatus:"VERIFIED",confidence:1,observedAt}],ballotStatus:"PENDING",filingStatus:record.candidate_status??null,sourceAuthority:"FEC",sourceRecordId,observedAt,effectiveAt:observedAt,importKey:deterministicImportKey(context.raceId,"FEC",sourceRecordId),fecCandidateId:record.candidate_id};
 }
}
