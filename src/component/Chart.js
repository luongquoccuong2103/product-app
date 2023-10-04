import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const ChartComponent = () => {
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/products');
        setProductData(response.data);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (productData.length === 0) return;

    // Generate random click counts for each product
    const updatedProductData = productData.map(product => ({
      ...product,
      clickCount: Math.floor(Math.random() * 100) // Replace with your desired range
    }));

    const labels = updatedProductData.map(product => product.name);
    const data = updatedProductData.map(product => product.clickCount);

    const chartNode = document.getElementById('myChart');
    const chart = new Chart(chartNode, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Số lần click',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true }
        }
      }
    });

    return () => {
      chart.destroy(); // Cleanup chart on component unmount
    };
  }, [productData]);

  return <canvas id="myChart" style={{ width: '60%', height: '300px' }} />;
};

export default ChartComponent;
