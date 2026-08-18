import { describe, expect, it } from "vitest";
import { CandidateStanceSchema } from "./index.js";
describe("stance contract", () => { it("rejects invented recommendation labels", () => { expect(CandidateStanceSchema.safeParse("BEST_CANDIDATE").success).toBe(false); }); });
