import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // useHistory yerine useNavigate kullanıyoruz
import backgroundImage from "../assets/harita.jpg"; // Arka plan resmini içe aktarın

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // useHistory yerine useNavigate kullanıyoruz

  // URL'den token'ı alıyoruz
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage("Şifreler eşleşmiyor.");
      return;
    }

    console.log("Gönderilen Token:", token); // Token'i loglayın
    console.log("Yeni Şifre:", newPassword); // Şifreyi loglayın

    try {
      const response = await fetch(
        "https://localhost:7072/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token, // Token burada doğru gidiyor mu kontrol edin
            newPassword: newPassword,
          }),
        }
      );

      if (response.ok) {
        alert("Şifreniz başarıyla sıfırlandı.");
        navigate("/login"); // Başarılıysa login sayfasına yönlendir
      } else {
        const result = await response.json();
        setErrorMessage(
          result.message || "Şifre sıfırlama işlemi başarısız oldu."
        );
      }
    } catch (error) {
      setErrorMessage("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <h1 style={styles.title}>Şifre Yenileme</h1>
          <label style={styles.label}>Yeni Şifre:</label>
          <input
            style={styles.input}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Yeni Şifreyi Tekrar Girin:</label>
          <input
            style={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        <button type="submit" style={styles.button}>
          Şifreyi Sıfırla
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundImage: `url(${backgroundImage})`, // Arka plan resmi
    backgroundSize: "cover", // Resim ekranı tamamen kaplayacak
    backgroundPosition: "center", // Ortalansın
    backgroundRepeat: "no-repeat",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Şeffaf beyaz form arka planı
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  formGroup: {
    marginBottom: "1.5rem",
    width: "100%",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "1rem",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
  button: {
    padding: "0.75rem 2rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default ResetPassword;
