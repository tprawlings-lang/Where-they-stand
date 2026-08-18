import type { CandidateImport } from "./types";
export interface StateElectionSource {
  readonly authority: string;
  discover(electionId:string): Promise<readonly string[]>;
  fetch(sourceRecordId:string): Promise<unknown>;
  normalize(record:unknown,raceId:string,cycle:number): CandidateImport;
  healthCheck(): Promise<{ ok:boolean; message?:string }>;
}
