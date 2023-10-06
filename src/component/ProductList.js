// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./../component/Product.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  const registerClick = async (productId) => {
    try {
      await axios.post("/analytics/clicks", {
        productId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Click not registered:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Product List</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li
            key={product.id}
            className="product-item"
            onClick={() => registerClick(product.id)}
          >
            <h2>{product.name}</h2>
            <img src={product.imageUrl} alt={product.name} />
            <p>{product.description}</p>
            <p className="price">Price: ${product.price}</p>
            <p>In Stock: {product.countInStock}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
