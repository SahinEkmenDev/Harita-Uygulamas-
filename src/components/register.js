import React, { useState } from "react";

function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Email state'i eklendi

  const [errorMessage, setErrorMessage] = useState(""); // Hata mesajı için state

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !email) {
      setErrorMessage("Tüm alanlar doldurulmalıdır.");
      return;
    }

    try {
      const response = await fetch("https://localhost:7072/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }), // Role alanını çıkardık
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Hata detayları:", errorData);
        setErrorMessage(errorData.message || "Kayıt işlemi başarısız oldu.");
      } else {
        onRegister();
      }
    } catch (error) {
      console.error("Kayıt isteği başarısız: ", error);
      setErrorMessage(
        "Sunucuya ulaşılamadı, lütfen daha sonra tekrar deneyin."
      );
    }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Kayıt Ol</h1>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Kayıt Ol</button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <p>
          Zaten bir hesabınız var mı?{" "}
          <a href="#" onClick={onRegister} className="styled-link">
            Giriş Yap
          </a>
        </p>
      </form>

      <style jsx>{`
        .form-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 400px;
          padding: 30px;
          background-color: #fff;
          border: 2px solid #ff4b2b;
          border-radius: 10px;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
          margin: 20px auto;
        }

        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        button {
          width: 100%;
          padding: 15px;
          background-color: #ff4b2b;
          color: white;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          margin-top: 10px;
        }

        button:hover {
          background-color: #e43e1e;
        }

        .styled-button {
          background-color: transparent;
          color: #ff4b2b;
          border: 2px solid #ff4b2b;
          padding: 10px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .styled-button:hover {
          background-color: #ff4b2b;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default Register;
