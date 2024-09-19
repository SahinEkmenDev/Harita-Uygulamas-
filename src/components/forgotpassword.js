import React, { useState } from "react";
import backgroundImage from "../assets/harita.jpg"; // Arka plan resmini içe aktarın

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://localhost:7072/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setMessage(
          "Şifre sıfırlama talebiniz alınmıştır. Admin onayı bekleniyor."
        );
      } else {
        const errorData = await response.json();
        setMessage(
          errorData.message || "Şifre sıfırlama talebi başarısız oldu."
        );
      }
    } catch (error) {
      console.error("Şifre sıfırlama talebi başarısız:", error);
      setMessage("Sunucuya ulaşılamadı, lütfen daha sonra tekrar deneyin.");
    }
  };

  const handleGoBackToLogin = () => {
    window.location.href = "/"; // Giriş ekranına geri yönlendirme
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Şifre Sıfırlama</h1>
        <input
          type="email"
          placeholder="E-posta Adresi"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gönder</button>
        <button onClick={handleGoBackToLogin} className="go-back-button">
          Giriş Yap Ekranına Geri Dön
        </button>
        {message && <p>{message}</p>}
      </form>

      <style jsx>{`
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }

        .form-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-image: url(${backgroundImage}); /* Arka plan resmi */
          background-size: cover; /* Resmin ekranı tam kaplaması */
          background-position: center; /* Ortalansın */
          background-repeat: no-repeat;
          border-radius: 15px;
          padding: 20px;
        }

        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(
            255,
            255,
            255,
            0.8
          ); /* Şeffaf beyaz form arka planı */
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
          text-align: center;
          margin-bottom: 10px;
          color: #333;
        }

        input {
          width: 300px;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-sizing: border-box;
        }

        button {
          width: 300px;
          padding: 12px;
          background-color: #ff4b2b;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 8px;
        }

        button:hover {
          background-color: #e43e1e;
        }

        .go-back-button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #4b7bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .go-back-button:hover {
          background-color: #356ae5;
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;
