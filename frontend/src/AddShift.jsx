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
        body: JSON.stringify({ ...form, tenant_id: tenant.id }),
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

  const getBadgeClass = (activity) => {
    switch (activity) {
      case "SICK":
        return "bg-red-50 text-red-600 border-red-100";
      case "OFF":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "PH":
        return "bg-cyan-50 text-cyan-600 border-cyan-100";
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* --- FORM SECTION --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Add New Shift</h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          {/* Staff Member */}
          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
              Staff Member
            </label>
            <select
              value={form.employee_id}
              disabled={isSubmitting}
              onChange={(e) => handleChange("employee_id", e.target.value)}
              className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-0 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
            >
              <option value="">Select staff</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              disabled={isSubmitting}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-0 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Shift */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
              Shift
            </label>
            <select
              value={form.shift}
              disabled={isSubmitting}
              onChange={(e) => handleChange("shift", e.target.value)}
              className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-0 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
            >
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="Full Day">Full Day</option>
            </select>
          </div>

          {/* Activity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
              Activity
            </label>
            <select
              value={form.activity}
              disabled={isSubmitting}
              onChange={(e) => handleChange("activity", e.target.value)}
              className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-0 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
            >
              <option value="DC">DC</option>
              <option value="SNK">SNK</option>
              <option value="OFF">OFF</option>
              <option value="SICK">SICK</option>
              <option value="PH">PH</option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-[42px] rounded-xl font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
            }`}
          >
            {isSubmitting ? "..." : "Save Shift"}
          </button>
        </form>
      </div>

      {/* --- TABLE SECTION --- */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h4 className="text-lg font-bold text-slate-800">Recent Entries</h4>
          <span className="text-xs text-slate-400 font-medium italic">
            Latest first
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Staff Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Shift
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {new Date(log.work_date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {log.employee_name || "Staff"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {log.shift}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border inline-block ${getBadgeClass(log.activity)}`}
                        >
                          {log.activity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30"
                        >
                          {deletingId === log.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-400 italic"
                    >
                      No shifts logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
