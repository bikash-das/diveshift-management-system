import { useState, useEffect, useCallback } from "react";

export default function Employees({ API, tenant, refreshEmployees }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", position: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchEmployees = useCallback(async () => {
    if (!tenant?.id || !token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/employee/${tenant.id}`, {
        headers: { "x-auth-token": token },
      });
      if (res.status === 401) return window.location.reload();

      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [API, tenant?.id, token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAdd = async () => {
    if (!form.name) return alert("Employee name is required");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ ...form, tenant_id: tenant.id }),
      });
      if (res.status === 401) return window.location.reload();
      if (res.ok) {
        setForm({ name: "", position: "" });
        await fetchEmployees();
        if (refreshEmployees) refreshEmployees();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/employee/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.status === 401) return window.location.reload();
      if (res.ok) {
        await fetchEmployees();
        if (refreshEmployees) refreshEmployees();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* REGISTRATION FORM */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">
          Register New Staff
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <input
              placeholder="e.g. John Doe"
              value={form.name}
              disabled={isSubmitting}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-0 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
              Position
            </label>
            <input
              placeholder="e.g. Manager"
              value={form.position}
              disabled={isSubmitting}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-0 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={isSubmitting}
            className={`w-full h-[42px] rounded-xl font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center ${
              isSubmitting
                ? "bg-slate-400"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
            }`}
          >
            {isSubmitting ? "Saving..." : "Add Staff"}
          </button>
        </div>
      </div>

      {/* EMPLOYEES TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Name
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Position
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className={isLoading ? "opacity-50" : "opacity-100"}>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-medium text-slate-500 mt-4">
                    Refreshing list...
                  </p>
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {emp.position || "Staff"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(emp.id)}
                      disabled={deletingId === emp.id}
                      className="text-red-500 hover:bg-red-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30"
                    >
                      {deletingId === emp.id ? "..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="py-20 text-center text-slate-400 italic text-sm"
                >
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
