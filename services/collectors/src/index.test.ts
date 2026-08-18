import {describe,expect,it} from "vitest"; import {PlaceholderCollector} from "./index.js";
describe("collector contract",()=>{it("provides isolated provider health",async()=>{expect(await new PlaceholderCollector("fec").health_check()).toEqual({ok:true,detail:"adapter scaffold only"});});});
