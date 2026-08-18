import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { issueDefinitions, type IssueDefinition } from "@where-they-stand/issue-definitions";

export const definitionHash = (definition: IssueDefinition): string =>
  createHash("sha256").update(JSON.stringify(definition)).digest("hex");

// A changed active definition is rejected rather than updated. Release a new version instead.
export async function seedIssues(prisma: PrismaClient, definitions = issueDefinitions): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const definition of definitions) {
      const issue = await tx.issue.upsert({
        where: { slug: definition.id },
        create: { slug: definition.id, neutralTitle: definition.title, publicCategory: definition.category },
        update: {},
      });
      const existing = await tx.issueVersion.findUnique({
        where: { issueId_version: { issueId: issue.id, version: definition.version } },
      });
      const hash = definitionHash(definition);
      if (existing) {
        if (existing.definitionHash !== hash || existing.canonicalQuestion !== definition.question) {
          throw new Error(`Refusing to overwrite active issue wording: ${definition.id} v${definition.version}`);
        }
        continue;
      }
      await tx.issueVersion.create({ data: {
        issueId: issue.id, cycle: definition.electionCycle, version: definition.version,
        canonicalQuestion: definition.question, goal: definition.goal,
        planJson: { billName: definition.billName }, effectiveAt: new Date(`${definition.electionCycle}-01-01T00:00:00.000Z`),
        status: definition.status, definitionHash: hash,
      }});
    }
  });
}

