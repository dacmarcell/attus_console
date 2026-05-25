import {
  AlertTriangle,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ToastData } from "./Toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductsViewProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSaveProduct: (
    payload: { name: string; description: string; price: number },
    id?: number,
  ) => Promise<boolean>;
  onDeleteProduct: (id: number) => void;
  addToast: (type: ToastData["type"], message: string) => void;
}

export default function ProductsView({
  products,
  loading,
  error,
  onRefresh,
  onSaveProduct,
  onDeleteProduct,
  addToast,
}: ProductsViewProps) {
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const resetForm = () => {
    setProdName("");
    setProdDesc("");
    setProdPrice("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prodName.trim()) {
      addToast("warning", "O nome do produto é obrigatório.");
      return;
    }

    const parsedPrice = parseFloat(prodPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      addToast("warning", "Insira um preço válido maior que zero.");
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parsedPrice,
    };

    const success = await onSaveProduct(payload);

    if (success) {
      closeFormModal();
    }
  };

  const filteredProducts = products.filter(
    (prod) =>
      prod.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (prod.description &&
        prod.description
          .toLowerCase()
          .includes(productSearchQuery.toLowerCase())),
  );

  return (
    <div className="products-single-layout">
      {/* Filters, search and action button */}
      <div className="filters-bar">
        <div className="search-input-wrapper" style={{ position: "relative" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar produtos cadastrados pelo nome..."
            style={{ paddingLeft: "35px" }}
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
          />
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "12px",
              color: "var(--text-secondary)",
            }}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: "auto" }}
          onClick={onRefresh}
        >
          <RefreshCw size={12} /> Sincronizar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "auto", whiteSpace: "nowrap" }}
          onClick={openCreateModal}
        >
          <Plus size={16} /> Cadastrar Produto
        </button>
      </div>

      {/* API Error Status for Products */}
      {error && (
        <div
          className="panel"
          style={{
            borderColor: "var(--color-danger)",
            color: "var(--color-danger)",
            marginBottom: "20px",
          }}
        >
          <AlertTriangle
            size={18}
            style={{ marginRight: "8px", verticalAlign: "middle" }}
          />
          <strong>Erro de Rede:</strong> {error}
        </div>
      )}

      {/* Loading and display grid */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Carregando base de produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <PackageOpen size={48} className="empty-state-icon" />
          <h3>Nenhum produto cadastrado</h3>
          <p>
            {productSearchQuery
              ? "Nenhum resultado corresponde à sua busca."
              : "Cadastre o seu primeiro produto clicando no botão acima!"}
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-details">
                <div className="product-name">{product.name}</div>
                <div className="product-desc">
                  {product.description || "Sem descrição."}
                </div>
                <div className="product-price-tag">
                  R${" "}
                  {product.price.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="product-card-footer">
                <div className="btn-action-group">
                  <button
                    className="btn-action btn-action-delete"
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    <Trash2
                      size={12}
                      style={{
                        display: "inline",
                        marginRight: "4px",
                        verticalAlign: "middle",
                      }}
                    />{" "}
                    Deletar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div
            className="modal-content modal-form"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-form-header">
              <h3 className="modal-title" style={{ marginBottom: 0 }}>
                <span className="modal-form-icon">
                  <Plus size={20} style={{ color: "var(--accent-color)" }} />
                </span>
                Cadastrar Produto
              </h3>
              <button className="modal-close-btn" onClick={closeFormModal}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-message" style={{ textAlign: "left" }}>
              Preencha os campos abaixo para adicionar um novo produto à base de
              dados.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome do Produto</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Teclado Mecânico RGB"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="Ex: 299.90"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  placeholder="Ex: Teclado ABNT2 com switch Red mecânico"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />
              </div>

              <div className="modal-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeFormModal}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Plus size={16} /> Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
