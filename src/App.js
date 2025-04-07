import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardManager from "./pages/DashboardManager";
import DashboardWorker from "./pages/DashboardWorker";
import PrivateRoute from "./components/PrivateRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route 
          path="/manager" 
          element={
            <PrivateRoute>
              <DashboardManager />
            </PrivateRoute>
          }
        />
        <Route 
          path="/worker" 
          element={
            <PrivateRoute>
              <DashboardWorker />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
