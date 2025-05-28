import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get("http://localhost:8080/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAdmin(response.data.role === "ADMIN");
      } catch (error) {
        console.error("Rol bilgisi çekilirken hata:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username"); // Username'i temizle
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="bg-gray-800 text-white w-64 min-h-screen p-4 fixed top-16 z-20">
        <p className="text-center">Yükleniyor...</p>
      </div>
    );
  }

  const menuItems = isAdmin
    ? [
        { label: "Dashboard", path: "/admin/dashboard" },
        { label: "Kategori Yönetimi", path: "/admin/categories" },
        { label: "Şifre Yönetimi", path: "/admin/passwords" },
        { label: "Kullanıcı Yönetimi", path: "/admin/users" },
        { label: "Hesabım", path: "/admin/account" },
      ]
    : [
        { label: "Dashboard", path: "/user/dashboard" },
        { label: "Şifrelerim", path: "/user/passwords" },
        { label: "Hesabım", path: "/user/account" },
      ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 fixed top-16 z-20">
      <h2 className="text-xl font-bold mb-4">Menü</h2>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => navigate(item.path)}
              className={`w-full text-left p-2 rounded ${
                location.pathname === item.path ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="w-full text-left p-2 hover:bg-gray-700 rounded"
          >
            Çıkış Yap
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;