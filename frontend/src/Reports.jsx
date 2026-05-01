import { useState, useEffect } from "react";

export default function Reports({ API, tenant }) {
  // 1. Setup Initial Date State
  const now = new Date();
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);

  // 2. Generate Dynamic Year List (from 2024 to Current Year)
  const startYear = 2024;
  const currentYear = now.getFullYear();
  const years = [];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }

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

  // 3. Fetch Data whenever tenant, month, or year changes
  useEffect(() => {
    const fetchReport = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      try {
        // Updated URL to use tenant.id
        const res = await fetch(
          `${API}/reports/detailed/${tenant.id}?month=${month}&year=${year}`,
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [API, tenant?.id, month, year]);

  return (
    <div style={{ marginTop: 20, fontFamily: "sans-serif" }}>
      {/* Hide this header when printing */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            table { border: 1px solid #000 !important; }
            th, td { border: 1px solid #000 !important; color: #000 !important; }
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h3 style={{ margin: 0 }}>Attendance Report: {tenant?.username}</h3>
        <button
          className="no-print"
          onClick={() => window.print()}
          style={{
            padding: "8px 15px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Print Report
        </button>
      </div>

      {/* FILTERS - Hidden on Print */}
      <div
        className="no-print"
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
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
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {loading && (
          <span
            style={{ alignSelf: "center", fontSize: "14px", color: "#666" }}
          >
            Updating...
          </span>
        )}
      </div>

      {/* REPORT TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
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
              <th style={{ padding: "12px", border: "1px solid #454d55" }}>
                Employee Name
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #454d55",
                  textAlign: "center",
                }}
              >
                Normal Days
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #454d55",
                  textAlign: "center",
                }}
              >
                Fridays
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #454d55",
                  textAlign: "center",
                }}
              >
                Sick
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #454d55",
                  textAlign: "center",
                }}
              >
                Off
              </th>
              <th
                style={{
                  padding: "12px",
                  border: "1px solid #454d55",
                  textAlign: "center",
                }}
              >
                PH
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.name} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {row.name}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {parseFloat(row.normal_days).toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {parseFloat(row.fridays).toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center", color: "#d9534f" }}>
                    {parseFloat(row.sick_days).toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center", color: "#6c757d" }}>
                    {parseFloat(row.off_days).toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center", color: "#007bff" }}>
                    {parseFloat(row.public_holidays).toFixed(1)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  No logs found for {months[month - 1]} {year}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: "12px", color: "#888", marginTop: "10px" }}>
        * 1.0 = Full day (Both shifts), 0.5 = Half day (Single shift)
      </p>
    </div>
  );
}
