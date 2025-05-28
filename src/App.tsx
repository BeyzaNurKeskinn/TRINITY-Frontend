import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";
import CategoryManagement from "./components/CategoryManagement";
import UserManagement from "./components/UserManagement";
import Account from "./components/Account";
import Navbar from "./components/Navbar";
import axios from "axios";
import Passwords from "./components/Passwords";

interface UserInfo {
  id?: number;
  username: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  profilePicture: string | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true); // Yükleme durumu eklendi

  const updateProfilePicture = useCallback(
    (base64String: string) => {
      if (user) {
        setUser((prev) => (prev ? { ...prev, profilePicture: base64String } : null));
      }
    },
    [user]
  );

  const updateUser = useCallback(
    (userData: Partial<UserInfo>) => {
      setUser((prev) => {
        if (!prev && userData.username) {
          return { username: userData.username, profilePicture: null, ...userData };
        }
        return prev ? { ...prev, ...userData } : null;
      });
    },
    []
  );

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Yükleme başlat
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setUser(null); // Token yoksa oturumu sonlandır
          return;
        }

        const response = await axios.get("http://localhost:8080/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API'dan gelen kullanıcı verisi:", response.data); // API yanıtını kontrol et
        if (response.data && response.data.username) {
          setUser({
            username: response.data.username,
            email: response.data.email || "",
            phone: response.data.phone || "",
            role: response.data.role || "",
            status: response.data.status || "",
            profilePicture: response.data.profilePicture || null,
          });
        } else {
          setUser(null);
          localStorage.removeItem("accessToken"); // Geçersiz veri gelirse token'ı temizle
        }
      } catch (err: any) {
        console.error("Kullanıcı verisi yükleme hatası:", err.response ? err.response.data : err.message);
        setUser(null); // Hata durumunda oturumu sonlandır
        localStorage.removeItem("accessToken"); // Hatalı token'ı temizle
      } finally {
        setLoading(false); // Yükleme tamamlandı
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>; // Yükleme ekranı
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login updateUser={updateUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      {user.username &&
        !["/login", "/register", "/forgot-password", "/reset-password"].includes(window.location.pathname) && (
          <Navbar username={user.username} profilePicture={user.profilePicture} />
        )}
      <div className={user.username ? "mt-16" : ""}>
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
            element={<Account user={user} updateProfilePicture={updateProfilePicture} />}
          />
          <Route
            path="/user/account"
            element={<Account user={user} updateProfilePicture={updateProfilePicture} />}
          />
          <Route path="/user/dashboard" element={<Dashboard user={user} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Login updateUser={updateUser} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;