import { useState, useEffect, useCallback } from "react";

export default function Employees({ API, tenant, refreshEmployees }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", position: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchEmployees = useCallback(async () => {
    if (!tenant?.id || !token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/employee/${tenant.id}`, {
        headers: { "x-auth-token": token },
      });

      if (res.status === 401) {
        window.location.reload();
        return;
      }

      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [API, tenant?.id, token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAdd = async () => {
    if (!form.name) return alert("Employee name is required");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ ...form, tenant_id: tenant.id }),
      });

      if (res.status === 401) return window.location.reload();

      if (res.ok) {
        setForm({ name: "", position: "" });
        await fetchEmployees();
        if (refreshEmployees) refreshEmployees();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/employee/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.status === 401) return window.location.reload();
      if (res.ok) {
        await fetchEmployees();
        if (refreshEmployees) refreshEmployees();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    /* Alignment fix: margin: "20px auto" and padding added */
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "0 10px" }}>
      {/* REGISTRATION FORM */}
      <div style={styles.formCard}>
        <h3 style={{ marginTop: 0 }}>Register New Staff</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="Full Name"
            value={form.name}
            disabled={isSubmitting}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ ...styles.input, flex: "2" }}
          />
          <input
            placeholder="Position"
            value={form.position}
            disabled={isSubmitting}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            style={{ ...styles.input, flex: "1" }}
          />
          <button
            onClick={handleAdd}
            disabled={isSubmitting}
            style={{
              ...styles.addBtn,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isSubmitting && <div style={styles.miniSpinner}></div>}
              {isSubmitting ? "Saving..." : "Add Staff"}
            </div>
          </button>
        </div>
      </div>

      {/* EMPLOYEES TABLE */}
      <div
        style={{ position: "relative", minHeight: "200px", marginTop: "25px" }}
      >
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Position</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ opacity: isLoading ? 0.5 : 1 }}>
            {isLoading ? (
              <tr>
                <td
                  colSpan="3"
                  style={{ padding: "50px", textAlign: "center" }}
                >
                  <div style={styles.centerSpinner}></div>
                  <p
                    style={{
                      color: "#007bff",
                      marginTop: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Loading staff...
                  </p>
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} style={styles.tr}>
                  <td style={styles.tdName}>{emp.name}</td>
                  <td style={styles.td}>{emp.position || "Staff"}</td>
                  <td style={styles.tdCenter}>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      disabled={deletingId === emp.id}
                      style={{
                        ...styles.delBtn,
                        opacity: deletingId === emp.id ? 0.5 : 1,
                      }}
                    >
                      {deletingId === emp.id ? "..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={styles.emptyTd}>
                  No employees registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  formCard: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" },
  addBtn: {
    padding: "8px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #eee",
  },
  theadRow: { backgroundColor: "#343a40", color: "white" },
  tr: { borderBottom: "1px solid #eee" },
  tdName: { padding: "12px", textAlign: "left", fontWeight: "500" },
  td: { padding: "12px", textAlign: "left", color: "#444" },
  tdCenter: { padding: "12px", textAlign: "center" },
  delBtn: {
    color: "#dc3545",
    border: "1px solid #dc3545",
    background: "none",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  emptyTd: { padding: "30px", textAlign: "center", color: "#999" },
  centerSpinner: {
    width: "40px",
    height: "40px",
    margin: "0 auto",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  miniSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #ffffff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
