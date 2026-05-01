import { useState, useEffect } from "react";
export default function Dashboard({ onLogout }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    employee_id: "1",
    date: today,
    shift: "S1",
    type: "DC",
  });

  const [data, setData] = useState([]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fetchData = async () => {
    const res = await fetch("http://192.168.1.76:3000/assignments");
    const result = await res.json();
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://192.168.1.76:3000/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const text = await res.text();
    await fetchData(); // refresh table
    alert(text);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial",
      }}
    >
      <h2 style={{ textAlign: "center" }}>🌊 DiveShift</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        <div>
          <label>Employee</label>
          <select
            style={{ width: "100%", padding: 8 }}
            onChange={(e) => handleChange("employee_id", e.target.value)}
          >
            <option value="1">Mel</option>
            <option value="2">Adi</option>
          </select>
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            style={{ width: "100%", padding: 8 }}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </div>

        <div>
          <label>Shift</label>
          <select
            style={{ width: "100%", padding: 8 }}
            onChange={(e) => handleChange("shift", e.target.value)}
          >
            <option value="S1">Shift 1</option>
            <option value="S2">Shift 2</option>
          </select>
        </div>

        <div>
          <label>Type</label>
          <select
            style={{ width: "100%", padding: 8 }}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <option value="DC">DC</option>
            <option value="SNK">SNK</option>
            <option value="OFF">OFF</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: 10,
            backgroundColor: "#0077b6",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
          }}
        >
          Save
        </button>
      </form>

      {/* 👇 TABLE ADDED HERE */}
      <h3 style={{ marginTop: 20 }}>Entries</h3>

      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Shift</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.employee}</td>
              <td>{row.work_date}</td>
              <td>{row.shift}</td>
              <td>{row.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onLogout} style={{ marginBottom: 10 }}>
        Logout
      </button>
    </div>
  );
}
