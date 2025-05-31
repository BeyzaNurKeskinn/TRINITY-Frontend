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
    ChevronRightIcon
} from '@heroicons/react/24/outline';

// TypeScript Arayüzleri (Değişiklik yok)
interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface DashboardData {
  adminName?: string;
  username:string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Veri çekme ve yönlendirme mantığı aynı, bu kısımlarda değişiklik yok
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
            } else {
                const [mostViewedResponse, featuredResponse, categoriesResponse] = await Promise.all([
                    axios.get("http://localhost:8080/api/user/most-viewed-passwords", { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get("http://localhost:8080/api/user/featured-passwords", { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get("http://localhost:8080/api/user/categories", { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setData({
                    username,
                    mostViewedPasswords: mostViewedResponse.data,
                    featuredPasswords: featuredResponse.data,
                });
                setCategories(categoriesResponse.data);
            }
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            setError("Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center text-center p-4">
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-5 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          Giriş Sayfasına Dön
        </button>
      </div>
    );
  }

  // --- YENİ KURUMSAL TASARIM ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="ml-64 p-8 w-full">
          {isAdmin ? (
            // --- ADMIN PANELİ KURUMSAL TASARIM ---
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
                <p className="text-gray-600 mt-1">Sistem verilerine ve genel istatistiklere hoş geldiniz.</p>
              </div>

              {/* KPI Kartları */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-5">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full"><LockClosedIcon className="w-7 h-7 text-blue-600"/></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Toplam Şifre</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.passwordCount || 0}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-5">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full"><UsersIcon className="w-7 h-7 text-blue-600"/></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Toplam Kullanıcı</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.userCount || 0}</p>
                </div>
              </div>
              
              {/* Bu kartı boş bırakabilir veya başka bir KPI ekleyebilirsiniz */}
               <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-5">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full"><ClockIcon className="w-7 h-7 text-blue-600"/></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sistem Zamanı</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Öne Çıkan Şifreler</h3>
                 <div className="space-y-3">
                  {data.featuredPasswords && data.featuredPasswords.length > 0 ? (
                    data.featuredPasswords.map((password, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                        <StarIcon className="w-5 h-5 text-yellow-500 mr-3"/>
                        <p className="font-medium text-gray-700">{password}</p>
                      </div>
                    ))
                  ) : <p className="text-gray-500">Öne çıkan şifre bulunmuyor.</p>}
                </div>
              </div>

              <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Son İşlemler</h3>
                <ul className="space-y-4">
                  {data.recentActions && data.recentActions.length > 0 ? (
                    data.recentActions.slice(0, 5).map((action, index) => ( // Sadece ilk 5'i göster
                      <li key={index} className="flex items-start text-sm">
                        <div className="flex-shrink-0 w-4 h-4 bg-blue-200 rounded-full mt-1 mr-3"></div>
                        <span className="text-gray-600">{action}</span>
                      </li>
                    ))
                  ) : <p className="text-gray-500">Son işlem bulunamadı.</p>}
                </ul>
              </div>

            </div>
          ) : (
            // --- KULLANICI PANELİ KURUMSAL TASARIM ---
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <h1 className="text-3xl font-bold text-gray-900">Hoş Geldiniz, {data.username}</h1>
                <p className="text-gray-600 mt-1">Şifrelerinizi yönetmeye başlayın.</p>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                 <h3 className="text-lg font-semibold text-gray-900 mb-5">Kategoriler</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.length > 0 ? categories.map((cat) => (
                    <button key={cat.id} onClick={() => navigate('/passwords')} className="group flex items-center justify-between text-left p-4 bg-gray-50 hover:bg-blue-100 hover:shadow-md border border-gray-200 rounded-lg transition-all duration-300">
                       <div className="flex items-center">
                         <FolderIcon className="w-6 h-6 text-blue-500 mr-4"/>
                         <span className="font-semibold text-gray-800">{cat.name}</span>
                       </div>
                       <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"/>
                    </button>
                  )) : <p className="text-gray-500 sm:col-span-2">Henüz kategori oluşturulmamış.</p>}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                 <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Favoriler</h3>
                    <div className="space-y-3">
                      {data.featuredPasswords && data.featuredPasswords.length > 0 ? data.featuredPasswords.map((pw, i) => (
                        <div key={i} className="flex items-center p-3 bg-gray-50 rounded-md">
                          <StarIcon className="w-5 h-5 text-yellow-500 mr-3"/>
                          <p className="font-medium text-gray-700 truncate">{pw}</p>
                        </div>
                      )) : <p className="text-gray-500">Favori şifre yok.</p>}
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sık Görüntülenenler</h3>
                    <div className="space-y-3">
                      {data.mostViewedPasswords && data.mostViewedPasswords.length > 0 ? data.mostViewedPasswords.map((pw, i) => (
                        <div key={i} className="flex items-center p-3 bg-gray-50 rounded-md">
                          <EyeIcon className="w-5 h-5 text-blue-500 mr-3"/>
                          <p className="font-medium text-gray-700 truncate">{pw}</p>
                        </div>
                      )) : <p className="text-gray-500">Sık görüntülenen şifre yok.</p>}
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