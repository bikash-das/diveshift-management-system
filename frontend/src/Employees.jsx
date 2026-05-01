import { useState, useEffect } from "react";

export default function Employees({ API, user }) {
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const fetchEmployees = async () => {
    if (!user) return;

    const res = await fetch(`${API}/employee/${user.id}`);
    const data = await res.json();
    console.log(data);
    setEmployees(data);
  };

  useEffect(() => {
    if (user?.id) {
      fetchEmployees();
    }
  }, [user?.id, API]);

  const handleAdd = async () => {
    const res = await fetch(`${API}/employee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        user_id: user.id,
      }),
    });

    if (res.ok) {
      setForm({ name: "", phone: "", address: "" });
      fetchEmployees();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/employee/${id}`, {
      method: "DELETE",
    });

    fetchEmployees();
  };

  return (
    <div>
      <h3>Employees</h3>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <input
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      <button onClick={handleAdd}>Add</button>

      <hr />

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.phone}</td>
              <td>{emp.address}</td>
              <td>
                <button onClick={() => handleDelete(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
