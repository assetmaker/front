import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ padding: '1rem 2rem', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#333', fontSize: '1.5rem', fontWeight: 'bold' }}>
        Asset Maker
      </Link>
      <nav>
        <Link to="/model" style={{ margin: '0 1rem', textDecoration: 'none', color: '#555' }}>
          모델 생성
        </Link>
        <Link to="/script" style={{ margin: '0 1rem', textDecoration: 'none', color: '#555' }}>
          스크립트 생성
        </Link>
      </nav>
    </header>
  );
};

export default Header;
