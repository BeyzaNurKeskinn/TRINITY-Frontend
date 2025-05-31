import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
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
  isFeatured: boolean;
}

interface PasswordsProps {
  user: {
    username: string;
    profilePicture: string | null;
  };
}

const Passwords: React.FC<PasswordsProps> = ({ user }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [currentPasswordId, setCurrentPasswordId] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStep, setUpdateStep] = useState<"request" | "verify" | "setNew">("request"); // Yeni adım durumu
  const navigate = useNavigate();
  const location = useLocation();

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
        setFilteredPasswords(response.data);

        const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
        const userCats = categories.filter((cat) => uniqueCategoryIds.includes(cat.id));
        setUserCategories(userCats);

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

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPasswords(passwords);
      return;
    }
    const filtered = passwords.filter((password) =>
      [password.title, password.username, password.description]
        .filter((field) => field)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPasswords(filtered);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredPasswords(passwords);
  };

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

      const response = await axios.get("http://localhost:8080/api/user/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswords(response.data);
      setFilteredPasswords(response.data);
      const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
      setUserCategories(categories.filter((cat) => uniqueCategoryIds.includes(cat.id)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Şifre eklenirken bir hata oluştu.");
    }
  };

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
      { ...updatePasswordData, password: newPasswordInput, status: "ACTIVE" },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Güncellenen şifre ID:", updatePasswordData.id, "Yeni şifre:", newPasswordInput);

    setVisiblePasswords((prev) => {
      const newVisible = { ...prev };
      delete newVisible[updatePasswordData.id];
      console.log("visiblePasswords güncellendi:", newVisible);
      return newVisible;
    });

    setShowUpdateModal(false);
    setUpdatePasswordData(null);
    setUpdateStep("request");
    setNewPasswordInput("");
    setVerifyCode("");

    const response = await axios.get("http://localhost:8080/api/user/passwords", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Yeni yüklenen passwords:", response.data);
    setPasswords(response.data);
    setFilteredPasswords(response.data);
    setFilteredPasswords((prev) => [...prev]); // Render’ı zorla
    const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
    setUserCategories(categories.filter((cat) => uniqueCategoryIds.includes(cat.id)));
  } catch (err: any) {
    setError(err.response?.data?.message || "Şifre güncellenirken bir hata oluştu.");
  }
};


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

      const response = await axios.get("http://localhost:8080/api/user/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswords(response.data);
      setFilteredPasswords(response.data);
      const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
      setUserCategories(categories.filter((cat) => uniqueCategoryIds.includes(cat.id)));
    } catch (err: any) {
      setError(err.response?.data?.message || "Şifre silinirken bir hata oluştu.");
    }
  };

 const sendVerificationCode = async (passwordId: number, context: "view" | "update" = "view") => {
  try {
    const token = localStorage.getItem("accessToken");
    console.log("Token:", token);
    if (!token) {
      console.log("Token eksik, login sayfasına yönlendiriliyor...");
      navigate("/login");
      return;
    }

    const response = await axios.post(
      "http://localhost:8080/api/auth/user/send-verification-code",
      { context }, // Context bilgisini gönder
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setCurrentPasswordId(passwordId);
    if (context === "update") {
      setUpdateStep("verify");
    } else {
      setShowVerifyModal(true);
    }
    console.log("Sunucu yanıtı:", response.data);
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.response?.data || "Doğrulama kodu gönderilirken bir hata oluştu.";
    setError(errorMessage);
    console.error("Hata detayı:", err.response ? err.response.data : err.message);
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.log("401/403 hatası alındı, token siliniyor ve login sayfasına yönlendiriliyor...");
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  }
};
useEffect(() => {
  console.log("Passwords state güncellendi:", passwords);
}, [passwords]);
const verifyCodeAndProceed = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    console.log("Gönderilen doğrulama kodu:", verifyCode);
    if (!verifyCode || verifyCode.length !== 6 || !/^\d+$/.test(verifyCode)) {
      setError("Lütfen 6 haneli bir doğrulama kodu girin.");
      return;
    }

    await axios.post(
      "http://localhost:8080/api/auth/user/verify-code",
      { code: verifyCode },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Doğrulama başarılı");

    if (currentPasswordId !== null) {
      console.log("Şifre alma isteği yapılıyor, ID:", currentPasswordId);
      const passwordResponse = await axios.get(
        `http://localhost:8080/api/auth/user/password/${currentPasswordId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Yanıt artık { password: "değer" } formatında
      console.log("Şifre alma yanıtı (JSON):", passwordResponse.data);

      // *** DEĞİŞİKLİK: Yanıttaki .password alanını al ***
      const decryptedPassword = passwordResponse.data.password;

      // Kontrolü bu değer üzerinden yap
      if (decryptedPassword !== null && decryptedPassword !== undefined) {
        // Şifre görünür yap
        setVisiblePasswords((prev) => ({ ...prev, [currentPasswordId]: true }));
        
        // State'deki şifre listesini güncelle
        setPasswords((prevPasswords) =>
          prevPasswords.map((p) =>
            p.id === currentPasswordId ? { ...p, password: decryptedPassword } : p
          )
        );
        
        // Arama sonuçlarını da güncelle (eğer kullanılıyorsa)
         setFilteredPasswords((prevFiltered) =>
          prevFiltered.map((p) =>
            p.id === currentPasswordId ? { ...p, password: decryptedPassword } : p
          )
        );
      } else {
        console.error("API'den gelen şifre değeri boş veya geçersiz:", passwordResponse.data);
        setError("Şifre alınamadı, lütfen tekrar deneyin.");
      }
      setShowVerifyModal(false);
    }

    // Güncelleme adımlarını yöneten kısım
    if (currentPasswordId === updatePasswordData?.id) {
      setUpdateStep("setNew");
    }

    setVerifyCode("");
  } catch (err: any) {
    setError(err.response?.data?.message || "Doğrulama başarısız.");
    console.error("Doğrulama hatası:", err.response ? err.response.data : err.message);
  }
};
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

          <div className="flex items-center mb-6 space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Şifre ara (başlık, kullanıcı adı, açıklama)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-80 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button
                onClick={handleSearch}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Ara
              </button>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Temizle
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Yeni Şifre Ekle
            </button>
          </div>

      {filteredPasswords.length > 0 ? (
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
                {filteredPasswords.map((password) => (
                  <tr key={password.id} className="border-b">
                    <td className="p-2">{password.title}</td>
                    <td className="p-2">{password.username}</td>
                    <td className="p-2">
                      {visiblePasswords[password.id] ? (
                        password.password ? (
                          <div className="flex items-center">
                            <span className="mr-2">{password.password}</span>
                            <button
                              onClick={() => {
                                setVisiblePasswords((prev) => {
                                  const newVisible = { ...prev };
                                  delete newVisible[password.id];
                                  return newVisible;
                                });
                              }}
                              className="text-gray-500 hover:text-gray-700 focus:outline-none w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="text-red-500">
                            Şifre yüklenemedi{" "}
                            <span
                              className="text-blue-500 cursor-pointer hover:underline"
                              onClick={() => console.log("Boş şifre durumu:", { id: password.id, password: password.password })}
                            >
                              [Debug]
                            </span>
                          </span>
                        )
                      ) : (
                       <button
  onClick={() => sendVerificationCode(password.id, "view")}
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
      setUpdateStep("request");
    }}
    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
  >
    Güncelle
  </button>
  <button
    onClick={() => handleDeletePassword(password.id)}
    className="bg-red-500 text-white px-2 py-1 rounded mr-2 hover:bg-red-600"
  >
    Sil
  </button>
  <button
    onClick={async () => {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.put(
          `http://localhost:8080/api/auth/user/passwords/${password.id}/toggle-featured`,
          { isFeatured: !password.isFeatured },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPasswords((prev) =>
          prev.map((p) =>
            p.id === password.id ? { ...p, isFeatured: !p.isFeatured } : p
          )
        );
        setFilteredPasswords((prev) =>
          prev.map((p) =>
            p.id === password.id ? { ...p, isFeatured: !p.isFeatured } : p
          )
        );
      } catch (err) {
        setError("Öne çıkarma işlemi başarısız.");
      }
    }}
    className={`px-2 py-1 rounded text-white ${
      password.isFeatured
        ? "bg-yellow-500 hover:bg-yellow-600"
        : "bg-gray-500 hover:bg-gray-600"
    }`}
  >
    {password.isFeatured ? "Öne Çıkarmayı Kaldır" : "Öne Çıkar"}
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Şifre bulunamadı.</p>
        )}
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
                <textarea
                  placeholder="Açıklama"
                  value={updatePasswordData.description}
                  onChange={(e) =>
                    setUpdatePasswordData({ ...updatePasswordData, description: e.target.value })
                  }
                  className="w-full p-2 mb-4 border rounded"
                />
                {updateStep === "request" && (
  <button
    onClick={() => sendVerificationCode(updatePasswordData.id, "update")}
    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
  >
    Şifre Değiştirme İsteği Gönder
  </button>
)}
                {updateStep === "verify" && (
                  <>
                    <input
                      type="text"
                      placeholder="Doğrulama Kodunu Girin"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      className="w-full p-2 mb-4 border rounded"
                    />
                    <button
                      onClick={verifyCodeAndProceed}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Doğrula
                    </button>
                  </>
                )}
                {updateStep === "setNew" && (
                  <>
                    <input
                      type="password"
                      placeholder="Yeni Şifreyi Girin"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full p-2 mb-4 border rounded"
                    />
                    <button
                      onClick={handleUpdatePassword}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Şifreyi Kaydet
                    </button>
                  </>
                )}
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateStep("request");
                      setVerifyCode("");
                      setNewPasswordInput("");
                    }}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    onClick={verifyCodeAndProceed}
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