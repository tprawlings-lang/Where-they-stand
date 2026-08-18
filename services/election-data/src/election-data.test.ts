import { readFileSync } from "node:fs";
import { describe,expect,it,vi } from "vitest";
import { FixtureFecAdapter, resolveCandidateIdentity, ElectionDataService, type CandidateImport } from "./index";
const fixture=JSON.parse(readFileSync(new URL("../fixtures/fec-candidates.json",import.meta.url),"utf8")) as unknown[];
const base={id:"one",legalName:"Alex Rivera",displayName:"Alex Rivera",partyText:"Democratic Party",fecCandidateId:"H0CO01001",incumbentFlag:false,office:"HOUSE",state:"CO",cycle:2026,identifiers:{FEC:"H0CO01001"}} as const;
describe("candidate identity",()=>{
 it("never merges by name alone",()=>expect(resolveCandidateIdentity({legalName:"Alex Rivera",displayName:"Alex Rivera",office:"HOUSE",state:"CO",cycle:2026},[base])).toMatchObject({kind:"NEW"}));
 it("requires matching scope and corroboration",()=>{
  expect(resolveCandidateIdentity({legalName:"Alex Rivera",displayName:"Alex Rivera",office:"HOUSE",state:"CO",cycle:2026,identifiers:{FEC:"H0CO01001"}},[base])).toMatchObject({kind:"MATCH",candidateId:"one"});
  expect(resolveCandidateIdentity({legalName:"Alex Rivera",displayName:"Alex Rivera",office:"SENATE",state:"CO",cycle:2026,identifiers:{FEC:"H0CO01001"}},[base])).toMatchObject({kind:"NEW"});
 });
});
describe("fixture FEC adapter",()=>{
 it("normalizes official candidate fields without implying ballot qualification",()=>{
  const records=fixture.map(raw=>new FixtureFecAdapter().normalize(raw,{raceId:"race",cycle:2026}));
  expect(records).toHaveLength(3); expect(records[0]).toMatchObject({displayName:"ALEX RIVERA",office:"HOUSE",ballotStatus:"PENDING",sourceAuthority:"FEC"});
 });
 it("does not use party in identity inputs",()=>{ const a=new FixtureFecAdapter().normalize(fixture[0],{raceId:"race",cycle:2026}); const b={...a,partyText:"Other"}; expect(resolveCandidateIdentity(b,[{...base,legalName:a.legalName,displayName:a.displayName}])).toEqual(resolveCandidateIdentity(a,[{...base,legalName:a.legalName,displayName:a.displayName}])); });
});
it("deduplicates imports and tracks ballot status independently while preserving records",async()=>{
 const input=new FixtureFecAdapter().normalize(fixture[0],{raceId:"race",cycle:2026});
 const candidate={...base,legalName:input.legalName,displayName:input.displayName};
 const repo={getElection:vi.fn(),listRaces:vi.fn(),getRace:vi.fn(),getCandidate:vi.fn(),identityCandidates:vi.fn().mockResolvedValue([candidate]),createCandidate:vi.fn(),attachExternalIds:vi.fn(),upsertRaceCandidate:vi.fn().mockResolvedValue({ballotStatus:"PENDING",fecFilingStatus:"C"}),setBallotStatus:vi.fn().mockResolvedValue({ballotStatus:"WITHDRAWN",withdrawnAt:new Date(),fecFilingStatus:"C"})};
 const service=new ElectionDataService(repo as never); const result=await service.importCandidate(input); expect(result.created).toBe(false); expect(repo.createCandidate).not.toHaveBeenCalled();
 const withdrawn=await service.setBallotStatus("race","one","WITHDRAWN"); expect(withdrawn).toMatchObject({ballotStatus:"WITHDRAWN",fecFilingStatus:"C"});
});
