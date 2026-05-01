import { useState } from "react";

export default function AddShift({ API, user, employees, fetchLogs }) {
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
    const res = await fetch(`${API}/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        user_id: user.id,
      }),
    });
    if (res.ok) {
      alert("Saved");
      fetchLogs();
    }
  };
  return (
    <>
      <h3>Add Shift</h3>

      <form onSubmit={handleSubmit}>
        <select
          value={form.employee_id}
          onChange={(e) => handleChange("employee_id", e.target.value)}
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
        />

        <select
          value={form.shift}
          onChange={(e) => handleChange("shift", e.target.value)}
        >
          <option value="S1">Shift 1</option>

          <option value="S2">Shift 2</option>
        </select>

        <select
          value={form.activity}
          onChange={(e) => handleChange("activity", e.target.value)}
        >
          <option value="DC">DC</option>

          <option value="SNK">SNK</option>

          <option value="OFF">OFF</option>

          <option value="SICK">SICK</option>
        </select>

        <button type="submit">Save</button>
      </form>
    </>
  );
}
