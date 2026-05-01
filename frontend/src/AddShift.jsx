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
      body: JSON.stringify({
        ...form,
        tenant_id: tenant.id,
      }),
    });

    if (res.ok) {
      setForm({ ...form, employee_id: "" });
      fetchLogs();
    } else {
      const errorText = await res.text();
      alert(errorText);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    const res = await fetch(`${API}/log/${logId}`, { method: "DELETE" });
    if (res.ok) fetchLogs();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "25px",
        maxWidth: "900px",
      }}
    >
      {/* --- FORM SECTION --- */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Add Shift</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <select
            value={form.employee_id}
            onChange={(e) => handleChange("employee_id", e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: "1.5",
            }}
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
              flex: "1",
            }}
          />

          <select
            value={form.shift}
            onChange={(e) => handleChange("shift", e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: "0.5",
            }}
          >
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>

          <select
            value={form.activity}
            onChange={(e) => handleChange("activity", e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: "0.8",
            }}
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
        <h4 style={{ marginBottom: "15px", color: "#333" }}>
          Recent Entries (Latest First)
        </h4>
        <div
          style={{
            maxHeight: "450px",
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: "8px",
            backgroundColor: "white",
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
                backgroundColor: "#343a40",
                color: "white",
                zIndex: 1,
              }}
            >
              <tr>
                <th
                  style={{ padding: "12px", textAlign: "left", width: "20%" }}
                >
                  Date
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", width: "30%" }}
                >
                  Name
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", width: "15%" }}
                >
                  Shift
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", width: "20%" }}
                >
                  Activity
                </th>
                <th
                  style={{ padding: "12px", textAlign: "center", width: "15%" }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        color: "#666",
                      }}
                    >
                      {new Date(log.work_date).toLocaleDateString("en-GB")}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "500",
                      }}
                    >
                      {log.employee_name || "Staff"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "left" }}>
                      <span style={{ color: "#444", fontWeight: "bold" }}>
                        {log.shift}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "left" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
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
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(log.id)}
                        style={{
                          color: "#dc3545",
                          border: "1px solid #dc3545",
                          background: "none",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "11px",
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
                      padding: "40px",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    No shifts logged yet for this month.
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
