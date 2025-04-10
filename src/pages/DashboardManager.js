import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
const STREAM_URL = process.env.REACT_APP_API_URL;

export default function DashboardManager() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actuator, setActuator] = useState("OFF");
  const [mode, setMode] = useState("manual");
  const [threshold, setThreshold] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");


  const [stockWeights, setStockWeights] = useState({
    weight1: 0,
    weight2: 0,
    weight3: 0,
    temperature: 0
  });

  useEffect(() => {
    const fetchInitialMode = async () => {
      const res = await fetch(`${API_URL}/api/mode`);
      const data = await res.json();
      setMode(data.mode);
      setThreshold(data.threshold);
    };

    fetchInitialMode();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(API_URL.replace("https://", "wss://") + "/ws/updates");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "mode_update") {
        setMode(data.mode);
        setThreshold(data.threshold || 26);
      }
      else if (data.type === "actuator_update") {
        setActuator(data.actuator);
      }
    };

    return () => ws.close();
  }, []);

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
        body: JSON.stringify({ actuator }),
      });
      const result = await response.json();
      console.log("Response:", result);

      setSaveMessage("✅ Command sent to Raspberry Pi!");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (error) {
      console.error("❌ Failed to send actuator command:", error);
    }
  };
  
  const sendModeUpdate = async (newMode, newThreshold = threshold) => {
    try {
      await fetch(`${API_URL}/api/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mode',
          mode: newMode,
          threshold: newMode === 'auto' ? newThreshold : undefined,
          piId: 'sensor-pi-1'  // ✅ <- Add your sensor Pi's ID here
        })
      });
      console.log("✅ Mode updated on backend:", newMode);
    } catch (err) {
      console.error("❌ Failed to update mode:", err);
    }
  };



  const handleQuit = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true }); // ✅ force redirect with replace
  };


  return (
    
    <div
    style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',

    }}

    >
      <h1 style={{ textAlign: 'center' }}>Manager Dashboard</h1>
      <p style={{ textAlign: 'center' }}>Manage inventory and view live camera feed:</p>
  
      {/* Inventory + Camera Side-by-Side */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        {/* Inventory */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Stock Inventory</h2>
          {loading ? (
            <p>Loading inventory...</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left' }}>
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
                      <button
                        onClick={() => updateStock(item.name, +1)}
                        style={{ backgroundColor: 'green', color: 'white', margin: '2px' }}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => updateStock(item.name, -1)}
                        style={{ backgroundColor: 'red', color: 'white', margin: '2px' }}
                      >
                        -1
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
  
        {/* Camera */}
        <div style={{ flexShrink: 0 }}>
          <h2>Live Camera</h2>
          <img
            src={`${STREAM_URL}/video_feed`}
            width="620"
            height="480"
            alt="Live Stream"
            style={{ borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>
      </div>
  
      {/* Sensor Data */}
      <div style={{ marginTop: '30px' }}>
        <h2>Warehouse Sensor Data</h2>
        <ul>
          <li><strong>1st Stock Weight:</strong> {stockWeights.weight1} kg</li>
          <li><strong>2nd Stock Weight:</strong> {stockWeights.weight2} kg</li>
          <li><strong>3rd Stock Weight:</strong> {stockWeights.weight3} kg</li>
          <li><strong>Temperature:</strong> {stockWeights.temperature} °C</li>
        </ul>
      </div>

      {/* Mode Selection */}
      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", maxWidth: "500px" }}>
        <h2>🧠 Actuator Mode</h2>

        <div style={{ display: "flex", gap: "15px", marginBottom: "10px" }}>
          <button
            onClick={() => {
              setMode("manual");
              sendModeUpdate("manual");
            }}
            style={{
              backgroundColor: mode === "manual" ? "#2196f3" : "#e0e0e0",
              color: mode === "manual" ? "white" : "black",
              padding: "8px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Manual Mode
          </button>

          <button
            onClick={() => {
              setMode("auto");
              sendModeUpdate("auto", threshold);
            }}
            style={{
              backgroundColor: mode === "auto" ? "#4caf50" : "#e0e0e0",
              color: mode === "auto" ? "white" : "black",
              padding: "8px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Auto Mode
          </button>
        </div>

        {mode === "auto" && (
          <div style={{ marginTop: "10px" }}>
            <label><strong>Temperature Threshold (°C):</strong></label>
            <input
              type="number"
              defaultValue={threshold}
              id = "thresholdInput"
              placeholder = "Enter new threshold"
              style={{
                marginLeft: "10px",
                padding: "5px",
                width: "80px",
                borderRadius: "5px",
                border: "1px solid #ccc"
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById("thresholdInput");
                const newValue = parseFloat(input.value);

                if (!isNaN(newValue)) {
                  setThreshold(newValue);
                  sendModeUpdate("auto", newValue);
                  setSaveMessage("✅ Threshold saved!");
                  input.value = "";

                  setTimeout(() => setSaveMessage(""), 2000);
                }
                else {
                  setSaveMessage("⚠️ Please enter a valid number.");
                  setTimeout(() => setSaveMessage(""), 2000);
                }
              }}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                padding: "5px 12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              ➤ Enter
            </button>
            <p style={{ marginTop: "8px", color: "white", fontWeight: "bold" }}>
             {saveMessage}
            </p>
          </div>
          )}

        <p style={{ marginTop: "10px" }}>
          <strong>Current Mode:</strong> {mode === "manual" ? "🧍 Manual" : `🤖 Auto (Threshold: ${threshold}°C)`}
        </p>
      </div>

  
      {/* Actuator Command */}
      <div style={{ marginTop: '30px' }}>
        <h2>Send Manual Actuator Command</h2>
        <div>
          <label><strong>Actuator:</strong>&nbsp;</label>
          <select
            value={actuator || ""}
            onChange={(e) => setActuator(e.target.value)}
            disabled={mode === "auto"}
            autoComplete="off"
          >
            <option value="">-- Select --</option>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </div>

        <button
          onClick={sendActuatorCommand}
          disabled={mode == "auto"}
          style={{
            marginTop: '15px',
            backgroundColor: mode === "auto" ? "#999" : "#4CAF50",
            color: "white",
            padding: "10px 20px",
            fontSize: "16px",
            border: "none",
            borderRadius: "5px",
            cursor: mode === "auto" ? "not-allowed" : "pointer"
          }}
        >
          🚀 Send Command to Pi
        </button>
        {/* Show message here */}
        {mode === "manual" && saveMessage && (
          <p style={{ marginTop: "10px", color: "white", fontWeight: "bold" }}>
            {saveMessage}
          </p>
        )}
      </div>
  
      {/* Quit Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={handleQuit}
          style={{
            padding: "10px 20px",
            background: "blue",
            color: "white",
            fontSize: "16px",
            borderRadius: "5px"
          }}
        >
          Quit
        </button>
      </div>
    </div>
  );
  
}

