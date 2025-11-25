import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Asset Maker에 오신 것을 환영합니다</h1>
      <p>
        AI를 사용하여 3D 모델, 2D 픽셀 에셋, 스크립트를 생성하는 원스톱 솔루션입니다.
      </p>
      <div style={{ marginTop: "2rem" }}>
        <Link
          to="/model"
          style={{
            margin: "0 1rem",
            padding: "0.8rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          3D 모델 생성
        </Link>
        <Link
          to="/pixel"
          style={{
            margin: "0 1rem",
            padding: "0.8rem 1.5rem",
            backgroundColor: "#ffc107",
            color: "#333",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          픽셀 에셋 생성
        </Link>
        <Link
          to="/script"
          style={{
            margin: "0 1rem",
            padding: "0.8rem 1.5rem",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          스크립트 생성
        </Link>
      </div>
    </div>
  );
};

export default Home;
