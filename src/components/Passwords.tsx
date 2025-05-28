import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation eklendi
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

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
  password: string;
  description: string;
  status: string;
}

interface PasswordsProps {
  user: {
    username: string;
    profilePicture: string | null;
  };
}

const Passwords: React.FC<PasswordsProps> = ({ user }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCategories, setUserCategories] = useState<Category[]>([]); // Kullanıcının şifrelerinin olduğu kategoriler
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [newPassword, setNewPassword] = useState({
    categoryId: "",
    title: "",
    username: "",
    password: "",
    description: "",
    status: "ACTIVE",
  });
  const [updatePasswordData, setUpdatePasswordData] = useState<Password | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [currentPasswordId, setCurrentPasswordId] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Mevcut yol bilgisi için

  // Tüm kategorileri çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:8080/api/user/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Kategoriler yüklenirken bir hata oluştu.");
      }
    };

    fetchCategories();
  }, [navigate]);

  // Şifreleri ve kullanıcıya ait kategorileri çek
  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        let url = "http://localhost:8080/api/user/passwords";
        if (selectedCategory && selectedCategory.name !== "Tümü") {
          url = `http://localhost:8080/api/user/passwords/by-category?category=${selectedCategory.name}`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPasswords(response.data);

        // Kullanıcının şifrelerinin olduğu kategorileri filtrele
        const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
        const userCats = categories.filter((cat) => uniqueCategoryIds.includes(cat.id));
        setUserCategories(userCats);

        // Varsayılan olarak "Tümü" seçili değilse ve ilk yükleme ise "Tümü"yi seç
        if (!selectedCategory && location.pathname === "/user/passwords" && response.data.length > 0) {
          setSelectedCategory({ id: -1, name: "Tümü", description: "Tüm şifreler", status: "ACTIVE" });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Şifreler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchPasswords();
  }, [selectedCategory, categories, navigate, location.pathname]);

  // Şifre ekle
  const handleAddPassword = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post("http://localhost:8080/api/user/passwords", newPassword, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddModal(false);
      setNewPassword({ categoryId: "", title: "", username: "", password: "", description: "", status: "ACTIVE" });

      // Şifreleri ve kategorileri yeniden çek
      const response = await axios.get("http://localhost:8080/api/user/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswords(response.data);
      const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
      setUserCategories(categories.filter((cat) => uniqueCategoryIds.includes(cat.id)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Şifre eklenirken bir hata oluştu.");
    }
  };

  // Şifre güncelle
  const handleUpdatePassword = async () => {
    if (!updatePasswordData) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:8080/api/user/passwords/${updatePasswordData.id}`,
        updatePasswordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowUpdateModal(false);
      setUpdatePasswordData(null);

      // Şifreleri ve kategorileri yeniden çek
      const response = await axios.get("http://localhost:8080/api/user/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswords(response.data);
      const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
      setUserCategories(categories.filter((cat) => uniqueCategoryIds.includes(cat.id)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Şifre güncellenirken bir hata oluştu.");
    }
  };

  // Şifre sil
  const handleDeletePassword = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(`http://localhost:8080/api/user/passwords/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Şifreleri ve kategorileri yeniden çek
      const response = await axios.get("http://localhost:8080/api/user/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswords(response.data);
      const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
      setUserCategories(categories.filter((cat) => uniqueCategoryIds.includes(cat.id)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Şifre silinirken bir hata oluştu.");
    }
  };

  // Doğrulama kodu gönder
  const sendVerificationCode = async (passwordId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:8080/api/auth/user/send-verification-code",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrentPasswordId(passwordId);
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Doğrulama kodu gönderilirken bir hata oluştu.");
    }
  };

  // Doğrulama kodunu kontrol et ve şifreyi göster
  const verifyCodeAndShowPassword = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:8080/api/auth/user/verify-code",
        { code: verifyCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (currentPasswordId !== null) {
        setVisiblePasswords((prev) => ({ ...prev, [currentPasswordId]: true }));
      }
      setShowVerifyModal(false);
      setVerifyCode("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Doğrulama başarısız.");
    }
  };

  // Kategori renkleri
  const categoryColors = [
    "bg-red-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-indigo-200",
    "bg-teal-200",
  ];

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
        <button
          onClick={() => setError(null)}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="ml-64 p-6 w-full mt-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Şifrelerim</h1>

          {/* Şifre Ekle Butonu */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 mb-6"
          >
            Yeni Şifre Ekle
          </button>

          {/* "Tümü" ve Kullanıcının Kategorileri Kartları */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div
              onClick={() => setSelectedCategory({ id: -1, name: "Tümü", description: "Tüm şifreler", status: "ACTIVE" })}
              className={`bg-gray-200 p-4 rounded-lg cursor-pointer shadow hover:shadow-lg transition transform hover:scale-105 ${
                selectedCategory && selectedCategory.name === "Tümü" ? "ring-2 ring-indigo-600" : ""
              }`}
            >
              <h3 className="text-lg font-semibold">Tümü</h3>
            </div>
            {userCategories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  categoryColors[index % categoryColors.length]
                } p-4 rounded-lg cursor-pointer shadow hover:shadow-lg transition transform hover:scale-105 ${
                  selectedCategory && selectedCategory.id === category.id ? "ring-2 ring-indigo-600" : ""
                }`}
              >
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
            ))}
          </div>

          {/* Şifre Tablosu */}
          {passwords.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Başlık</th>
                    <th className="p-2">Kullanıcı Adı</th>
                    <th className="p-2">Şifre</th>
                    <th className="p-2">Açıklama</th>
                    <th className="p-2">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {passwords.map((password) => (
                    <tr key={password.id} className="border-b">
                      <td className="p-2">{password.title}</td>
                      <td className="p-2">{password.username}</td>
                      <td className="p-2">
                        {visiblePasswords[password.id] ? (
                          "********" // Şifrelenmiş olduğu için yıldız gösteriyoruz
                        ) : (
                          <button
                            onClick={() => sendVerificationCode(password.id)}
                            className="text-blue-500 hover:underline"
                          >
                            Gör
                          </button>
                        )}
                      </td>
                      <td className="p-2">{password.description}</td>
                      
                      <td className="p-2">
                        <button
                          onClick={() => {
                            setUpdatePasswordData(password);
                            setShowUpdateModal(true);
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          Güncelle
                        </button>
                        <button
                          onClick={() => handleDeletePassword(password.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Henüz şifre eklenmemiş.</p>
          )}

          {/* Şifre Ekleme Modal'ı */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Yeni Şifre Ekle</h2>
                <select
                  value={newPassword.categoryId}
                  onChange={(e) => setNewPassword({ ...newPassword, categoryId: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Başlık"
                  value={newPassword.title}
                  onChange={(e) => setNewPassword({ ...newPassword, title: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <textarea
                  placeholder="Açıklama"
                  value={newPassword.description}
                  onChange={(e) => setNewPassword({ ...newPassword, description: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddPassword}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Şifre Güncelleme Modal'ı */}
          {showUpdateModal && updatePasswordData && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Şifreyi Güncelle</h2>
                <select
                  value={updatePasswordData.categoryId}
                  onChange={(e) =>
                    setUpdatePasswordData({ ...updatePasswordData, categoryId: parseInt(e.target.value) })
                  }
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Başlık"
                  value={updatePasswordData.title}
                  onChange={(e) =>
                    setUpdatePasswordData({ ...updatePasswordData, title: e.target.value })
                  }
                  className="w-full p-2 mb-4 border rounded"
                />
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={updatePasswordData.username}
                  onChange={(e) =>
                    setUpdatePasswordData({ ...updatePasswordData, username: e.target.value })
                  }
                  className="w-full p-2 mb-4 border rounded"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={updatePasswordData.password}
                  onChange={(e) =>
                    setUpdatePasswordData({ ...updatePasswordData, password: e.target.value })
                  }
                  className="w-full p-2 mb-4 border rounded"
                />
                <textarea
                  placeholder="Açıklama"
                  value={updatePasswordData.description}
                  onChange={(e) =>
                    setUpdatePasswordData({ ...updatePasswordData, description: e.target.value })
                  }
                  className="w-full p-2 mb-4 border rounded"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdatePassword}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Doğrulama Kodu Modal'ı */}
          {showVerifyModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Doğrulama Kodu Girin</h2>
                <p>E-postanıza gönderilen 6 haneli kodu girin:</p>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full p-2 mb-4 border rounded"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={verifyCodeAndShowPassword}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Doğrula
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Passwords;