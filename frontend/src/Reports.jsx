import { useState, useEffect, useCallback } from "react";

export default function Reports({ API, tenant }) {
  const now = new Date();
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const startYear = 2024;
  const currentYear = now.getFullYear();
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i,
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchReport = useCallback(async () => {
    if (!tenant?.id || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/reports/detailed/${tenant.id}?month=${month}&year=${year}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        },
      );
      const contentType = res.headers.get("content-type");
      if (
        !res.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        setData([]);
        return;
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Report Error:", err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [API, tenant?.id, token, month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const renderValue = (val) => {
    const num = parseFloat(val);
    return num > 0 ? num.toFixed(1) : <span className="text-slate-300">-</span>;
  };

  // Calculate Monthly Totals for Summary Cards
  const totals = data.reduce(
    (acc, row) => ({
      normal: acc.normal + parseFloat(row.normal_days || 0),
      sick: acc.sick + parseFloat(row.sick_days || 0),
      ph: acc.ph + parseFloat(row.public_holidays || 0),
    }),
    { normal: 0, sick: 0, ph: 0 },
  );

  const isMonthEmpty =
    !loading &&
    (data.length === 0 ||
      data.every((row) =>
        Object.values(row)
          .slice(1)
          .every((val) => Number(val) === 0),
      ));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* HEADER & PRINT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Attendance Report
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            {tenant?.name} • {months[month - 1]} {year}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={loading || data.length === 0}
          className="print:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <span>Print Report</span>
        </button>
      </div>

      {/* FILTER BAR & SUMMARY CARDS */}
      <div className="print:hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selectors */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="flex-1 h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="flex-1 h-[42px] bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Stats */}
        {!isMonthEmpty && (
          <div className="lg:col-span-2 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl min-w-[140px] flex-1">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                Total Normal
              </p>
              <p className="text-2xl font-black text-blue-700">
                {totals.normal.toFixed(1)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl min-w-[140px] flex-1">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                Total Sick
              </p>
              <p className="text-2xl font-black text-red-700">
                {totals.sick.toFixed(1)}
              </p>
            </div>
            <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-2xl min-w-[140px] flex-1">
              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">
                Total PH
              </p>
              <p className="text-2xl font-black text-cyan-700">
                {totals.ph.toFixed(1)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {isMonthEmpty ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-slate-400 font-medium italic">
              No shift records found for this period.
            </p>
            <p className="text-xs text-slate-300 tracking-wide">
              Try selecting a different month or year.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 bg-slate-50 px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    Employee Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Normal
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Fridays
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Sick
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Off
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    PH
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="sticky left-0 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)] group-hover:bg-slate-50">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 font-medium">
                      {renderValue(row.normal_days)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-600 font-medium">
                      {renderValue(row.fridays)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-red-600 font-bold">
                      {renderValue(row.sick_days)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-400 font-medium">
                      {renderValue(row.off_days)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-blue-600 font-bold">
                      {renderValue(row.public_holidays)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="hidden print:block text-[10px] text-slate-400 text-center mt-8 italic">
        Generated by DiveShift System on {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
