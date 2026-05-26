import type { Incident, Product } from "../types/app";

export const sampleProduct: Product = {
  id: 1,
  name: "Teclado Mecânico",
  description: "Switch Red",
  price: 299.9,
  createdAt: "2026-05-25T10:00:00",
  updatedAt: "2026-05-25T10:00:00",
};

export const sampleIncident: Incident = {
  id: "inc-1",
  type: "NETWORK_TIMEOUT",
  severity: "HIGH",
  message: "Connection timed out",
  occurrences: 5,
  recommendations: "Verifique a conexão; Tente novamente",
  preventions: "Use rede estável; Evite múltiplas requisições",
  createdAt: "2026-05-25T12:00:00",
};

export function jsonResponse<T>(data: T, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}
