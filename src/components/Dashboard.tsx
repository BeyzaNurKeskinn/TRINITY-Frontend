import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import {
  LockClosedIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  FolderIcon,
  EyeIcon,
  ChevronRightIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
}
interface Password {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  username: string;
  description: string;
  status: string;
  isFeatured: boolean;
}
interface DashboardData {
  adminName?: string;
  username: string;
  passwordCount?: number;
  userCount?: number;
  recentActions?: string[];
  featuredPasswords?: Password[]; // string[] yerine Password[]
  mostViewedPasswords?: Password[]; // string[] yerine Password[]
}

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

interface DashboardProps {
  user: {
    username: string;
    profilePicture: string | null;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [data, setData] = useState<DashboardData>({ username: user.username });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allPasswords, setAllPasswords] = useState<Password[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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

        const { role, username } = userResponse.data;
        localStorage.setItem("username", username);
        const isAdminUser = role === "ADMIN";
        setIsAdmin(isAdminUser);

        if (isAdminUser) {
          const dashboardResponse = await axios.get("http://localhost:8080/api/admin/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setData({ username, ...dashboardResponse.data });
          // Admin kullanıcılarını çek
          const usersResponse = await axios.get("http://localhost:8080/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdminUsers(usersResponse.data.filter((u: any) => u.role === "ADMIN"));
          // Admin için kategorileri de çek
          const categoriesResponse = await axios.get("http://localhost:8080/api/admin/categories", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(categoriesResponse.data);
        } else {
          const [mostViewedResponse, featuredResponse, categoriesResponse, allPasswordsResponse] = await Promise.all([
            axios.get("http://localhost:8080/api/user/most-viewed-passwords", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8080/api/user/featured-passwords", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8080/api/user/categories", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8080/api/user/passwords", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          console.log("Featured Passwords Response:", featuredResponse.data); // Log ekle
          setData({
            username,
            mostViewedPasswords: mostViewedResponse.data,
            featuredPasswords: featuredResponse.data,
          });
          setCategories(categoriesResponse.data);
          setAllPasswords(allPasswordsResponse.data);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
        setError("An error occurred while fetching data. Please try again later.");
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);
  useEffect(() => {
    if (!loading) {
      if (isAdmin && location.pathname !== "/admin/dashboard") {
        navigate("/admin/dashboard");
      } else if (!isAdmin && location.pathname !== "/user/dashboard") {
        navigate("/user/dashboard");
      }
    }
  }, [isAdmin, location.pathname, navigate, loading]);

  const categoryColors = [
    "bg-blue-200",
    "bg-green-200",
    "bg-red-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-indigo-200",
    "bg-teal-200",
  ];

  // Admin dashboardunda öne çıkarılan şifreyi kaldırma fonksiyonu
 
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-md text-center transform transition-all duration-300 scale-100 hover:scale-105">
          <p className="text-blue-600 font-semibold text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition-all duration-300"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 text-gray-800 font-sans">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1 pt-3">
        <Sidebar />
        <main className="ml-64 p-8 w-full">
       
          {isAdmin ? (
            <div className="space-y-10 animate-fade-in">
              {/* Modern İstatistik Kutuları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-300 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-xl transition-all duration-300">
                  <LockClosedIcon className="w-8 h-8 text-blue-700 mb-2" />
                  <span className="text-sm font-medium text-blue-800">Toplam Şifre</span>
                  <span className="text-3xl font-bold text-blue-900">{data.passwordCount || 0}</span>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-300 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-xl transition-all duration-300">
                  <UsersIcon className="w-8 h-8 text-green-700 mb-2" />
                  <span className="text-sm font-medium text-green-800">Toplam Kullanıcı</span>
                  <span className="text-3xl font-bold text-green-900">{data.userCount || 0}</span>
                </div>
                {/* Kategori kartı (mor) */}
                <div className="bg-gradient-to-br from-purple-100 to-purple-300 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-xl transition-all duration-300">
                  <FolderIcon className="w-8 h-8 text-purple-700 mb-2" />
                  <span className="text-sm font-medium text-purple-800">Toplam Kategori</span>
                  <span className="text-3xl font-bold text-purple-900">{categories.filter(cat => cat.status === 'ACTIVE').length}</span>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-300 p-6 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-xl transition-all duration-300">
                  <ClockIcon className="w-8 h-8 text-yellow-700 mb-2" />
                  <span className="text-sm font-medium text-yellow-800">Sistem Saati</span>
                  <span className="text-2xl font-bold text-yellow-900">{new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
              {/* Modern Grid: Öne Çıkan Şifreler ve Son İşlemler */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Öne Çıkan Şifreler yerine Adminler */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <UsersIcon className="w-7 h-7 text-blue-500 mr-2" />
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Yöneticiler</h3>
                  </div>
                  {adminUsers && adminUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {adminUsers.map((admin) => (
                        <div
                          key={admin.id}
                          className="relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow p-5 flex flex-col hover:shadow-lg transition group"
                        >
                          <div className="flex items-center mb-2">
                            <UserIcon className="w-5 h-5 text-blue-400 mr-2" />
                            <span className="font-semibold text-gray-900 truncate text-lg">{admin.username}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" /> {admin.email}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <ShieldCheckIcon className="w-4 h-4 mr-1 text-gray-400" /> {admin.status || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">Sistemde başka yönetici yok.</div>
                  )}
                </div>
                {/* Son İşlemler Timeline */}
                <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
                  <div className="flex items-center mb-6">
                    <ClockIcon className="w-7 h-7 text-blue-500 mr-2" />
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Son İşlemler</h3>
                  </div>
                  {data.recentActions && data.recentActions.length > 0 ? (
                    <ol className="relative border-l-2 border-blue-200 ml-2 space-y-6">
                      {data.recentActions.slice(0, 8).map((action, idx) => (
                        <li key={idx} className="ml-6">
                          <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full ring-4 ring-white">
                            <ClockIcon className="w-4 h-4 text-white" />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-medium text-sm">{action}</span>
                            {/* Buraya tarih/saat eklenebilir, backend destekliyorsa */}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-gray-400 italic">Son işlem kaydı yok.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Hoşgeldin, {data.username} !</h1>
                <p className="text-gray-600  mt-4">TRİNİTY ile şifrelerinizi  güvenli bir şekilde yönetin.</p>
                {!isAdmin && allPasswords.length === 0 && (
                  <div className="mt-4 animate-fade-in">
                    <span className="text-base text-gray-700">
                      Henüz hiç şifreniz yok.{' '}
                      <span
                        className="text-red-500 underline cursor-pointer hover:text-red-700 transition font-bold"
                        onClick={() => navigate('/user/passwords')}
                      >
                        Hadi şifre oluşturalım!
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Kategoriler</h3>
                <div className="flex flex-wrap gap-4 overflow-x-auto pb-4">
                  {categories.length > 0 ? (
                    categories
                      .filter(cat => allPasswords.some(pw => pw.categoryId === cat.id))
                      .map((cat, index) => (
                        <button
                          key={cat.id}
                          onClick={() => navigate("/user/passwords", { state: { selectedCategory: cat } })}
                          className={`group flex items-center justify-between p-5 w-60 h-28 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-90 ${categoryColors[index % categoryColors.length]}`}
                        >
                          <div className="flex items-center">
                            <FolderIcon className="w-8 h-8 text-gray-800 mr-3" />
                            <span className="font-semibold text-lg text-gray-800">{cat.name}</span>
                          </div>
                          <ChevronRightIcon className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors duration-200" />
                        </button>
                      ))
                  ) : (
                    <p className="text-gray-500">No categories created yet.</p>
                  )}
                </div>
              </div>
              <div className="flex flex-row gap-6 flex-wrap">
                {/* Öne Çıkanlar */}
                <div className="flex-1 min-w-[280px] bg-slate-800 p-6 rounded-2xl shadow border border-gray-200 flex flex-col">
                  <div className="flex items-center mb-4">
                    <StarIcon className="w-7 h-7 text-yellow-500 mr-2" />
                    <h3 className="text-2xl font-bold text-white tracking-tight">Öne Çıkan Şifreler</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {(data.featuredPasswords || []).slice(0,2).map(pw => (
                      <div
                        key={pw.id}
                        className="relative bg-gray-50 border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col hover:shadow-md transition group hover:bg-gray-100"
                      >
                        <div className="flex items-center mb-1">
                          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-2">Öne Çıkan</span>
                          <span className="font-semibold text-gray-900 truncate text-base">{pw.title}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <FolderIcon className="w-4 h-4 mr-1 text-gray-400" /> {pw.categoryName}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <span className="font-bold mr-1">Kullanıcı:</span> {pw.username}
                        </div>
                        <div className="text-xs text-gray-700 mb-2 line-clamp-2">{pw.description}</div>
                        <button
                          className="mt-auto text-xs text-blue-600 hover:underline font-semibold"
                          onClick={() => navigate("/user/passwords", { state: { selectedPassword: pw } })}
                        >
                          Detaya Git
                        </button>
                      </div>
                    ))}
                    {(!data.featuredPasswords || data.featuredPasswords.length === 0) && (
                      <div className="text-xs text-gray-400 italic">Öne çıkan şifre yok.</div>
                    )}
                  </div>
                </div>
                {/* Sık Kullanılanlar */}
                <div className="flex-1 min-w-[280px] bg-slate-800 p-6 rounded-2xl shadow border border-gray-200 flex flex-col">
                  <div className="flex items-center mb-4">
                    <EyeIcon className="w-7 h-7 text-blue-500 mr-2" />
                    <h3 className="text-2xl font-bold text-white tracking-tight">Sık Kullanılan Şifreler</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {(data.mostViewedPasswords || []).slice(0,2).map(pw => (
                      <div
                        key={pw.id}
                        className="relative bg-gray-50 border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col hover:shadow-md transition group hover:bg-gray-100"
                      >
                        <div className="flex items-center mb-1">
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-2">Sık Kullanılan</span>
                          <span className="font-semibold text-gray-900 truncate text-base">{pw.title}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <FolderIcon className="w-4 h-4 mr-1 text-gray-400" /> {pw.categoryName}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <span className="font-bold mr-1">Kullanıcı:</span> {pw.username}
                        </div>
                        <div className="text-xs text-gray-700 mb-2 line-clamp-2">{pw.description}</div>
                        <button
                          className="mt-auto text-xs text-blue-600 hover:underline font-semibold"
                          onClick={() => navigate("/user/passwords", { state: { selectedPassword: pw } })}
                        >
                          Detaya Git
                        </button>
                      </div>
                    ))}
                    {(!data.mostViewedPasswords || data.mostViewedPasswords.length === 0) && (
                      <div className="text-xs text-gray-400 italic">Sık kullanılan şifre yok.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;