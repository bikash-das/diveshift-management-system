import { useState } from "react";

export default function AddShift({ API, tenant, employees, fetchLogs, logs }) {
  const [form, setForm] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    shift: "S1",
    activity: "DC",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) return alert("Please select an employee");

    const res = await fetch(`${API}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Changed user_id to tenant_id to match backend refactor
      body: JSON.stringify({
        ...form,
        tenant_id: tenant.id,
      }),
    });

    if (res.ok) {
      // Reset only employee field to allow quick multi-entry for the same day
      setForm({ ...form, employee_id: "" });
      fetchLogs();
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    const res = await fetch(`${API}/log/${logId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchLogs();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* --- FORM SECTION --- */}
      <div
        style={{
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add Shift</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <select
            value={form.employee_id}
            onChange={(e) => handleChange("employee_id", e.target.value)}
            style={{ padding: "8px", borderRadius: "4px" }}
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
            onChange={(e) => handleChange("date", e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          <select
            value={form.shift}
            onChange={(e) => handleChange("shift", e.target.value)}
            style={{ padding: "8px" }}
          >
            <option value="S1">Shift 1</option>
            <option value="S2">Shift 2</option>
          </select>

          <select
            value={form.activity}
            onChange={(e) => handleChange("activity", e.target.value)}
            style={{ padding: "8px" }}
          >
            <option value="DC">DC</option>
            <option value="SNK">SNK</option>
            <option value="OFF">OFF</option>
            <option value="SICK">SICK</option>
            <option value="PH">PH</option>
          </select>

          <button
            type="submit"
            style={{
              padding: "8px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Save Shift
          </button>
        </form>
      </div>

      {/* --- RECENT ENTRIES SECTION --- */}
      <div>
        <h4 style={{ marginBottom: "10px" }}>Recent Entries (Latest First)</h4>
        <div
          style={{
            maxHeight: "450px",
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: "8px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f8f9fa",
                zIndex: 1,
              }}
            >
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Shift</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Activity</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>
                      {/* Using locale string for consistent display */}
                      {new Date(log.work_date).toLocaleDateString("en-GB")}
                    </td>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>
                      {log.employee_name || "Staff"}
                    </td>
                    <td style={{ padding: "10px" }}>{log.shift}</td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            log.activity === "SICK"
                              ? "#ffebee"
                              : log.activity === "OFF"
                                ? "#f5f5f5"
                                : log.activity === "PH"
                                  ? "#e0f7fa"
                                  : "#e3f2fd",
                          color:
                            log.activity === "SICK"
                              ? "#c62828"
                              : log.activity === "PH"
                                ? "#006064"
                                : "#0d47a1",
                        }}
                      >
                        {log.activity}
                      </span>
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(log.id)}
                        style={{
                          color: "#dc3545",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                          textDecoration: "underline",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    No shifts logged yet for this tenant.
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
