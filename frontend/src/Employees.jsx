import { useState, useEffect, useCallback } from "react";

export default function Employees({ API, tenant, refreshEmployees }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", position: "" });

  // Get the token from local storage
  const token = localStorage.getItem("token");

  // 1. Fetch Employees (Wrapped in useCallback for stability)
  const fetchEmployees = useCallback(async () => {
    if (!tenant?.id || !token) return;
    try {
      const res = await fetch(`${API}/employee/${tenant.id}`, {
        headers: { "x-auth-token": token }, // Token Support
      });

      if (res.status === 401) {
        window.location.reload(); // Refresh triggers App.js session check
        return;
      }

      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  }, [API, tenant?.id, token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // 2. Add Employee
  const handleAdd = async () => {
    if (!form.name) return alert("Employee name is required");
    if (!token) return alert("Session expired. Please log in.");

    try {
      const res = await fetch(`${API}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token, // Token Support
        },
        body: JSON.stringify({
          ...form,
          tenant_id: tenant.id,
        }),
      });

      if (res.status === 401) return window.location.reload();

      if (res.ok) {
        setForm({ name: "", position: "" });
        fetchEmployees();
        if (refreshEmployees) refreshEmployees();
      } else {
        const error = await res.json();
        alert(error.msg || "Error adding employee");
      }
    } catch (err) {
      console.error("Add Error:", err);
    }
  };

  // 3. Delete Employee
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure? This will not delete their previous logs.")
    )
      return;

    try {
      const res = await fetch(`${API}/employee/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token }, // Token Support
      });

      if (res.status === 401) return window.location.reload();

      if (res.ok) {
        fetchEmployees();
        if (refreshEmployees) refreshEmployees();
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString.replace(" ", "T"));
    return isNaN(date.getTime())
      ? dateString.split(" ")[0]
      : date.toLocaleDateString("en-GB");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={styles.formCard}>
        <h3 style={{ marginTop: 0 }}>Register New Staff</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ ...styles.input, flex: "2" }}
          />
          <input
            placeholder="Position (e.g. Instructor)"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            style={{ ...styles.input, flex: "1" }}
          />
          <button onClick={handleAdd} style={styles.addBtn}>
            Add Staff
          </button>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.theadRow}>
            <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Position</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Joined</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp) => (
              <tr key={emp.id} style={styles.tr}>
                <td style={styles.tdName}>{emp.name}</td>
                <td style={styles.td}>{emp.position || "Staff"}</td>
                <td style={styles.tdDate}>{formatDate(emp.created_at)}</td>
                <td style={styles.tdCenter}>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    style={styles.delBtn}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={styles.emptyTd}>
                No employees registered.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Clean internal styles
const styles = {
  formCard: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" },
  addBtn: {
    padding: "8px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
  },
  theadRow: { backgroundColor: "#343a40", color: "white" },
  tr: { borderBottom: "1px solid #eee" },
  tdName: { padding: "12px", textAlign: "left", fontWeight: "500" },
  td: { padding: "12px", textAlign: "left", color: "#444" },
  tdDate: {
    padding: "12px",
    textAlign: "left",
    color: "#666",
    fontSize: "14px",
  },
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
};
