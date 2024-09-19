import React, { useState, useEffect } from "react";
import Login from "./components/login";
import Register from "./components/register";
import MapComponent from "./components/mapcomponent"; // Harita bileşeni
import backgroundImage from "./assets/harita.jpg"; // Yerel arka plan resmini içe aktarıyoruz
import ForgotPassword from "./components/forgotpassword";
import ResetPassword from "./components/ResetPassword"; // Şifre Yenileme Bileşeni
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Switch yerine Routes kullanacağız

// JWT decode fonksiyonu
function jwtDecode(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Giriş kontrolü
  const [isFlipped, setIsFlipped] = useState(false); // Form geçişi için state
  const [userRole, setUserRole] = useState(null); // Kullanıcı rolü için state

  // Token süresi dolmuş mu kontrol et
  const isTokenValid = (token) => {
    if (!token) return false;
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Şu anki zaman saniye cinsinden
    setUserRole(decodedToken.role); // Kullanıcının rolünü alıyoruz
    return decodedToken.exp > currentTime; // Token süresi dolmamışsa true döner
  };

  // Sayfa yüklendiğinde token'ı kontrol et
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token && isTokenValid(token)) {
      setIsAuthenticated(true); // Token geçerliyse kullanıcıyı oturum açmış gibi göster
    } else {
      setIsAuthenticated(false); // Token geçerli değilse giriş sayfasına yönlendir
    }
  }, []);

  // Giriş işlemi başarılı olursa tetiklenir
  const handleLogin = () => {
    setIsAuthenticated(true); // Giriş işlemi başarılı olduğunda kullanıcıyı girişli hale getiriyoruz
  };

  // Formları değiştirmek için kullanılan fonksiyon
  const toggleForm = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Router>
      <Routes>
        {/* /forgot-password rotasında ForgotPassword bileşeni */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* /reset-password rotasında ResetPassword bileşeni */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Diğer rotalar */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MapComponent userRole={userRole} />
            ) : (
              <div className={`container ${isFlipped ? "flipped" : ""}`}>
                <div className="form-container">
                  <div className="form-side login-side">
                    <Login
                      onLogin={handleLogin}
                      onToggleRegister={toggleForm}
                    />
                  </div>
                  <div className="form-side register-side">
                    <Register onRegister={toggleForm} />
                  </div>
                </div>
              </div>
            )
          }
        />
      </Routes>

      {/* Stil dosyası */}
      <style jsx>{`
        body,
        html {
          height: 100%;
          margin: 0;
        }

        .container {
          perspective: 1000px;
          width: 500px; /* Formun genişliği */
          margin: 0 auto; /* Yatay ortalama */
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 8%;
          left: 50%;
          transform: translate(-50%, -50%); /* Tam ortalama */
        }

        /* Arka plan resmi assets klasöründen */
        body {
          background-image: url(${backgroundImage});
          background-size: cover; /* Resim ekranı tamamen kaplayacak */
          background-position: center; /* Ortalansın */
          background-repeat: no-repeat;
        }

        .form-container {
          width: 100%;
          height: auto;
          position: relative;
          transition: transform 0.8s ease-in-out;
          transform-style: preserve-3d;
        }

        .flipped .form-container {
          transform: rotateY(180deg);
        }

        .form-side {
          position: absolute;
          width: 100%;
          backface-visibility: hidden;
        }

        .login-side {
          transform: rotateY(0deg);
        }

        .register-side {
          transform: rotateY(180deg);
        }

        .form-container .register-side,
        .form-container .login-side {
          width: 100%;
          background-color: rgba(
            255,
            255,
            255,
            0.9
          ); /* Biraz şeffaf beyaz arka plan */
          padding: 20px; /* Daha az padding */
          border-radius: 10px;
          border: 1px solid #ff4b2b; /* Kenarlık daha ince */
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Daha küçük gölge */
        }
      `}</style>
    </Router>
  );
}

export default App;
