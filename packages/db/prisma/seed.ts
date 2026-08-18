import {PrismaClient} from "@prisma/client";
import {discoverIssueDefinitions} from "@where-they-stand/issue-definitions/discover";
import {seedIssues} from "./seed-lib.js";
const prisma=new PrismaClient();
const definitions=(await discoverIssueDefinitions()).map(item=>item.definition);
await seedIssues(prisma,definitions).finally(()=>prisma.$disconnect());
