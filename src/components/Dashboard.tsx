import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardData {
  adminName?: string;
  username: string;
  passwordCount?: number;
  userCount?: number;
  recentActions?: string[];
  featuredPasswords?: string[];
  mostViewedPasswords?: string[];
}

interface DashboardProps {
  user: {
    username: string;
    profilePicture: string | null;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [data, setData] = useState<DashboardData>({ username: user.username });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const userResponse = await axios.get("http://localhost:8080/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const role = userResponse.data.role;
      const username = userResponse.data.username;

      localStorage.setItem("username", username);

      setIsAdmin(role === "ADMIN");
      setData((prev) => ({ ...prev, username }));

      if (role === "ADMIN") {
        const dashboardResponse = await axios.get("http://localhost:8080/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData((prev) => ({
          ...prev,
          ...dashboardResponse.data,
        }));
      } else {
        // Kullanıcı dashboard’u için eksik API çağrılarını ekle
        const mostViewedResponse = await axios.get("http://localhost:8080/api/user/most-viewed-passwords", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const featuredResponse = await axios.get("http://localhost:8080/api/user/featured-passwords", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData((prev) => ({
          ...prev,
          mostViewedPasswords: mostViewedResponse.data,
          featuredPasswords: featuredResponse.data,
        }));
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      setError("Veri çekme hatası oluştu, lütfen tekrar giriş yapın.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (isAdmin && location.pathname !== "/admin/dashboard") {
        navigate("/admin/dashboard");
      } else if (!isAdmin && location.pathname !== "/user/dashboard") {
        navigate("/user/dashboard");
      }
    }
  }, [isAdmin, location.pathname, navigate, loading]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="ml-64 p-6 w-full mt-9">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Hoş geldin, {data.adminName || data.username}!
          </h1>
          {isAdmin ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
                  <div className="text-indigo-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4m0 2v1m-6-9H5v-2a2 2 0 012-2h1m8 0h1a2 2 0 012 2v2h-5m-4 4H5v2a2 2 0 002 2h1m8 0h1a2 2 0 002-2v-2h-5"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Toplam Şifre</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.passwordCount || 0}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
                  <div className="text-indigo-600">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Toplam Kullanıcı</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.userCount || 0}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Son İşlemler</h3>
                  <ul className="space-y-2">
                    {data.recentActions && data.recentActions.length > 0 ? (
                      data.recentActions.map((action, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <span className="mr-2 text-indigo-500">•</span>
                          {action}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">Son işlem yok</li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Öne Çıkan Şifreler</h2>
                <ul className="space-y-2">
                  {data.featuredPasswords && data.featuredPasswords.length > 0 ? (
                    data.featuredPasswords.map((password, index) => (
                      <li key={index} className="text-gray-600 flex items-center">
                        <span className="mr-2 text-indigo-500">•</span>
                        {password}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">Öne çıkan şifre yok</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Kullanıcı Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sık Görüntülenen Şifreler */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Sık Görüntülenen Şifreler</h3>
                  <ul className="space-y-2">
                    {data.mostViewedPasswords && data.mostViewedPasswords.length > 0 ? (
                      data.mostViewedPasswords.map((password, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <span className="mr-2 text-indigo-500">•</span>
                          {password}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">Henüz sık görüntülenen şifre yok</li>
                    )}
                  </ul>
                </div>
                {/* Öne Çıkarılan Şifreler */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Öne Çıkarılan Şifreler (Favoriler)</h3>
                  <ul className="space-y-2">
                    {data.featuredPasswords && data.featuredPasswords.length > 0 ? (
                      data.featuredPasswords.map((password, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <span className="mr-2 text-indigo-500">•</span>
                          {password}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">Henüz favori şifre yok</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;