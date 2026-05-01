import { useState, useEffect } from "react";

export default function Dashboard() {
  const API = "http://localhost:3000";

  const user = JSON.parse(localStorage.getItem("user"));

  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    shift: "S1",
    activity: "DC",
  });

  // 🔹 Fetch employees
  const fetchEmployees = async () => {
    const res = await fetch(`${API}/employees/${user.id}`);
    const data = await res.json();
    console.log("EMPLOYEES:", data);
    setEmployees(data);
  };

  useEffect(() => {
    if (!user) {
      alert("Please login again");
      window.location.reload();
      return;
    }

    fetchEmployees();
  }, []);

  // 🔹 Handle form change
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 Save log
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login again");
      return;
    }

    if (!form.employee_id) {
      alert("Please select employee");
      return;
    }

    const res = await fetch(`${API}/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employee_id: form.employee_id,
        date: form.date,
        shift: form.shift,
        activity: form.activity,
        user_id: user.id,
      }),
    });

    if (res.ok) {
      alert("Saved!");

      // reset form
      setForm({
        employee_id: "",
        date: new Date().toISOString().split("T")[0],
        shift: "S1",
        activity: "DC",
      });
    } else {
      alert("Error saving");
    }
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          borderBottom: "1px solid #ccc",
          paddingBottom: 10,
        }}
      >
        <h2>DiveShift</h2>

        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* ADD SHIFT */}
      <h3>Add Shift</h3>

      <form onSubmit={handleSubmit}>
        {/* Employee dropdown */}
        <select
          value={form.employee_id}
          onChange={(e) => handleChange("employee_id", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option value="">Select Employee</option>

          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        {/* Shift */}
        <select
          value={form.shift}
          onChange={(e) => handleChange("shift", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option value="S1">Shift 1</option>
          <option value="S2">Shift 2</option>
        </select>

        {/* Activity */}
        <select
          value={form.activity}
          onChange={(e) => handleChange("activity", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option value="DC">DC</option>
          <option value="SNK">SNK</option>
          <option value="OFF">OFF</option>
          <option value="SICK">SICK</option>
        </select>

        <button type="submit" style={{ width: "100%" }}>
          Save
        </button>
      </form>
    </div>
  );
}
