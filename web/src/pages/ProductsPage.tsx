import { useCallback, useEffect, useState } from "react";
import ProductsView from "../components/ProductsView";
import ProductsPageHeader from "../components/headers/ProductsPageHeader";
import { API_BASE_URL } from "../constants/api";
import { useAppUi } from "../context/AppUiContext";
import type { Product } from "../types/app";

export default function ProductsPage() {
  const { showModal, addToast } = useAppUi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/produtos`);
      if (!res.ok) throw new Error("Falha ao carregar produtos do servidor.");
      const data = await res.json();
      setProducts(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Erro ao obter produtos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveProduct = useCallback(
    async (
      payload: { name: string; description: string; price: number },
      id?: number,
    ): Promise<boolean> => {
      try {
        const res = await fetch(
          id
            ? `${API_BASE_URL}/produtos/${id}`
            : `${API_BASE_URL}/produtos`,
          {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.validationErrors
              ? Object.values(errorData.validationErrors).join(", ")
              : "Erro ao processar produto na API.",
          );
        }

        fetchProducts();
        showModal(
          "success",
          id ? "Produto Atualizado" : "Produto Cadastrado",
          id
            ? "As informações do produto foram atualizadas com sucesso."
            : "O produto foi cadastrado com sucesso na base de dados.",
        );
        return true;
      } catch (err: unknown) {
        showModal(
          "error",
          "Erro ao Salvar Produto",
          (err as Error).message || "Ocorreu um erro ao salvar o produto.",
        );
        return false;
      }
    },
    [fetchProducts, showModal],
  );

  const handleDeleteProduct = useCallback(
    (id: number) => {
      showModal(
        "confirm",
        "Confirmar Exclusão",
        "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.",
        async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/produtos/${id}`, {
              method: "DELETE",
            });

            if (!res.ok) throw new Error("Falha ao deletar o produto na API.");

            fetchProducts();
            setTimeout(() => {
              showModal(
                "success",
                "Produto Excluído",
                "O produto foi removido da base de dados com sucesso.",
              );
            }, 150);
          } catch (err: unknown) {
            setTimeout(() => {
              showModal(
                "error",
                "Erro ao Excluir",
                (err as Error).message || "Erro ao excluir produto.",
              );
            }, 150);
          }
        },
      );
    },
    [fetchProducts, showModal],
  );

  return (
    <>
      <ProductsPageHeader />
      <ProductsView
        products={products}
        loading={loading}
        error={error}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        addToast={addToast}
      />
    </>
  );
}
