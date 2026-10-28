import { useEffect, useState } from "react";

import ProductList from "../components/ProductList";

import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

const LIMIT = 12;
const EMPTY_FORM = { title: "", price: "", description: "" };

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Búsqueda: "search" es lo que se escribe, "activeSearch" lo que se consulta
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Categorías
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Formulario crear / actualizar
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  // Cargar categorías (una sola vez)
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadCategories();
  }, []);

  // Cargar productos: GET general, búsqueda o categoría, siempre paginado
  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const skip = (page - 1) * LIMIT;
        let data;

        if (activeSearch.trim() !== "") {
          data = await searchProducts(activeSearch, LIMIT, skip);
        } else if (category !== "") {
          data = await getProductsByCategory(category, LIMIT, skip);
        } else {
          data = await getProducts(LIMIT, skip);
        }

        if (!ignore) {
          setProducts(data.products);
          setTotal(data.total);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [page, activeSearch, category]);

  // ---------- Búsqueda ----------
  function handleSearch(event) {
    event.preventDefault();

    setCategory("");
    setActiveSearch(search);
    setPage(1);
  }

  // ---------- Filtro por categoría ----------
  function handleCategory(event) {
    setCategory(event.target.value);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  // ---------- Paginación ----------
  function nextPage() {
    if (page < totalPages) setPage(page + 1);
  }

  function previousPage() {
    if (page > 1) setPage(page - 1);
  }

  // ---------- Formulario ----------
  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  // ---------- Crear (POST) ----------
  async function handleCreate(event) {
    event.preventDefault();

    try {
      setError("");

      const created = await createProduct({
        ...form,
        price: Number(form.price),
      });

      // DummyJSON simula la creación: se agrega solo en pantalla
      const newProduct = { ...created, id: Date.now(), isLocal: true };

      setProducts([newProduct, ...products]);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  // ---------- Actualizar (PUT) ----------
  function handleEdit(product) {
    setEditingId(product.id);

    setForm({
      title: product.title,
      price: product.price,
      description: product.description ?? "",
    });
  }

  async function handleUpdate(event) {
    event.preventDefault();

    try {
      setError("");

      const changes = { ...form, price: Number(form.price) };
      const current = products.find((p) => p.id === editingId);

      // Un producto creado localmente no existe en el servidor
      const updated = current?.isLocal
        ? changes
        : await updateProduct(editingId, changes);

      setProducts(
        products.map((product) =>
          product.id === editingId
            ? { ...product, ...updated, id: product.id }
            : product
        )
      );

      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  // ---------- Eliminar (DELETE) ----------
  async function handleDelete(id) {
    try {
      setError("");

      const current = products.find((p) => p.id === id);

      if (!current?.isLocal) {
        await deleteProduct(id);
      }

      setProducts(products.filter((product) => product.id !== id));

      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1>Productos</h1>

      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="submit">Buscar</button>
      </form>

      {/* Filtro por categoría */}
      <select value={category} onChange={handleCategory}>
        <option value="">Todas las categorías</option>

        {categories.map((item) => {
          const value = item.slug ?? item;
          const label = item.name ?? item;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

      {/* Crear / Actualizar */}
      <h2>{editingId ? "Editar producto" : "Agregar producto"}</h2>

      <form
        onSubmit={editingId ? handleUpdate : handleCreate}
        className="product-form"
      >
        <input
          type="text"
          name="title"
          placeholder="Nombre"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Precio"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit">{editingId ? "Actualizar" : "Guardar"}</button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </form>

      {/* Estados de error y carga */}
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Paginación */}
      <div className="pagination">
        <button onClick={previousPage} disabled={page === 1 || loading}>
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button onClick={nextPage} disabled={page >= totalPages || loading}>
          Siguiente
        </button>
      </div>
    </section>
  );
}

export default Products;
