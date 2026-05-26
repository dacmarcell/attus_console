import { describe, expect, it } from "vitest";
import { formatDate } from "./helpers";

describe("formatDate", () => {
  it("formata data ISO em pt-BR", () => {
    const formatted = formatDate("2026-05-25T15:30:00");

    expect(formatted).toMatch(/25\/05\/2026/);
  });

  it("não lança erro para string de data inválida", () => {
    expect(() => formatDate("data-invalida")).not.toThrow();
  });
});
