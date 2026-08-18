import { z } from "zod";
import type { CandidateImport, Office } from "./types.js";
const FecCandidateSchema=z.object({candidate_id:z.string().min(1),name:z.string().min(1),office:z.enum(["H","S","P"]),state:z.string().length(2),district:z.string().nullable().optional(),party_full:z.string().nullable().optional(),candidate_status:z.string().nullable().optional(),incumbent_challenge:z.string().nullable().optional(),election_years:z.array(z.number().int())});
export type FecCandidate = z.infer<typeof FecCandidateSchema>;
const office:Record<FecCandidate["office"],Office>={H:"HOUSE",S:"SENATE",P:"PRESIDENT"};
export class FixtureFecAdapter {
  normalize(raw:unknown, context:{raceId:string;cycle:number}):CandidateImport {
    const record=FecCandidateSchema.parse(raw);
    if (!record.election_years.includes(context.cycle)) throw new Error("FEC record does not include requested election cycle");
    const parts=record.name.split(",").map(v=>v.trim()); const displayName=parts.length>1?`${parts.slice(1).join(" ")} ${parts[0]}`:record.name;
    return { raceId:context.raceId, legalName:displayName, displayName, office:office[record.office], state:record.state, cycle:context.cycle, partyText:record.party_full??null, incumbentFlag:record.incumbent_challenge==="I", identifiers:{FEC:record.candidate_id}, ballotStatus:"PENDING", fecFilingStatus:record.candidate_status??null, sourceAuthority:"FEC", sourceRecordId:`${record.candidate_id}:${context.cycle}` };
  }
}
