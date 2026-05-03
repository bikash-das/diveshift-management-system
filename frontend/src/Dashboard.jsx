import { useState, useEffect, useCallback, useMemo } from "react";
import AddShift from "./AddShift";
import Employees from "./Employees";
import Reports from "./Reports";

export default function Dashboard({ onLogout, API }) {
  const [view, setView] = useState("shift");
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = useMemo(() => {
    try {
      const tenant = JSON.parse(localStorage.getItem("tenant"));
      const token = localStorage.getItem("token");
      return { tenant, token };
    } catch (err) {
      return { tenant: null, token: null };
    }
  }, []);

  const { tenant, token } = auth;

  const fetchEmployees = useCallback(async () => {
    if (!tenant || !token) return;
    try {
      const res = await fetch(`${API}/employee/${tenant.id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Dashboard Error:", err);
    }
  }, [API, tenant?.id, token, onLogout]);

  const fetchLogs = useCallback(async () => {
    if (!tenant || !token) return;
    try {
      const res = await fetch(`${API}/logs/${tenant.id}`, {
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Logs Error:", err);
    } finally {
      setLoading(false);
    }
  }, [API, tenant?.id, token]);

  useEffect(() => {
    if (!tenant || !token) {
      onLogout();
    } else {
      fetchEmployees();
      fetchLogs();
    }
  }, [fetchEmployees, fetchLogs, onLogout, tenant, token]);

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3 gap-4">
            {/* Brand Section */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                DiveShift
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase border border-blue-100">
                {tenant.name}
              </span>
            </div>

            {/* Navigation Links - Scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setView("shift")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  view === "shift"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Add Shift
              </button>
              <button
                onClick={() => setView("employees")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  view === "employees"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Staffs
              </button>
              <button
                onClick={() => setView("reports")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  view === "reports"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Reports
              </button>

              <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">
              Loading Dashboard...
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {view === "shift" && (
              <AddShift
                API={API}
                tenant={tenant}
                employees={employees}
                fetchLogs={fetchLogs}
                logs={logs}
              />
            )}
            {view === "employees" && (
              <Employees
                API={API}
                tenant={tenant}
                refreshEmployees={fetchEmployees}
                employees={employees}
              />
            )}
            {view === "reports" && <Reports API={API} tenant={tenant} />}
          </div>
        )}
      </main>
    </div>
  );
}
