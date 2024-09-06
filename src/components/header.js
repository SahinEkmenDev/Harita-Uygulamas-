import React, { useContext } from "react";
import "../header.css";
import { AppContext } from "../context/appcontext";

const Header = () => {
  const { logout, user } = useContext(AppContext); // Context API'den user ve logout fonksiyonunu alıyoruz

  return (
    <header>
      <div className="container">
        <div className="logo-container">
          <img src="icons/BasarSoftLogo.png" alt="Logo" className="logo" />
          <h1>Harita Uygulaması</h1>
        </div>
        <nav className="navbar">
          {user ? (
            // Kullanıcı giriş yapmışsa Logout butonu ve kullanıcı adını göster
            <>
              <span>Merhaba, {user.name}</span>
              <button onClick={logout} className="btn">
                Logout
              </button>
            </>
          ) : (
            // Kullanıcı giriş yapmamışsa diğer butonları göster
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
