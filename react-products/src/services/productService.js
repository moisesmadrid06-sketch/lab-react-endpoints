const API_URL = "https://dummyjson.com/products";

// Función auxiliar: ejecuta fetch, valida la respuesta y devuelve el JSON
async function request(url, options, errorMessage) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return await response.json();
}

const JSON_HEADERS = { "Content-Type": "application/json" };

// GET /products?limit=&skip=  -> Obtener productos (con paginación)
export function getProducts(limit = 12, skip = 0) {
  return request(
    `${API_URL}?limit=${limit}&skip=${skip}`,
    undefined,
    "Error al obtener los productos"
  );
}

// GET /products/:id  -> Obtener producto por ID
export function getProductById(id) {
  return request(`${API_URL}/${id}`, undefined, "Producto no encontrado");
}

// GET /products/search?q=  -> Buscar productos
export function searchProducts(query, limit = 12, skip = 0) {
  return request(
    `${API_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`,
    undefined,
    "Error al buscar productos"
  );
}

// GET /products/categories  -> Obtener categorías
export function getCategories() {
  return request(
    `${API_URL}/categories`,
    undefined,
    "Error al obtener las categorías"
  );
}

// GET /products/category/:category  -> Productos por categoría
export function getProductsByCategory(category, limit = 12, skip = 0) {
  return request(
    `${API_URL}/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`,
    undefined,
    "Error al filtrar productos"
  );
}

// POST /products/add  -> Crear producto
export function createProduct(product) {
  return request(
    `${API_URL}/add`,
    {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(product),
    },
    "Error al crear el producto"
  );
}

// PUT /products/:id  -> Actualizar producto
export function updateProduct(id, product) {
  return request(
    `${API_URL}/${id}`,
    {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(product),
    },
    "Error al actualizar el producto"
  );
}

// DELETE /products/:id  -> Eliminar producto
export function deleteProduct(id) {
  return request(
    `${API_URL}/${id}`,
    { method: "DELETE" },
    "Error al eliminar el producto"
  );
}
