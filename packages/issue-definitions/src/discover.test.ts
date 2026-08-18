import approved from "../approved-hashes.json" with {type:"json"};
import {describe,expect,it} from "vitest";
import {discoverIssueDefinitions} from "./discover.js";
describe("issue discovery and approved contents",()=>{
 it("discovers exactly every versioned definition",async()=>{const issues=await discoverIssueDefinitions();expect(issues).toHaveLength(15);expect(Object.fromEntries(issues.map(i=>[i.filename,i.hash]))).toEqual(approved)});
 it("validates file identity and complete schema",async()=>{for(const {definition,filename} of await discoverIssueDefinitions()){expect(filename).toBe(`${definition.id}.v${definition.version}.json`);expect(definition.electionCycle).toBe(2026);expect(definition.status).toBe("active")}});
});
