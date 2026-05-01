import { useState, useEffect } from "react";

export default function Employees({ API, tenant, refreshEmployees }) {
  const [employees, setEmployees] = useState([]);

  // Cleaned up form state (removed phone and address)
  const [form, setForm] = useState({
    name: "",
    position: "",
  });

  const fetchEmployees = async () => {
    if (!tenant?.id) return;
    try {
      const res = await fetch(`${API}/employee/${tenant.id}`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [tenant?.id, API]);

  const handleAdd = async () => {
    if (!form.name) return alert("Employee name is required");

    const res = await fetch(`${API}/employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, // Only sends name and position now
        tenant_id: tenant.id,
      }),
    });

    if (res.ok) {
      setForm({ name: "", position: "" });
      fetchEmployees();
      if (refreshEmployees) refreshEmployees();
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure? This will not delete their previous logs.")
    )
      return;
    const res = await fetch(`${API}/employee/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchEmployees();
      if (refreshEmployees) refreshEmployees();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const normalizedDate = dateString.includes(" ")
      ? dateString.replace(" ", "T")
      : dateString;
    const date = new Date(normalizedDate);
    return isNaN(date.getTime())
      ? dateString.split(" ")[0]
      : date.toLocaleDateString("en-GB");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* --- SIMPLIFIED REGISTRATION FORM --- */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Register New Staff</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: "2",
            }}
          />
          <input
            placeholder="Position (e.g. Instructor)"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: "1",
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: "8px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Add Staff
          </button>
        </div>
      </div>

      {/* --- EMPLOYEES TABLE --- */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#343a40", color: "white" }}>
            <th style={{ padding: "12px", textAlign: "left", width: "35%" }}>
              Name
            </th>
            <th style={{ padding: "12px", textAlign: "left", width: "30%" }}>
              Position
            </th>
            <th style={{ padding: "12px", textAlign: "left", width: "20%" }}>
              Joined
            </th>
            <th style={{ padding: "12px", textAlign: "center", width: "15%" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: "1px solid #eee" }}>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "500",
                  }}
                >
                  {emp.name}
                </td>
                <td
                  style={{ padding: "12px", textAlign: "left", color: "#444" }}
                >
                  {emp.position || "Staff"}
                </td>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  {formatDate(emp.created_at)}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    style={{
                      color: "#dc3545",
                      border: "1px solid #dc3545",
                      background: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{ padding: "30px", textAlign: "center", color: "#999" }}
              >
                No employees registered.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
