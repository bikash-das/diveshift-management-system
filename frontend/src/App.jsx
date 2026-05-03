import { useState, useEffect } from "react"; // Added useEffect
import Dashboard from "./Dashboard";
import Login from "./Login";

// 1. DEFINE YOUR API URL HERE
const API_URL = import.meta.env.VITE_API;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");

  // 2. CHECK SESSION ON REFRESH
  useEffect(() => {
    const token = localStorage.getItem("token");
    const tenant = localStorage.getItem("tenant");
    if (token && tenant) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setLoginMsg("");
    setIsLoggedIn(true);
  };

  const handleLogout = (reason = "") => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenant");
    setIsLoggedIn(false);

    if (reason === "expired") {
      setLoginMsg("Your session has expired. Please log in again.");
    }
  };

  return (
    <>
      {isLoggedIn ? (
        // Changed to allow dynamic logout reasons from child components
        <Dashboard onLogout={handleLogout} API={API_URL} />
      ) : (
        <Login onLogin={handleLogin} API={API_URL} message={loginMsg} />
      )}
    </>
  );
}

export default App;
