import React, { createContext, useState } from "react";

// 1. Context Oluşturma
export const AppContext = createContext();

// 2. Provider Bileşeni
export const AppProvider = ({ children }) => {
  // Uygulamanın durumunu burada yönetiyoruz. Örneğin:
  const [user, setUser] = useState(null); // Kullanıcı bilgileri
  const [token, setToken] = useState(null); // Kullanıcı token'ı

  // 3. Giriş Yapma Fonksiyonu
  const login = (userInfo, userToken) => {
    setUser(userInfo);
    setToken(userToken);
  };

  // 4. Çıkış Yapma Fonksiyonu
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // 5. Sağlayıcı (Provider) ile durumu bileşenlere aktarıyoruz
  return (
    <AppContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};
