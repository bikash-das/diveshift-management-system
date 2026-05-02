import { useState, useEffect, useCallback } from "react";

export default function Reports({ API, tenant }) {
  const now = new Date();
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);

  // 1. GET TOKEN FOR SECURE REQUEST
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

  // 2. STABILIZE FETCH WITH USECALLBACK
  const fetchReport = useCallback(async () => {
    if (!tenant?.id || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/reports/detailed/${tenant.id}?month=${month}&year=${year}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token, // MUST include this for the backend
          },
        },
      );

      // 3. DEFENSIVE PARSING (Prevents SyntaxError)
      const contentType = res.headers.get("content-type");
      if (
        !res.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        console.error("Report Error: Non-JSON response received");
        setData([]);
        return;
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  }, [API, tenant?.id, token, month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const renderValue = (val) => {
    const num = parseFloat(val);
    return num > 0 ? num.toFixed(1) : <span style={{ color: "#ccc" }}>-</span>;
  };

  const isMonthEmpty =
    data.length === 0 ||
    data.every((row) =>
      Object.values(row)
        .slice(1)
        .every((val) => Number(val) === 0),
    );

  return (
    <div style={{ marginTop: 20, fontFamily: "sans-serif" }}>
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>Attendance Report: {tenant?.name}</h3>
        <button
          className="no-print"
          onClick={() => window.print()}
          style={styles.printBtn}
        >
          Print Report
        </button>
      </div>

      {/* FILTERS */}
      <div className="no-print" style={styles.filterBar}>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          style={styles.select}
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
          style={styles.select}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {loading && <span style={styles.loadingText}>Loading...</span>}
      </div>

      {isMonthEmpty && !loading && (
        <div style={styles.alert}>
          <strong>No records found!</strong> No shifts logged for{" "}
          <strong>
            {months[month - 1]} {year}
          </strong>
          .
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Employee Name</th>
              <th style={styles.thCenter}>Normal</th>
              <th style={styles.thCenter}>Fridays</th>
              <th style={styles.thCenter}>Sick</th>
              <th style={styles.thCenter}>Off</th>
              <th style={styles.thCenter}>PH</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px", fontWeight: "bold" }}>
                  {row.name}
                </td>
                <td style={styles.tdCenter}>{renderValue(row.normal_days)}</td>
                <td style={styles.tdCenter}>{renderValue(row.fridays)}</td>
                <td style={{ ...styles.tdCenter, color: "#d9534f" }}>
                  {renderValue(row.sick_days)}
                </td>
                <td style={{ ...styles.tdCenter, color: "#6c757d" }}>
                  {renderValue(row.off_days)}
                </td>
                <td style={{ ...styles.tdCenter, color: "#007bff" }}>
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

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  printBtn: {
    padding: "8px 15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  filterBar: { display: "flex", gap: "10px", marginBottom: "20px" },
  select: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" },
  loadingText: { alignSelf: "center", fontSize: "14px", color: "#666" },
  alert: {
    padding: "15px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeeba",
    color: "#856404",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #ddd",
  },
  tableHeader: {
    backgroundColor: "#343a40",
    color: "white",
    textAlign: "left",
  },
  th: { padding: "12px", border: "1px solid #454d55" },
  thCenter: {
    padding: "12px",
    border: "1px solid #454d55",
    textAlign: "center",
  },
  tdCenter: { textAlign: "center", padding: "12px" },
};
