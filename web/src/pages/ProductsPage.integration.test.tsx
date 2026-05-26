import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../constants/api";
import { jsonResponse, sampleProduct } from "../test/fixtures";
import {
  getProductModalForm,
  openCreateProductModal,
} from "../test/product-form";
import { renderWithProviders } from "../test/test-utils";
import ProductsPage from "./ProductsPage";

describe("ProductsPage (integração)", () => {
  it("carrega e exibe produtos da API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse([sampleProduct])),
    );

    renderWithProviders(<ProductsPage />, { route: "/produtos" });

    await waitFor(() => {
      expect(screen.getByText("Teclado Mecânico")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/produtos`);
  });

  it("cadastra produto e exibe modal de sucesso", async () => {
    const user = userEvent.setup();
    const newProduct = { ...sampleProduct, id: 2, name: "Mouse Gamer" };

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse([sampleProduct]))
        .mockResolvedValueOnce(jsonResponse(newProduct, true, 201))
        .mockResolvedValueOnce(jsonResponse([sampleProduct, newProduct])),
    );

    renderWithProviders(<ProductsPage />, { route: "/produtos" });

    await waitFor(() => {
      expect(screen.getByText("Teclado Mecânico")).toBeInTheDocument();
    });

    await openCreateProductModal(user);
    await user.type(
      screen.getByPlaceholderText("Ex: Teclado Mecânico RGB"),
      "Mouse Gamer",
    );
    await user.type(screen.getByPlaceholderText("Ex: 299.90"), "149.90");
    fireEvent.submit(getProductModalForm());

    await waitFor(() => {
      expect(screen.getByText("Produto Cadastrado")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/produtos`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("exibe modal de erro quando API falha no carregamento", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(null, false, 500)),
    );

    renderWithProviders(<ProductsPage />, { route: "/produtos" });

    await waitFor(() => {
      expect(
        screen.getByText(/Falha ao carregar produtos/i),
      ).toBeInTheDocument();
    });
  });
});
