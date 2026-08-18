import { PrismaClient } from "@prisma/client";
import { seedIssues } from "./seed-lib.js";
const prisma = new PrismaClient();
seedIssues(prisma).finally(() => prisma.$disconnect());
