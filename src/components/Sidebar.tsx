import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true); // Collapse on mobile and sm screens
      } else {
        setIsCollapsed(false); // Expand on md and larger screens
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    localStorage.removeItem("username");
    navigate("/login");
  };

  const menuItems = isAdmin
    ? [
        { label: "Dashboard", path: "/admin/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { label: "Kategori Yönetimi", path: "/admin/categories", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
        { label: "Kullanıcı Yönetimi", path: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { label: "Hesabım", path: "/admin/account", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
      ]
    : [
        { label: "Dashboard", path: "/user/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { label: "Şifrelerim", path: "/user/passwords", icon: "M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4m0 2v1m-6-9H5v-2a2 2 0 012-2h1m8 0h1a2 2 0 012 2v2h-5m-4 4H5v2a2 2 0 002 2h1m8 0h1a2 2 0 002-2v-2h-5" },
        { label: "Hesabım", path: "/user/account", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
      ];

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white w-14 sm:w-16 md:w-24 min-h-screen p-2 sm:p-2.5 md:p-4 fixed top-14 sm:top-16 md:top-18 z-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-2 sm:p-2.5 md:p-4 fixed top-14 sm:top-16 md:top-18 z-20 transition-all duration-300 ${isCollapsed ? "w-14 sm:w-16 md:w-24" : "w-48 sm:w-52 md:w-64"}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        {!isCollapsed && <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-red-500">Menü</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>
      <ul className="space-y-1 sm:space-y-1.5 md:space-y-2">
        {menuItems.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full text-left p-2 sm:p-2.5 md:p-3 rounded-lg transition-all duration-200 text-xs sm:text-sm md:text-base ${
                location.pathname === item.path ? "bg-red-600 text-white shadow-md" : "hover:bg-red-700 hover:shadow-md"
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-2.5 md:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left p-2 sm:p-2.5 md:p-3 rounded-lg hover:bg-red-700 transition-all duration-200 text-xs sm:text-sm md:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-2.5 md:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="font-medium">Çıkış Yap</span>}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;