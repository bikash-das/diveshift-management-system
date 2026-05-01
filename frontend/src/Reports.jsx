import { useState, useEffect } from "react";

export default function Reports({ API, tenant }) {
  const now = new Date();
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchReport = async () => {
      if (!tenant?.id) return;
      setLoading(true);
      try {
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

  // Helper function - placed inside the component but BEFORE the return
  const renderValue = (val) => {
    const num = parseFloat(val);
    return num > 0 ? num.toFixed(1) : <span style={{ color: "#ccc" }}>-</span>;
  };

  const isMonthEmpty =
    data.length > 0 &&
    data.every(
      (row) =>
        Number(row.normal_days) === 0 &&
        Number(row.fridays) === 0 &&
        Number(row.sick_days) === 0 &&
        Number(row.off_days) === 0 &&
        Number(row.public_holidays) === 0,
    );

  return (
    <div style={{ marginTop: 20, fontFamily: "sans-serif" }}>
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
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Print Report
        </button>
      </div>

      {/* FILTERS */}
      <div
        className="no-print"
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          style={{ padding: "8px" }}
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
          style={{ padding: "8px" }}
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
            Loading...
          </span>
        )}
      </div>

      {/* EXPLICIT NOTICE */}
      {isMonthEmpty && !loading && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            color: "#856404",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <strong>No records found!</strong> There are no shifts logged for{" "}
          <strong>
            {months[month - 1]} {year}
          </strong>
          .
        </div>
      )}

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
                Normal
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
            {data.map((row) => (
              <tr key={row.name} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px", fontWeight: "bold" }}>
                  {row.name}
                </td>
                <td style={{ textAlign: "center" }}>
                  {renderValue(row.normal_days)}
                </td>
                <td style={{ textAlign: "center" }}>
                  {renderValue(row.fridays)}
                </td>
                <td style={{ textAlign: "center", color: "#d9534f" }}>
                  {renderValue(row.sick_days)}
                </td>
                <td style={{ textAlign: "center", color: "#6c757d" }}>
                  {renderValue(row.off_days)}
                </td>
                <td style={{ textAlign: "center", color: "#007bff" }}>
                  {renderValue(row.public_holidays)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
