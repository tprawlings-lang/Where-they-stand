import { describe, expect, it, vi } from "vitest";
import { issueDefinitions } from "@where-they-stand/issue-definitions";
import { definitionHash, seedIssues } from "./seed-lib.js";

function client(existing: null | Record<string, unknown> = null) {
  const tx = { issue: { upsert: vi.fn(async ({ create }) => ({ id: `issue-${create.slug}` })) }, issueVersion: {
    findUnique: vi.fn(async () => existing), create: vi.fn(async () => ({})),
  }};
  return { tx, prisma: { $transaction: async (fn: (value: typeof tx) => unknown) => fn(tx) } };
}

describe("issue seed", () => {
  it("loads all 15 versioned definitions and is repeatable", async () => {
    const first = client(); await seedIssues(first.prisma as never);
    expect(first.tx.issueVersion.create).toHaveBeenCalledTimes(15);
    const definition = issueDefinitions[0]!;
    const second = client({ canonicalQuestion: definition.question, definitionHash: definitionHash(definition) });
    await seedIssues(second.prisma as never, [definition]);
    expect(second.tx.issueVersion.create).not.toHaveBeenCalled();
  });
  it("rejects silent active-wording replacement", async () => {
    const definition = issueDefinitions[0]!;
    const fixture = client({ canonicalQuestion: "changed", definitionHash: "old" });
    await expect(seedIssues(fixture.prisma as never, [definition])).rejects.toThrow("Refusing to overwrite");
  });
});
