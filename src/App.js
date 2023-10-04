// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './component/ProductList';
import Dashboard from './component/Dashboard';
import './component/App.css';

const App = () => {
  return (
    <Router>
      <div className="navbar">
        <ul>
          <li>
            <Link to="/">Product List</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </div>

      <div className="content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<ProductList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
