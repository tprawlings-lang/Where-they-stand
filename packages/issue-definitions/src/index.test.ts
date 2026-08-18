import { describe, expect, it } from "vitest";
import { issueDefinitions } from "./index.js";
describe("canonical issues",()=>{ it("contains 15 unique, active 2026 definitions",()=>{ expect(issueDefinitions).toHaveLength(15); expect(new Set(issueDefinitions.map(i=>`${i.id}@${i.version}`)).size).toBe(15); expect(issueDefinitions.every(i=>i.status==="active"&&i.electionCycle===2026)).toBe(true); }); });
