import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // todo simple check (for now)
    if (username === "admin" && password === "1234") {
      console.log("Login success");
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
      }}
    >
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <button style={{ width: "100%", padding: 10 }}>Login</button>
      </form>
    </div>
  );
}
