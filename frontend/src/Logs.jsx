export default function Logs({ logs }) {
  return (
    <>
      <h3>Logs</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Shift</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.work_date}</td>
              <td>{row.shift}</td>
              <td>{row.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
