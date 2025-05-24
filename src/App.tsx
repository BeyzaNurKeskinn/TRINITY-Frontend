import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const AdminDashboard: React.FC = () => {
  return <div>Admin Dashboard (Sonra Yapılacak)</div>;
};

const UserDashboard: React.FC = () => {
  return <div>User Dashboard (Sonra Yapılacak)</div>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>    
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Login />} />    
      </Routes> 
       
  
    </Router>
  );
};

export default App