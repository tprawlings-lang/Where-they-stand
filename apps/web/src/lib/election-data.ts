import { db } from "@where-they-stand/db";
import { ElectionDataService, PrismaElectionDataRepository } from "@where-they-stand/election-data";
export const electionData = new ElectionDataService(new PrismaElectionDataRepository(db));
