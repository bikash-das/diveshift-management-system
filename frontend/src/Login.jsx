import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Ensure the URL matches your backend port (3000)
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();

      // We rename the key to 'tenant' to match the database logic
      localStorage.setItem("tenant", JSON.stringify(data));

      // Trigger the login state in App.js
      onLogin();
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div
      style={{
        maxWidth: 300,
        margin: "100px auto",
        padding: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Tenant Login</h2>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: "12px", color: "#666" }}>Username</label>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            required
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: "12px", color: "#666" }}>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
