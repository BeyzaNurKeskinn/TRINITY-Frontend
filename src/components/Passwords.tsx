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
  const [errors, setErrors] = useState<string[]>([]); // Yeni hata state'i
  const [updateStep, setUpdateStep] = useState<"request" | "verify" | "setNew">("request");
  const [highlightedPasswordId, setHighlightedPasswordId] = useState<number | null>(null);
  const [addPulse, setAddPulse] = useState(true);
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

        const passedCategory = location.state?.selectedCategory as Category | null;

        let url = "http://localhost:8080/api/user/passwords";
        if (passedCategory && passedCategory.name !== "Tümü") {
          setSelectedCategory(passedCategory);
          url = `http://localhost:8080/api/user/passwords/by-category?category=${passedCategory.name}`;
        } else if (selectedCategory && selectedCategory.name !== "Tümü") {
          url = `http://localhost:8080/api/user/passwords/by-category?category=${selectedCategory.name}`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
       
        // Mapping: featured -> isFeatured
        const mappedPasswords = response.data.map((p: any) => ({
          ...p,
          isFeatured: typeof p.isFeatured !== "undefined" ? p.isFeatured : p.featured,
        }));
        setPasswords(mappedPasswords);
        setFilteredPasswords(mappedPasswords);

        const uniqueCategoryIds = [...new Set(response.data.map((p: Password) => p.categoryId))];
        const userCats = categories.filter((cat) => uniqueCategoryIds.includes(cat.id));
        setUserCategories(userCats);

        if (!passedCategory && !selectedCategory && response.data.length > 0) {
          setSelectedCategory({ id: -1, name: "Tümü", description: "Tüm şifreler", status: "ACTIVE" });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Şifreler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchPasswords();
  }, [selectedCategory, categories, navigate, location.state]);

  useEffect(() => {
    // Eğer Dashboard'dan selectedPassword ile gelindiyse, o şifreyi vurgula
    const selectedPassword = location.state?.selectedPassword as Password | undefined;
    if (selectedPassword && selectedPassword.id) {
      setTimeout(() => {
        setHighlightedPasswordId(selectedPassword.id);
        // Vurguyu 2 saniye sonra kaldır
        setTimeout(() => setHighlightedPasswordId(null), 2000);
      }, 300);
    }
  }, [location.state]);

  useEffect(() => {
    setAddPulse(true);
    const timer = setTimeout(() => setAddPulse(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
    const newErrors: string[] = [];

    // İstemci tarafı doğrulaması
    if (!newPassword.categoryId) {
      newErrors.push("Kategori seçimi zorunludur.");
    }
    if (!newPassword.title.trim()) {
      newErrors.push("Başlık boş olamaz.");
    } else if (newPassword.title.length < 3 || newPassword.title.length > 50) {
      newErrors.push("Başlık 3 ile 50 karakter arasında olmalıdır.");
    }
    if (!newPassword.password.trim()) {
      newErrors.push("Şifre boş olamaz.");
    } else if (newPassword.password.length < 6) {
      newErrors.push("Şifre en az 6 karakter olmalıdır.");
    }
    if (newPassword.username && newPassword.username.length > 50) {
      newErrors.push("Kullanıcı adı 50 karakterden uzun olamaz.");
    }
    if (newPassword.description && newPassword.description.length > 200) {
      newErrors.push("Açıklama 200 karakterden uzun olamaz.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErrors(["Oturumunuz sona ermiş. Lütfen tekrar giriş yapın."]);
        navigate("/login");
        return;
      }

      await axios.post("http://localhost:8080/api/user/passwords", newPassword, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddModal(false);
      setNewPassword({ categoryId: "", title: "", username: "", password: "", description: "", status: "ACTIVE" });
      setErrors([]); // Hataları sıfırla

      const response = await axios.get("http://localhost:8080/api/user/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Mapping: featured -> isFeatured
      const mappedPasswords = response.data.map((p: any) => ({
        ...p,
        isFeatured: typeof p.isFeatured !== "undefined" ? p.isFeatured : p.featured,
      }));
      setPasswords(mappedPasswords);
      setFilteredPasswords(mappedPasswords);
      const uniqueCategoryIds = [...new Set(mappedPasswords.map((p: Password) => p.categoryId))];
      setUserCategories(categories.filter((cat) => uniqueCategoryIds.includes(cat.id)));
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || "Şifre eklenirken bir hata oluştu.";
      if (err.response?.status === 400) {
        if (backendMessage.includes("Kategori")) {
          newErrors.push("Geçersiz kategori seçimi.");
        } else if (backendMessage.includes("Başlık")) {
          newErrors.push("Başlık geçersiz veya çok uzun.");
        } else if (backendMessage.includes("Şifre")) {
          newErrors.push("Şifre geçersiz veya çok kısa.");
        } else {
          newErrors.push(backendMessage);
        }
      } else if (err.response?.status === 401) {
        newErrors.push("Yetkisiz işlem. Lütfen tekrar giriş yapın.");
        navigate("/login");
      } else {
        newErrors.push(backendMessage);
      }
      setErrors(newErrors);
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

      // Güncellenecek veriyi hazırla
      const updatedData = {
        categoryId: updatePasswordData.categoryId,
        title: updatePasswordData.title,
        username: updatePasswordData.username,
        description: updatePasswordData.description,
        status: "ACTIVE",
        // Şifre sadece newPasswordInput doluysa gönderilsin
        ...(newPasswordInput && { password: newPasswordInput }),
      };

      console.log("Güncellenen veri:", updatedData);

      await axios.put(
        `http://localhost:8080/api/user/passwords/${updatePasswordData.id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Şifre görünürlüğünü sıfırla
      setVisiblePasswords((prev) => {
        const newVisible = { ...prev };
        delete newVisible[updatePasswordData.id];
        return newVisible;
      });

      // Modalı kapat ve durumları sıfırla
      setShowUpdateModal(false);
      setUpdatePasswordData(null);
      setUpdateStep("request");
      setNewPasswordInput("");
      setVerifyCode("");

      // Şifreleri yeniden yükle
      const response = await axios.get("http://localhost:8080/api/user/passwords", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Mapping: featured -> isFeatured
      const mappedPasswords = response.data.map((p: any) => ({
        ...p,
        isFeatured: typeof p.isFeatured !== "undefined" ? p.isFeatured : p.featured,
      }));
      setPasswords(mappedPasswords);
      setFilteredPasswords(mappedPasswords);
      const uniqueCategoryIds = [...new Set(mappedPasswords.map((p: Password) => p.categoryId))];
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
        { context },
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

        // DEĞİŞİKLİK: Yanıttaki .password alanını al
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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 items-center justify-center">
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1">
        {/* Sidebar - Hide on mobile/tablet, show on desktop */}
        <div>
          <Sidebar />
        </div>
        <div className="w-full ml-14 lg:ml-64 p-2 sm:p-4 sm:ml-20 md:p-6 mt-4 sm:mt-6 md:mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 animate-fade-in">
            Şifrelerim
          </h1>

          {/* Kategori Listesi */}
          <div className="flex flex-wrap gap-3 sm:gap-2 mb-5 sm:mb-7">
            <div
              onClick={() => setSelectedCategory({ id: -1, name: "Tümü", description: "Tüm şifreler", status: "ACTIVE" })}
              className={`bg-gray-200 p-2 sm:p-4 rounded-lg cursor-pointer shadow hover:shadow-lg transition transform hover:scale-105 ${
                selectedCategory && selectedCategory.name === "Tümü" ? "ring-2 ring-indigo-600" : ""
              }`}
            >
              <h3 className="text-base sm:text-lg font-semibold">Tümü</h3>
            </div>
            {userCategories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  categoryColors[index % categoryColors.length]
                } p-2 sm:p-4 rounded-lg cursor-pointer shadow hover:shadow-lg transition transform hover:scale-105 ${
                  selectedCategory && selectedCategory.id === category.id ? "ring-2 ring-indigo-600" : ""
                }`}
              >
                <h3 className="text-base sm:text-lg font-semibold">{category.name}</h3>
              </div>
            ))}
          </div>

          {/* Arama ve Yeni Şifre */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-2 justify-end w-full">
            <input
              type="text"
              placeholder="Şifre ara (başlık, kullanıcı adı, açıklama)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full sm:w-80 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <div className="flex flex-row gap-2">
              <button
                onClick={handleSearch}
                className="bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-900"
              >
                Ara
              </button>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="bg-gray-300 text-gray-800 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Temizle
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className={`bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-900 ${addPulse ? "animate-pulse" : ""}`}
              >
                Yeni Şifre Ekle
              </button>
            </div>
          </div>

          {/* Şifre Kartları */}
          {filteredPasswords.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-1
                md:grid-cols-2
                lg:grid-cols-4
                gap-3 sm:gap-4
              "
            >
              {filteredPasswords.map((password) => (
                <div
                  key={password.id}
                  className={`relative bg-blue-50 dark:bg-slate-900 rounded-xl shadow p-3 sm:p-4 flex flex-row justify-between gap-3 sm:gap-4 border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-lg text-sm min-h-[120px] ${
                    password.isFeatured ? "border-yellow-300 ring-1 ring-yellow-200" : "border-gray-200"
                  } ${highlightedPasswordId === password.id ? "ring-4 ring-blue-400 bg-blue-100 animate-pulse" : ""}`}
                >
                  {/* Sol: İçerik */}
                  <div className="flex-1 min-w-0">
                    {password.isFeatured && (
                      <span className="absolute top-2 right-2 text-yellow-400 text-lg animate-pulse-glow">★</span>
                    )}
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">{password.title}</h2>
                    <p className="text-gray-500 text-xs truncate">{password.username}</p>
                    <p className="text-gray-700 dark:text-gray-200 line-clamp-2 min-h-[1.5rem]">{password.description}</p>
                    {visiblePasswords[password.id] && password.password && (
                      <div className="mt-1 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded p-1 text-xs select-all">
                        {password.password}
                      </div>
                    )}
                  </div>
                  {/* Sağ: Butonlar */}
                  <div className="flex flex-col items-end gap-1 sm:gap-2 min-w-[90px] sm:min-w-[120px]">
                    {/* Gör/Gizle ve Kopyala yan yana */}
                    <div className="flex flex-row gap-1 sm:gap-2 w-full">
                      {visiblePasswords[password.id] ? (
                        <button
                          onClick={() => {
                            setVisiblePasswords((prev) => {
                              const newVisible = { ...prev };
                              delete newVisible[password.id];
                              return newVisible;
                            });
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-1 sm:px-2 py-0.5 rounded transition text-xs w-full"
                        >
                          Gizle
                        </button>
                      ) : (
                        <button
                          onClick={() => sendVerificationCode(password.id, "view")}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-1 sm:px-2 py-0.5 rounded transition text-xs w-full"
                        >
                          Gör
                        </button>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(password.password || "");
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-1 sm:px-2 py-0.5 rounded transition text-xs w-full"
                      >
                        Kopyala
                      </button>
                    </div>
                    {/* Güncelle ve Sil yan yana */}
                    <div className="flex flex-row gap-1 sm:gap-2 w-full">
                      <button
                        onClick={() => {
                          setUpdatePasswordData(password);
                          setShowUpdateModal(true);
                          setUpdateStep("request");
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-1 sm:px-2 py-0.5 rounded transition text-xs w-full"
                      >
                        Güncelle
                      </button>
                      <button
                        onClick={() => handleDeletePassword(password.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-1 sm:px-2 py-0.5 rounded transition text-xs w-full"
                      >
                        Sil
                      </button>
                    </div>
                    {/* Öne çıkar/kaldır butonu */}
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("accessToken");
                          if (!token) {
                            navigate("/login");
                            return;
                          }
                          const newIsFeatured = !password.isFeatured;
                          const response = await axios.put(
                            `http://localhost:8080/api/user/passwords/${password.id}/toggle-featured`,
                            { isFeatured: newIsFeatured },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          const updatedPasswordFromServer = {
                            ...response.data,
                            isFeatured: response.data.featured,
                          };
                          setPasswords((prev) =>
                            prev.map((p) =>
                              p.id === updatedPasswordFromServer.id ? updatedPasswordFromServer : p
                            )
                          );
                          setFilteredPasswords((prev) =>
                            prev.map((p) =>
                              p.id === updatedPasswordFromServer.id ? updatedPasswordFromServer : p
                            )
                          );
                        } catch (err: any) {
                          setError(err.response?.data?.message || "Öne çıkarma işlemi başarısız.");
                        }
                      }}
                      className={`px-1 sm:px-2 py-0.5 rounded transition text-white text-xs font-semibold w-full ${
                        password.isFeatured ? "bg-yellow-400 hover:bg-yellow-500" : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      {password.isFeatured ? "Kaldır" : "Öne Çıkar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Şifre bulunamadı.</p>
          )}

          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md">
                <h2 className="text-xl font-bold mb-4">Yeni Şifre Ekle</h2>
                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                    <ul className="list-disc list-inside">
                      {errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <select
                  value={newPassword.categoryId}
                  onChange={(e) => setNewPassword({ ...newPassword, categoryId: e.target.value })}
                  className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    errors.some((err) => err.includes("Kategori")) ? "border-red-500" : "border-gray-300"
                  }`}
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
                  className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    errors.some((err) => err.includes("Başlık")) ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                  className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    errors.some((err) => err.includes("Kullanıcı adı")) ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                  className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    errors.some((err) => err.includes("Şifre")) ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <textarea
                  placeholder="Açıklama"
                  value={newPassword.description}
                  onChange={(e) => setNewPassword({ ...newPassword, description: e.target.value })}
                  className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    errors.some((err) => err.includes("Açıklama")) ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setErrors([]);
                    }}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
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
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md">
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
                {/* Şifre değiştirme adımları */}
                {updateStep === "request" && (
                  <button
                    onClick={() => sendVerificationCode(updatePasswordData.id, "update")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full mb-4"
                  >
                    Şifre Değiştirmek İçin Kod Gönder
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
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full mb-4"
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
                  </>
                )}
                {/* Genel Kaydet Butonu */}
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
                  <button
                    onClick={handleUpdatePassword}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {showVerifyModal && (
           <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md">
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