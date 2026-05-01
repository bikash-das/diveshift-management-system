import { useState, useEffect } from "react";
import AddShift from "./AddShift";
import Employees from "./Employees";
import Reports from "./Reports";

export default function Dashboard() {
  const API = "http://localhost:3000";

  // 1. Updated to check for 'tenant' in localStorage
  const tenant = JSON.parse(localStorage.getItem("tenant"));

  const [view, setView] = useState("shift");
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);

  // 2. Fetch Employees using tenant_id logic
  const fetchEmployees = async () => {
    if (!tenant) return;
    try {
      const res = await fetch(`${API}/employee/${tenant.id}`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // 3. Fetch Logs (used by AddShift to show the recent entries)
  const fetchLogs = async () => {
    if (!tenant) return;
    try {
      const res = await fetch(`${API}/logs/${tenant.id}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  // 4. Load initial data on mount
  useEffect(() => {
    if (!tenant) return;
    fetchEmployees();
    fetchLogs();
  }, []);

  const handleLogout = () => {
    // 5. Clear the correct localStorage key
    localStorage.removeItem("tenant");
    window.location.reload();
  };

  if (!tenant) return <p>Access Denied. Please log in.</p>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          padding: "10px 20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: "#333" }}>
          DiveShift |{" "}
          <span style={{ color: "#007bff" }}>{tenant.username}</span>
        </h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setView("shift")}
            style={navButtonStyle(view === "shift")}
          >
            Add Shift
          </button>
          <button
            onClick={() => setView("employees")}
            style={navButtonStyle(view === "employees")}
          >
            Employees
          </button>
          <button
            onClick={() => setView("reports")}
            style={navButtonStyle(view === "reports")}
          >
            Reports
          </button>
          <button
            onClick={handleLogout}
            style={{
              ...navButtonStyle(false),
              backgroundColor: "#dc3545",
              color: "white",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <hr style={{ border: "0.5px solid #eee", marginBottom: "20px" }} />

      {/* CONTENT AREA */}
      <div style={{ minHeight: "60vh" }}>
        {view === "shift" && (
          <AddShift
            API={API}
            tenant={tenant}
            employees={employees}
            fetchLogs={fetchLogs}
            logs={logs}
          />
        )}

        {view === "employees" && (
          <Employees
            API={API}
            tenant={tenant}
            refreshEmployees={fetchEmployees}
          />
        )}

        {view === "reports" && <Reports API={API} tenant={tenant} />}
      </div>
    </div>
  );
}

// Simple helper for navigation button styling
const navButtonStyle = (isActive) => ({
  padding: "8px 16px",
  cursor: "pointer",
  border: "none",
  borderRadius: "4px",
  backgroundColor: isActive ? "#007bff" : "#e0e0e0",
  color: isActive ? "white" : "#333",
  fontWeight: "bold",
  transition: "0.2s",
});
