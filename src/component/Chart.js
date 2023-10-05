import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const TimelineChart = () => {
  const [productData, setProductData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [productColors, setProductColors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8100/products');
        const initialSelectedProducts = {};
        const initialProductColors = {};
        response.data.forEach((product, index) => {
          initialSelectedProducts[product.id] = false; // Initially select all products
          // Assign a color to each product based on its index
          initialProductColors[product.id] = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
          )}, ${Math.floor(Math.random() * 256)}, 1)`;
        });
        setSelectedProducts(initialSelectedProducts);
        setProductColors(initialProductColors);
        setProductData(response.data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);

  const generateRandomData = () => {
    return productData
      .filter(product => selectedProducts[product.id]) // Filter based on selected products
      .map(product => ({
        label: product.name,
        borderColor: productColors[product.id], // Use assigned color for the product
        fill: false,
        data: Array.from({ length: 10 }, (_, index) => ({
          x: `Time ${index + 1}`,
          y: Math.floor(Math.random() * 100), // Random click count
        })),
      }));
  };

  const handleProductToggle = productId => {
    setSelectedProducts(prevSelectedProducts => ({
      ...prevSelectedProducts,
      [productId]: !prevSelectedProducts[productId],
    }));
  };

  return (
    <div>
      <div>
        {productData.map(product => (
          <label
            key={product.id}
            style={{ marginRight: '20px', color: productColors[product.id], cursor: 'pointer' }}
            onClick={() => handleProductToggle(product.id)}
          >
            <input type="checkbox" checked={selectedProducts[product.id]} readOnly />
            {product.name}
          </label>
        ))}
      </div>
      <div>
        <Line
          data={{ labels: Array.from({ length: 10 }, (_, index) => `Time ${index + 1}`), datasets: generateRandomData() }}
        />
      </div>
    </div>
  );
};

export default TimelineChart;
