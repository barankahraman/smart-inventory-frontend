import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("");

        localStorage.setItem("user", username);

        // Redirect user based on their role
        if (username === "manager") {
          navigate("/manager");
        } else if (username === "worker") {
          navigate("/worker");
        } else {
          alert(`Welcome, ${username}! (No dedicated page)`);
        }
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="container">
      <h1>Smart Inventory Management System</h1>

      <div className="input-group">
        <label>Username:</label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
