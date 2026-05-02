import { useState, useEffect, useCallback } from "react";
import AddShift from "./AddShift";
import Employees from "./Employees";
import Reports from "./Reports";

export default function Dashboard({ onLogout, API }) {
  // --- 1. STATE & DATA INITIALIZATION ---
  const [view, setView] = useState("shift");
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Retrieve auth data from storage
  const tenant = JSON.parse(localStorage.getItem("tenant"));
  const token = localStorage.getItem("token");

  // --- 2. SECURE FETCH WRAPPERS ---

  // Using useCallback to prevent unnecessary re-renders
  const fetchEmployees = useCallback(async () => {
    if (!tenant || !token) return;
    try {
      const res = await fetch(`${API}/employee/${tenant.id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token, // Required by your backend 'auth' middleware
        },
      });

      if (res.status === 401) return onLogout(); // Token expired, kick to login

      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Dashboard: Error fetching employees:", err);
    }
  }, [API, tenant?.id, token, onLogout]);

  const fetchLogs = useCallback(async () => {
    if (!tenant || !token) return;
    try {
      const res = await fetch(`${API}/logs/${tenant.id}`, {
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Dashboard: Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  }, [API, tenant?.id, token]);

  // --- 3. LIFECYCLE ---
  useEffect(() => {
    if (!tenant || !token) {
      onLogout(); // Guard clause: if data is missing, go to login
    } else {
      fetchEmployees();
      fetchLogs();
    }
  }, [fetchEmployees, fetchLogs, tenant, token, onLogout]);

  // --- 4. RENDER HELPERS ---
  if (!tenant) return null;

  return (
    <div style={styles.dashboardContainer}>
      {/* NAVIGATION BAR */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>
          <span style={styles.logoText}>DiveShift</span>
          <span style={styles.tenantTag}>{tenant.name}</span>
        </div>

        <div style={styles.navLinks}>
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
          <button onClick={onLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={styles.contentArea}>
        {loading ? (
          <div style={styles.loader}>Loading Dashboard...</div>
        ) : (
          <>
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
                employees={employees}
              />
            )}

            {view === "reports" && <Reports API={API} tenant={tenant} />}
          </>
        )}
      </main>
    </div>
  );
}

// --- 5. STYLING ---

const navButtonStyle = (isActive) => ({
  padding: "10px 18px",
  cursor: "pointer",
  border: "none",
  borderRadius: "6px",
  backgroundColor: isActive ? "#007bff" : "transparent",
  color: isActive ? "white" : "#555",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.2s ease",
});

const styles = {
  dashboardContainer: {
    minHeight: "100vh",
    backgroundColor: "#f4f7f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    letterSpacing: "-0.5px",
  },
  tenantTag: {
    fontSize: "12px",
    backgroundColor: "#e7f3ff",
    color: "#007bff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  navLinks: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  logoutBtn: {
    marginLeft: "10px",
    padding: "10px 18px",
    backgroundColor: "#fff",
    color: "#dc3545",
    border: "1px solid #dc3545",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  contentArea: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
  },
  loader: {
    textAlign: "center",
    marginTop: "50px",
    color: "#888",
  },
};
