import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardManager from "./pages/DashboardManager";
import DashboardWorker from "./pages/DashboardWorker";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/manager" element={<DashboardManager />} />
        <Route path="/worker" element={<DashboardWorker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
