import React, { useState } from "react";
import "./login.css";

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:7072/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        onRegister(); // Başarılı kayıt sonrası giriş sayfasına yönlendir
      } else {
        setError("Kayıt işlemi başarısız. Kullanıcı adı zaten var olabilir.");
      }
    } catch (error) {
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="register-container">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Kayıt Ol</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Register;
