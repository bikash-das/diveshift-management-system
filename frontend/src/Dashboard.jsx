import { useState, useEffect, useCallback } from "react";
import AddShift from "./AddShift";
import Employees from "./Employees";
import Reports from "./Reports";

// --- 1. STABLE DATA RETRIEVAL (Outside component to prevent infinite loops) ---
const getStoredAuth = () => {
  try {
    const tenant = JSON.parse(localStorage.getItem("tenant"));
    const token = localStorage.getItem("token");
    return { tenant, token };
  } catch (err) {
    return { tenant: null, token: null };
  }
};

const { tenant: stableTenant, token: stableToken } = getStoredAuth();

export default function Dashboard({ onLogout, API }) {
  // --- 2. STATE INITIALIZATION ---
  const [view, setView] = useState("shift");
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 3. SECURE FETCH WRAPPERS ---

  const fetchEmployees = useCallback(async () => {
    if (!stableTenant || !stableToken) return;
    try {
      const res = await fetch(`${API}/employee/${stableTenant.id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": stableToken,
        },
      });

      if (res.status === 401) return onLogout();

      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Dashboard: Error fetching employees:", err);
    }
  }, [API, onLogout]); // stableTenant.id and stableToken are now constants

  const fetchLogs = useCallback(async () => {
    if (!stableTenant || !stableToken) return;
    try {
      const res = await fetch(`${API}/logs/${stableTenant.id}`, {
        headers: { "x-auth-token": stableToken },
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Dashboard: Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  // --- 4. LIFECYCLE (The Fix) ---
  useEffect(() => {
    if (!stableTenant || !stableToken) {
      onLogout();
    } else {
      fetchEmployees();
      fetchLogs();
    }
    // Dependency array is now stable; this will only run ONCE on mount.
  }, [fetchEmployees, fetchLogs, onLogout]);

  // --- 5. RENDER HELPERS ---
  if (!stableTenant) return null;

  return (
    <div style={styles.dashboardContainer}>
      {/* NAVIGATION BAR */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>
          <span style={styles.logoText}>DiveShift</span>
          <span style={styles.tenantTag}>{stableTenant.name}</span>
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
            Staffs
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
                tenant={stableTenant}
                employees={employees}
                fetchLogs={fetchLogs}
                logs={logs}
              />
            )}

            {view === "employees" && (
              <Employees
                API={API}
                tenant={stableTenant}
                refreshEmployees={fetchEmployees}
                employees={employees}
              />
            )}

            {view === "reports" && <Reports API={API} tenant={stableTenant} />}
          </>
        )}
      </main>
    </div>
  );
}

// --- 6. STYLING ---

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
