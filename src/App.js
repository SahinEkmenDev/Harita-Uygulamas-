// src/App.js
import React, { useState } from "react";
import Home from "./components/home";
import MapComponent from "./components/mapcomponent";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleStart = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      <MapComponent />
    </div>
  );
};

export default App;
