import React, { useState, useEffect } from "react";
import Home from "./components/home";
import MapComponent from "./components/mapcomponent";
import Login from "./components/login";
import Register from "./components/register";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Base64 ile kodlanmış JWT token'ı çözme fonksiyonu
  const parseJwt = (token) => {
    try {
      // Token'ı '.' ile böleriz ve ikinci kısmı (payload) alırız
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
      return JSON.parse(jsonPayload); // Payload'u JSON formatında döner
    } catch (error) {
      console.error("Token çözümleme hatası:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken) {
        const currentTime = Date.now() / 1000; // Şu anki zamanı saniye cinsinden alıyoruz

        // Eğer token süresi dolmuşsa logout yapıp giriş sayfasına yönlendiriyoruz
        if (decodedToken.exp < currentTime) {
          console.log("Token süresi dolmuş. Lütfen tekrar giriş yapın.");
          localStorage.removeItem("jwtToken"); // Geçersiz token'ı kaldırıyoruz
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true); // Token geçerli ise giriş yapılmış kabul ediyoruz
        }
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true); // Giriş işlemi başarılı olduğunda set edilir
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div>
      {isAuthenticated ? (
        <MapComponent />
      ) : isRegistering ? (
        <Register onRegister={toggleRegister} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      {!isAuthenticated && (
        <button onClick={toggleRegister}>
          {isRegistering ? "Giriş Yap" : "Kayıt Ol"}
        </button>
      )}
    </div>
  );
};

export default App;
