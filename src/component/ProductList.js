// src/components/ProductList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './../component/Product.css'
const ProductList = () => {
    const [products, setProducts] = useState([]);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get('http://localhost:3000/products');
          setProducts(response.data);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };
  
      fetchProducts();
    }, []);
  
    return (
      <div>
        <h1>Product List</h1>
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-item">
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
 
  
  
  
  
  
  