import { resolveCandidateIdentity } from "./identity";
import type { ElectionDataRepository } from "./repository";
import type { BallotStatus, CandidateImport } from "./types";
export class ElectionDataService {
  constructor(private readonly repository: ElectionDataRepository) {}
  getElection(id:string){ return this.repository.getElection(id); }
  listRaces(electionId:string){ return this.repository.listRaces(electionId); }
  getRace(id:string){ return this.repository.getRace(id); }
  getCandidate(id:string){ return this.repository.getCandidate(id); }
  async importCandidate(input:CandidateImport) {
    const candidates = await this.repository.identityCandidates(input);
    const resolution = resolveCandidateIdentity(input,candidates);
    if (resolution.kind === "AMBIGUOUS") throw new Error(`Ambiguous candidate identity: ${resolution.candidateIds.join(",")}`);
    const candidate = resolution.kind === "MATCH" ? candidates.find(c=>c.id===resolution.candidateId)! : await this.repository.createCandidate(input);
    await this.repository.attachExternalIds(candidate.id,input.identifiers ?? {});
    const raceCandidate = await this.repository.upsertRaceCandidate(input,candidate.id);
    return { candidate, raceCandidate, created:resolution.kind === "NEW" };
  }
  setBallotStatus(raceId:string,candidateId:string,status:BallotStatus,at=new Date()) { return this.repository.setBallotStatus(raceId,candidateId,status,at); }
}
