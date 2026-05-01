import { useState, useEffect } from "react";

export default function Employees({ API, tenant, refreshEmployees }) {
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const fetchEmployees = async () => {
    if (!tenant) return;

    // Updated URL to use tenant.id
    const res = await fetch(`${API}/employee/${tenant.id}`);
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    if (tenant?.id) {
      fetchEmployees();
    }
  }, [tenant?.id, API]);

  const handleAdd = async () => {
    if (!form.name) return alert("Employee name is required");

    const res = await fetch(`${API}/employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        tenant_id: tenant.id, // Changed user_id to tenant_id
      }),
    });

    if (res.ok) {
      setForm({ name: "", phone: "", address: "" });
      fetchEmployees();

      // Update the global employee list in Dashboard
      // so the Add Shift dropdown stays in sync
      if (refreshEmployees) refreshEmployees();
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure? This will not delete their previous logs.")
    )
      return;

    const res = await fetch(`${API}/employee/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchEmployees();
      if (refreshEmployees) refreshEmployees();
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #ddd",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Register New Employee</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />

          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />

          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: 1,
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

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#343a40",
              color: "white",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "12px" }}>Name</th>
            <th style={{ padding: "12px" }}>Phone</th>
            <th style={{ padding: "12px" }}>Address</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {employees.length > 0 ? (
            employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px", fontWeight: "500" }}>
                  {emp.name}
                </td>
                <td style={{ padding: "12px", color: "#666" }}>
                  {emp.phone || "-"}
                </td>
                <td style={{ padding: "12px", color: "#666" }}>
                  {emp.address || "-"}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    style={{
                      color: "#dc3545",
                      border: "1px solid #dc3545",
                      background: "none",
                      padding: "4px 8px",
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
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                No employees registered for this tenant.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
