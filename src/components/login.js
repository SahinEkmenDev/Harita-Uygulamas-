import React, { useState } from "react";

function Login({ onLogin, onToggleRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage("Kullanıcı adı ve şifre gereklidir");
      return;
    }

    try {
      const response = await fetch("https://localhost:7072/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Hata detayları:", errorData);
        setErrorMessage(errorData.message || "Giriş işlemi başarısız oldu.");
      } else {
        const data = await response.json();
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("username", username);
        onLogin();
      }
    } catch (error) {
      console.error("Giriş isteği başarısız: ", error);
      setErrorMessage(
        "Sunucuya ulaşılamadı, lütfen daha sonra tekrar deneyin."
      );
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    // "Şifremi Unuttum" linkine tıklandığında yönlendirme
    window.location.href = "/forgot-password";
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Giriş Yap</h1>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="toggle-password" onClick={toggleShowPassword}>
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>

        <button type="submit">Giriş Yap</button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <p>
          <a
            href="#"
            onClick={handleForgotPassword} // Tıklandığında yönlendirme yapılacak
            className="forgot-password-link"
          >
            Şifremi Unuttum
          </a>
        </p>
      </form>
      <p>
        Hesabınız yok mu?{" "}
        <a href="#" onClick={onToggleRegister} className="styled-link">
          Kayıt Ol
        </a>
      </p>

      <style jsx>{`
        .form-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 60vh;
          background-color: #f7f7f7;
          border-radius: 15px;
          padding: 20px;
        }

        form {
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .password-input-wrapper {
          position: relative;
          width: 300px;
          margin-bottom: 15px;
        }

        .password-input-wrapper input {
          width: 100%;
          padding-right: 40px;
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 18px;
          color: #333;
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

        .forgot-password-link {
          color: #ff4b2b;
          cursor: pointer;
        }

        p {
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}

export default Login;
