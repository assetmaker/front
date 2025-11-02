import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Asset Maker</h1>
      <p>Your one-stop solution for generating 3D models and scripts using AI.</p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/model" style={{ margin: '0 1rem', padding: '0.8rem 1.5rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Generate a 3D Model
        </Link>
        <Link to="/script" style={{ margin: '0 1rem', padding: '0.8rem 1.5rem', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Generate a Script
        </Link>
      </div>
    </div>
  );
};

export default Home;
