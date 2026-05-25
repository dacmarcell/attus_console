import { useState } from 'react'
import { 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  PackageOpen, 
  Pencil, 
  Trash2, 
  Plus, 
  Check 
} from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  createdAt: string
  updatedAt: string
}

interface ProductsViewProps {
  products: Product[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onSaveProduct: (
    payload: { name: string; description: string; price: number },
    id?: number
  ) => Promise<boolean>
  onDeleteProduct: (id: number) => Promise<void>
}

export default function ProductsView({
  products,
  loading,
  error,
  onRefresh,
  onSaveProduct,
  onDeleteProduct
}: ProductsViewProps) {
  // Local state for search
  const [productSearchQuery, setProductSearchQuery] = useState('')

  // Local form states (isolated from the main App orchestrator)
  const [prodName, setProdName] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  
  // Track if we are currently editing a product locally
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prodName.trim()) {
      alert('O nome do produto é obrigatório.')
      return
    }

    const parsedPrice = parseFloat(prodPrice)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Insira um preço válido maior que zero.')
      return
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parsedPrice
    }

    const success = await onSaveProduct(payload, editingProduct?.id)

    if (success) {
      // Reset form states
      setProdName('')
      setProdDesc('')
      setProdPrice('')
      setEditingProduct(null)
    }
  }

  // Populate form to start editing
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product)
    setProdName(product.name)
    setProdDesc(product.description || '')
    setProdPrice(product.price.toString())
  }

  // Cancel editing flow
  const handleCancelEdit = () => {
    setEditingProduct(null)
    setProdName('')
    setProdDesc('')
    setProdPrice('')
  }

  // Filter products by search query
  const filteredProducts = products.filter((prod) => 
    prod.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    (prod.description && prod.description.toLowerCase().includes(productSearchQuery.toLowerCase()))
  )

  return (
    <div className="products-layout">
      
      {/* Left Column: Product Listing Grid */}
      <section>
        
        {/* Filters and search for products */}
        <div className="filters-bar">
          <div className="search-input-wrapper" style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Buscar produtos cadastrados pelo nome..." 
              style={{ paddingLeft: '35px' }}
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: 'auto' }}
            onClick={onRefresh}
          >
            <RefreshCw size={12} /> Sincronizar
          </button>
        </div>

        {/* API Error Status for Products */}
        {error && (
          <div className="panel" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', marginBottom: '20px' }}>
            <AlertTriangle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
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
                ? 'Nenhum resultado corresponde à sua busca.' 
                : 'Cadastre o seu primeiro produto utilizando o formulário lateral!'}
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-details">
                  <div className="product-name">{product.name}</div>
                  <div className="product-desc">{product.description || 'Sem descrição.'}</div>
                  <div className="product-price-tag">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="product-card-footer">
                  <span className="product-meta">ID: {product.id}</span>
                  <div className="btn-action-group">
                    <button 
                      className="btn-action btn-action-edit"
                      onClick={() => handleStartEdit(product)}
                    >
                      <Pencil size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Editar
                    </button>
                    <button 
                      className="btn-action btn-action-delete"
                      onClick={() => onDeleteProduct(product.id)}
                    >
                      <Trash2 size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Deletar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </section>

      {/* Right Column: Manage Product Form */}
      <section>
        <div className="panel">
          <h2 className="panel-title">
            {editingProduct 
              ? <Pencil size={20} style={{ color: 'var(--accent-color)' }} /> 
              : <Plus size={20} style={{ color: 'var(--accent-color)' }} />
            } 
            {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
          </h2>
          <p className="panel-subtitle">
            {editingProduct 
              ? `Atualizando informações do produto ID ${editingProduct.id}.` 
              : 'Adicione novos produtos à base de dados executando o formulário completo.'}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingProduct ? <Check size={16} /> : <Plus size={16} />}
                {editingProduct ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
              
              {editingProduct && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

    </div>
  )
}
