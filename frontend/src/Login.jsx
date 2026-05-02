import { useState } from "react";

export default function Login({ onLogin, API }) {
  const [email, setEmail] = useState(""); // Swapped username for email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Check if it's actually JSON before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text(); // Get the error as text
        console.error("Server returned non-JSON:", text);
        throw new Error("Server error: Check your backend logs.");
      }

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("tenant", JSON.stringify(data.tenant));
        onLogin();
      } else {
        alert(data.msg || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 350,
        margin: "100px auto",
        padding: "30px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        DiveShift Login
      </h2>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 15 }}>
          <label
            style={{
              display: "block",
              marginBottom: 5,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 5,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            transition: "background 0.3s",
          }}
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}
