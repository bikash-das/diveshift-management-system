import { useState } from "react";

export default function AddShift({ API, tenant, employees, fetchLogs, logs }) {
  const [form, setForm] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    shift: "S1",
    activity: "DC",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) return alert("Please select an employee");
    if (!token) return alert("Session expired. Please log in.");

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          ...form,
          tenant_id: tenant.id,
        }),
      });

      if (res.status === 401) return window.location.reload();

      if (res.ok) {
        setForm({ ...form, employee_id: "" });
        await fetchLogs();
      } else {
        const errorText = await res.text();
        alert(errorText);
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure?")) return;
    if (!token) return;

    setDeletingId(logId);
    try {
      const res = await fetch(`${API}/log/${logId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.status === 401) return window.location.reload();
      if (res.ok) await fetchLogs();
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "0 10px" }}>
      {/* --- FORM SECTION --- */}
      <div style={styles.formCard}>
        <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Add Shift</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <select
            value={form.employee_id}
            disabled={isSubmitting}
            onChange={(e) => handleChange("employee_id", e.target.value)}
            style={{ ...styles.input, flex: "1.5" }}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            disabled={isSubmitting}
            onChange={(e) => handleChange("date", e.target.value)}
            style={{ ...styles.input, flex: "1" }}
          />

          <select
            value={form.shift}
            disabled={isSubmitting}
            onChange={(e) => handleChange("shift", e.target.value)}
            style={{ ...styles.input, flex: "0.5" }}
          >
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>

          <select
            value={form.activity}
            disabled={isSubmitting}
            onChange={(e) => handleChange("activity", e.target.value)}
            style={{ ...styles.input, flex: "0.8" }}
          >
            <option value="DC">DC</option>
            <option value="SNK">SNK</option>
            <option value="OFF">OFF</option>
            <option value="SICK">SICK</option>
            <option value="PH">PH</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.saveBtn,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isSubmitting && <div style={styles.miniSpinner}></div>}
              {isSubmitting ? "Saving..." : "Save Shift"}
            </div>
          </button>
        </form>
      </div>

      {/* --- RECENT ENTRIES SECTION --- */}
      <div style={{ marginTop: "25px" }}>
        <h4 style={{ marginBottom: "15px", color: "#333" }}>
          Recent Entries (Latest First)
        </h4>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={{ ...styles.th, width: "20%" }}>Date</th>
                <th style={{ ...styles.th, width: "30%" }}>Name</th>
                <th style={{ ...styles.th, width: "15%" }}>Shift</th>
                <th style={{ ...styles.th, width: "20%" }}>Activity</th>
                <th style={{ ...styles.thCenter, width: "15%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} style={styles.tr}>
                    <td
                      style={{ ...styles.td, ...styles.tdDate, width: "20%" }}
                    >
                      {new Date(log.work_date).toLocaleDateString("en-GB")}
                    </td>
                    <td
                      style={{ ...styles.td, ...styles.tdName, width: "30%" }}
                    >
                      {log.employee_name || "Staff"}
                    </td>
                    <td
                      style={{ ...styles.td, ...styles.tdBold, width: "15%" }}
                    >
                      {log.shift}
                    </td>
                    <td style={{ ...styles.td, width: "20%" }}>
                      <span
                        style={{
                          ...styles.badge,
                          ...getBadgeStyle(log.activity),
                        }}
                      >
                        {log.activity}
                      </span>
                    </td>
                    <td
                      style={{ ...styles.td, ...styles.tdCenter, width: "15%" }}
                    >
                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        style={{
                          ...styles.delBtn,
                          opacity: deletingId === log.id ? 0.5 : 1,
                        }}
                      >
                        {deletingId === log.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.emptyTd}>
                    No shifts logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const getBadgeStyle = (activity) => {
  switch (activity) {
    case "SICK":
      return { backgroundColor: "#ffebee", color: "#c62828" };
    case "OFF":
      return { backgroundColor: "#f5f5f5", color: "#666" };
    case "PH":
      return { backgroundColor: "#e0f7fa", color: "#006064" };
    default:
      return { backgroundColor: "#e3f2fd", color: "#0d47a1" };
  }
};

const styles = {
  formCard: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" },
  saveBtn: {
    padding: "8px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  tableContainer: {
    maxHeight: "450px",
    overflowY: "auto",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    tableLayout: "fixed", // Ensures width percentages are respected
  },
  thead: {
    position: "sticky",
    top: 0,
    backgroundColor: "#343a40",
    color: "white",
    zIndex: 1,
  },
  th: {
    padding: "12px 15px", // Increased horizontal padding
    textAlign: "left",
    fontWeight: "600",
  },
  thCenter: {
    padding: "12px 15px",
    textAlign: "center",
    fontWeight: "600",
  },
  tr: { borderBottom: "1px solid #eee" },
  td: {
    padding: "12px 15px", // Match TH padding exactly
    textAlign: "left",
    verticalAlign: "middle",
  },
  tdDate: { color: "#666" },
  tdName: { fontWeight: "500" },
  tdBold: { fontWeight: "bold", color: "#444" },
  tdCenter: { textAlign: "center" },
  badge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  delBtn: {
    color: "#dc3545",
    border: "1px solid #dc3545",
    background: "none",
    padding: "3px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
  },
  emptyTd: { padding: "40px", textAlign: "center", color: "#999" },
  miniSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #ffffff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
