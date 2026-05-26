import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { sampleProduct } from "../test/fixtures";
import {
  getProductModalForm,
  openCreateProductModal,
  submitProductModalForm,
} from "../test/product-form";
import ProductsView from "./ProductsView";

function renderProductsView(
  overrides: Partial<ComponentProps<typeof ProductsView>> = {},
) {
  const onSaveProduct = vi.fn().mockResolvedValue(true);
  const onDeleteProduct = vi.fn();
  const addToast = vi.fn();

  render(
    <ProductsView
      products={[sampleProduct]}
      loading={false}
      error={null}
      onSaveProduct={onSaveProduct}
      onDeleteProduct={onDeleteProduct}
      addToast={addToast}
      {...overrides}
    />,
  );

  return { onSaveProduct, onDeleteProduct, addToast };
}

describe("ProductsView", () => {
  it("exibe produto cadastrado", () => {
    renderProductsView();

    expect(screen.getByText("Teclado Mecânico")).toBeInTheDocument();
    expect(screen.getByText(/299,90/)).toBeInTheDocument();
  });

  it("filtra produtos pela busca", async () => {
    const user = userEvent.setup();
    renderProductsView({
      products: [
        sampleProduct,
        { ...sampleProduct, id: 2, name: "Mouse Gamer", description: "Óptico" },
      ],
    });

    await user.type(
      screen.getByPlaceholderText(/Buscar produtos cadastrados/i),
      "mouse",
    );

    expect(screen.queryByText("Teclado Mecânico")).not.toBeInTheDocument();
    expect(screen.getByText("Mouse Gamer")).toBeInTheDocument();
  });

  it("valida nome vazio antes de salvar", async () => {
    const user = userEvent.setup();
    const { onSaveProduct, addToast } = renderProductsView();

    await openCreateProductModal(user);
    submitProductModalForm();

    expect(addToast).toHaveBeenCalledWith(
      "warning",
      "O nome do produto é obrigatório.",
    );
    expect(onSaveProduct).not.toHaveBeenCalled();
  });

  it("valida preço inválido", async () => {
    const user = userEvent.setup();
    const { onSaveProduct, addToast } = renderProductsView();

    await openCreateProductModal(user);
    await user.type(
      screen.getByPlaceholderText("Ex: Teclado Mecânico RGB"),
      "Produto X",
    );
    await user.type(screen.getByPlaceholderText("Ex: 299.90"), "0");
    submitProductModalForm();

    expect(addToast).toHaveBeenCalledWith(
      "warning",
      "Insira um preço válido maior que zero.",
    );
    expect(onSaveProduct).not.toHaveBeenCalled();
  });

  it("cadastra produto com payload válido", async () => {
    const user = userEvent.setup();
    const { onSaveProduct } = renderProductsView();

    await openCreateProductModal(user);
    await user.type(
      screen.getByPlaceholderText("Ex: Teclado Mecânico RGB"),
      "Headset",
    );
    await user.type(screen.getByPlaceholderText("Ex: 299.90"), "199.90");
    fireEvent.submit(getProductModalForm());

    await waitFor(() => {
      expect(onSaveProduct).toHaveBeenCalledWith(
        { name: "Headset", description: "", price: 199.9 },
        undefined,
      );
    });
  });

  it("abre modal de edição e envia id no save", async () => {
    const user = userEvent.setup();
    const { onSaveProduct } = renderProductsView();

    await user.click(screen.getByRole("button", { name: /Editar/i }));

    expect(
      screen.getByRole("heading", { name: /Editar Produto/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex: Teclado Mecânico RGB")).toHaveValue(
      "Teclado Mecânico",
    );

    await user.clear(screen.getByPlaceholderText("Ex: Teclado Mecânico RGB"));
    await user.type(
      screen.getByPlaceholderText("Ex: Teclado Mecânico RGB"),
      "Teclado Pro",
    );
    await user.click(
      screen.getByRole("button", { name: /Salvar alterações/i }),
    );

    await waitFor(() => {
      expect(onSaveProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Teclado Pro" }),
        1,
      );
    });
  });

  it("chama exclusão ao clicar em Deletar", async () => {
    const user = userEvent.setup();
    const { onDeleteProduct } = renderProductsView();

    await user.click(screen.getByRole("button", { name: /Deletar/i }));

    expect(onDeleteProduct).toHaveBeenCalledWith(1);
  });

  it("exibe estado de carregamento", () => {
    renderProductsView({ loading: true, products: [] });

    expect(
      screen.getByText(/Carregando base de produtos/i),
    ).toBeInTheDocument();
  });

  it("exibe erro de rede", () => {
    renderProductsView({ error: "Falha na API", products: [] });

    expect(screen.getByText(/Falha na API/i)).toBeInTheDocument();
  });
});
