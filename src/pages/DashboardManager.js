import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
const STREAM_URL = process.env.REACT_APP_API_URL;

export default function DashboardManager() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actuator1, setActuator1] = useState("OFF");
  const [actuator2, setActuator2] = useState("OFF");

  const [stockWeights, setStockWeights] = useState({
    weight1: 0,
    weight2: 0,
    weight3: 0,
    temperature: 0
  });

  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sensor-data`);
        const data = await res.json();
        setStockWeights(data);
      } catch (error) {
        console.error('Error fetching warehouse data:', error);
      }
    };

    fetchItems();
    fetchWarehouseData();
    const interval = setInterval(fetchWarehouseData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/items`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (itemName, delta) => {
    try {
      await fetch(`${API_URL}/items/${itemName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const sendActuatorCommand = async () => {
    try {
      const response = await fetch(`${API_URL}/api/send-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actuator1, actuator2 }),
      });
      const result = await response.json();
      alert("✅ Command sent to Raspberry Pi!");
      console.log("Response:", result);
    } catch (error) {
      console.error("❌ Failed to send actuator command:", error);
      alert("❌ Failed to send actuator command.");
    }
  };

  const handleQuit = () => {
    navigate('/');
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        minHeight: '100vh',
        justifyContent: 'center'
      }}
    >
      <h1>Manager Dashboard</h1>
      <p>Manage inventory and view live camera feed:</p>

      {/* Stock Table */}
      <div style={{ width: '100%' }}>
        <h2>Stock Inventory</h2>
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table style={{ margin: 'auto', textAlign: 'left', width: '100%' }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.stock}</td>
                  <td>
                    <button onClick={() => updateStock(item.name, +1)} style={{ backgroundColor: 'green', color: 'white', margin: '3px' }}>+1</button>
                    <button onClick={() => updateStock(item.name, -1)} style={{ backgroundColor: 'red', color: 'white', margin: '3px' }}>-1</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Live Camera */}
      <div>
        <h2>Live Camera</h2>
        <img src={`${STREAM_URL}/video_feed`} width="280" height="210" alt="Live Stream" />
      </div>

      {/* Warehouse Parameters */}
      <div style={{ textAlign: 'left', width: '100%' }}>
        <h2>Warehouse Sensor Data</h2>
        <ul>
          <li><strong>1st Stock Weight:</strong> {stockWeights.weight1} kg</li>
          <li><strong>2nd Stock Weight:</strong> {stockWeights.weight2} kg</li>
          <li><strong>3rd Stock Weight:</strong> {stockWeights.weight3} kg</li>
          <li><strong>Warehouse Temperature:</strong> {stockWeights.temperature} °C</li>
        </ul>
      </div>

      {/* Actuator Controls */}
      <div style={{ width: '100%' }}>
        <h2>Send Manual Actuator Command</h2>

        <div style={{ marginBottom: "10px" }}>
          <label><strong>Actuator 1:</strong>&nbsp;</label>
          <select value={actuator1} onChange={(e) => setActuator1(e.target.value)}>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label><strong>Actuator 2:</strong>&nbsp;</label>
          <select value={actuator2} onChange={(e) => setActuator2(e.target.value)}>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </div>

        <button
          onClick={sendActuatorCommand}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            fontSize: "16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          🚀 Send Command to Pi
        </button>
      </div>

      {/* Quit */}
      <button
        onClick={handleQuit}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "blue",
          color: "white"
        }}
      >
        Quit
      </button>
    </div>
  );
}

