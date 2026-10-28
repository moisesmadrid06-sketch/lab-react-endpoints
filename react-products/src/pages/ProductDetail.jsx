import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProductById } from "../services/productService";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProduct() {
      try {
        const data = await getProductById(id);

        if (!ignore) setProduct(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <p>Cargando producto...</p>;
  }

  if (error) {
    return (
      <section>
        <Link to="/products">← Regresar</Link>
        <p className="error">{error}</p>
      </section>
    );
  }

  return (
    <section className="product-detail">
      <Link to="/products">← Regresar</Link>

      <h1>{product.title}</h1>

      <img src={product.thumbnail} alt={product.title} />

      <p>{product.description}</p>

      <p>
        <strong>Categoría:</strong> {product.category}
      </p>

      <p>
        <strong>Precio:</strong> ${product.price}
      </p>

      <p>
        <strong>Stock:</strong> {product.stock}
      </p>

      <p>
        <strong>Rating:</strong> {product.rating}
      </p>
    </section>
  );
}

export default ProductDetail;
