import { useState, useEffect } from "react";
import AddShift from "./AddShift";
import Logs from "./Logs";
import Employees from "./Employees";

export default function Dashboard() {
  const API = "http://localhost:3000";
  const user = JSON.parse(localStorage.getItem("user"));

  const [view, setView] = useState("shift");
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);

  const fetchEmployees = async () => {
    if (!user) return;
    const res = await fetch(`${API}/employee/${user.id}`); // ✅ fixed
    const data = await res.json();
    setEmployees(data);
  };

  const fetchLogs = async () => {
    if (!user) return;
    const res = await fetch(`${API}/logs/${user.id}`);
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    if (!user) return;

    fetchEmployees();
    fetchLogs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>DiveShift</h2>

        <div>
          <button onClick={() => setView("shift")}>Add Shift</button>
          <button onClick={() => setView("logs")}>Logs</button>
          <button onClick={() => setView("employees")}>Employees</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <hr />

      {/* CONTENT */}
      {view === "shift" && (
        <AddShift
          API={API}
          user={user}
          employees={employees}
          fetchLogs={fetchLogs}
        />
      )}

      {view === "logs" && <Logs logs={logs} />}

      {view === "employees" && <Employees API={API} user={user} />}
    </div>
  );
}
