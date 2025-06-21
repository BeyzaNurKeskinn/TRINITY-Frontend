import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";
import CategoryManagement from "./components/CategoryManagement";
import UserManagement from "./components/UserManagement";
import Passwords from "./components/Passwords";
import Navbar from "./components/Navbar";
import Account from "./components/Account";


interface UserInfo {
  id?: number;
  username: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  profilePicture: string | null;
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserInfo>({
    username: localStorage.getItem("username") || "",
    profilePicture: null,
  });

  const updateUser = useCallback((userData: Partial<UserInfo>) => {
    setUser((prev) => {
      const newUser = { ...prev, ...userData };
      if (userData.profilePicture !== undefined) {
        newUser.profilePicture = userData.profilePicture;
      }
      return newUser;
    });
  }, []);

  const updateProfilePicture = useCallback((base64String: string) => {
    setUser((prev) => {
      const newUser = { ...prev, profilePicture: base64String };
      console.log("Updated profile picture:", newUser); // Profil resmi güncellendiğinde log ekle
      return newUser;
    });
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      if (token && !user.id) {
        try {
          const response = await axios.get("http://localhost:8080/api/user/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          updateUser({
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            phone: response.data.phone,
            role: response.data.role,
            status: response.data.status,
            profilePicture: response.data.profilePicture || null,
          });
        } catch (error) {
          console.error("Kullanıcı bilgisi çekilirken hata:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("username");
          window.location.href = "/login";
        }
      }
    };
    fetchUserData();
  }, [updateUser, user.id]);

  // Auth sayfalarını kontrol et
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  return (
    <>
      {user.username && !isAuthPage && localStorage.getItem("accessToken") && (
        <Navbar
          username={user.username}
          profilePicture={user.profilePicture}
        />
      )}
      <div className={user.username && !isAuthPage && localStorage.getItem("accessToken") ? "mt-16" : ""}>
        <Routes>
          <Route path="/login" element={<Login updateUser={updateUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/dashboard" element={<Dashboard user={user} />} />
          <Route path="/admin/categories" element={<CategoryManagement user={user} />} />
          <Route path="/admin/users" element={<UserManagement user={user} />} />
          <Route path="/user/passwords" element={<Passwords user={user} />} />
          <Route
            path="/admin/account"
            element={<Account user={user} updateProfilePicture={updateProfilePicture} updateUser={updateUser} />}
          />
          <Route
            path="/user/account"
            element={<Account user={user} updateProfilePicture={updateProfilePicture} updateUser={updateUser} />}
          />
          <Route path="/user/dashboard" element={<Dashboard user={user} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Login updateUser={updateUser} />} />
        </Routes>
      </div>
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;