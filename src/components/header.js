// src/components/Header.js
import React from "react";
import "../header.css";

const Header = () => {
  return (
    <header>
      <div className="container">
        <div className="logo-container">
          <img src="icons/BasarSoftLogo.png" alt="Logo" className="logo" />
          <h1>Harita Uygulaması</h1>
        </div>
        <nav className="navbar">
          <button id="addPointBtn" className="btn">
            Add Point
          </button>
          <button id="queryBtn" className="btn">
            Query
          </button>
          <button id="geometryBtn" className="btn">
            Geometry
          </button>
          <button id="resetViewBtn" className="btn">
            <i className="fas fa-home"></i>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
