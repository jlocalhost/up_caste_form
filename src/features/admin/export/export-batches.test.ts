import { describe, expect, it } from "vitest";
import { planExportBatches, type ExportAssembly } from "./export-batches";

const assembly = (id: string, submissions: number): ExportAssembly => ({ id, name: id, district: "d", submissions });
const ids = (batches: ExportAssembly[][]) => batches.map((b) => b.map((a) => a.id));

describe("planExportBatches", () => {
  it("packs consecutive assemblies up to the page size, keeping order", () => {
    const batches = planExportBatches([assembly("a", 400), assembly("b", 500), assembly("c", 200), assembly("d", 50)], 1000);
    expect(ids(batches)).toEqual([["a", "b"], ["c", "d"]]);
  });

  it("gives an oversized assembly its own batch", () => {
    const batches = planExportBatches([assembly("a", 10), assembly("big", 1500), assembly("c", 10)], 1000);
    expect(ids(batches)).toEqual([["a"], ["big"], ["c"]]);
  });

  it("returns no batches when nothing was submitted", () => {
    expect(planExportBatches([])).toEqual([]);
  });
});
