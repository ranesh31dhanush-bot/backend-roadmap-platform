import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminApi } from "../../lib/api/admin";

describe("Sprint 9 Frontend Admin API Client Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getCurriculumNodes serializes phase and search query params correctly", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { nodes: [], total: 0 },
      }),
    } as any);

    await adminApi.getCurriculumNodes({
      version: "1.0.0",
      phaseNumber: 2,
      search: "Kafka",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/admin/curriculum/nodes");
    expect(calledUrl).toContain("version=1.0.0");
    expect(calledUrl).toContain("phaseNumber=2");
    expect(calledUrl).toContain("search=Kafka");
  });

  it("createDraftVersion sends sourceVersion and newDraftVersion in POST body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: { version: "1.2.0-draft", clonedNodesCount: 52, status: "draft" },
      }),
    } as any);

    const result = await adminApi.createDraftVersion("1.0.0", "1.2.0-draft");

    expect(result.version).toBe("1.2.0-draft");
    expect(result.clonedNodesCount).toBe(52);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const options = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({
      sourceVersion: "1.0.0",
      newDraftVersion: "1.2.0-draft",
    });
  });

  it("publishVersion sends version in POST body to /publish endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { version: "1.2.0-draft", publishedNodesCount: 52 },
      }),
    } as any);

    const result = await adminApi.publishVersion("1.2.0-draft");

    expect(result.version).toBe("1.2.0-draft");
    expect(result.publishedNodesCount).toBe(52);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/admin/curriculum/versions/publish");
  });

  it("createQuizQuestion validates and posts question to bank endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: {
          _id: "q-123",
          questionText: "What is B-Tree depth?",
          correctOptionIndex: 0,
        },
      }),
    } as any);

    const result = await adminApi.createQuizQuestion("bank-99", {
      questionText: "What is B-Tree depth?",
      options: ["O(log N)", "O(N)", "O(1)"],
      correctOptionIndex: 0,
      explanation: "B-Tree search depth is logarithmic.",
    });

    expect(result._id).toBe("q-123");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/admin/quizzes/banks/bank-99/questions");
  });
});
