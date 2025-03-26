import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
const STREAM_URL = "http://70c3-139-179-55-129.ngrok-free.app"; // Replace with ngrok or your own stream URL



export default function DashboardManager() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
  
    // 🔁 Refresh sensor data every 5 seconds
    const interval = setInterval(fetchWarehouseData, 5000);
    return () => clearInterval(interval);
  }, []);
  

  const fetchWarehouseData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sensor-data`);
      const data = await res.json();
      setStockWeights(data);
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
    }
  };

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

  const handleQuit = () => {
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Manager Dashboard</h1>
      <p>Manage inventory and view live camera feed:</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
        {/* Stock Table */}
        <div>
          <h2>Stock Inventory</h2>
          {loading ? (
            <p>Loading inventory...</p>
          ) : (
            <table style={{ borderCollapse: 'collapse', margin: 'auto' }}>
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
                        style={{ backgroundColor: 'green', color: 'white', margin: '5px' }}
                      >
                        +1
                      </button>
                      <button 
                        onClick={() => updateStock(item.name, -1)} 
                        style={{ backgroundColor: 'red', color: 'white', margin: '5px' }}
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

        {/* Live Stream */}
        <div>
          <h2>Live Camera</h2>
          <img src={`${STREAM_URL}/video`} width="320" height="240" alt="Live Stream" />
        </div>
      </div>
    
    {/* Warehouse Parameters */}
    <div style={{ marginTop: "30px", textAlign: "left" }}>
      <h2>Warehouse Sensor Data</h2>
      <ul>
        <li><strong>1st Stock Weight:</strong> {stockWeights.weight1} kg</li>
        <li><strong>2nd Stock Weight:</strong> {stockWeights.weight2} kg</li>
        <li><strong>3rd Stock Weight:</strong> {stockWeights.weight3} kg</li>
        <li><strong>Warehouse Temperature:</strong> {stockWeights.temperature} °C</li>
      </ul>
    </div>

      {/* Quit Button */}
      <button 
        onClick={handleQuit} 
        style={{ marginTop: "20px", padding: "10px 20px", background: "red", color: "white" }}
      >
        Quit
      </button>
    </div>
  );
}
