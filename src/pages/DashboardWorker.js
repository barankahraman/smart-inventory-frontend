import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function DashboardWorker() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/items`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const getStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 5) return "Low Stock";
    return "In Stock";
  };

  const handleQuit = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true }); // ✅ force redirect with replace
  };


  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Worker Dashboard</h1>
      <p>View shared inventory status:</p>
      <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px" }}>Item</th>
            <th style={{ padding: "8px" }}>Stock</th>
            <th style={{ padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name}>
              <td style={{ padding: "8px" }}>{item.name}</td>
              <td style={{ padding: "8px" }}>{item.stock}</td>
              <td style={{ padding: "8px" }}>{getStatus(item.stock)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        style={{ marginTop: "20px", padding: "10px 20px" }}
        onClick={handleQuit}
      >
        Quit
      </button>
    </div>
  );
}
