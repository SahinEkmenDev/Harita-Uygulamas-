// src/components/Home.js
import React from "react";
import "../home.css";

const Home = ({ onStart }) => {
  return (
    <div className="home-container">
      <div className="overlay">
        <button className="start-btn" onClick={onStart}>
          Başla
        </button>
      </div>
    </div>
  );
};

export default Home;
