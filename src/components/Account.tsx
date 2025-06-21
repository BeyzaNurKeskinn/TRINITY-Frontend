import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CameraIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface UserInfo {
  id?: number;
  username: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  profilePicture: string | null;
}

interface AccountProps {
  user: {
    id?: number;
    username: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
    profilePicture: string | null;
  };
  updateProfilePicture: (base64String: string) => void;
  updateUser: (userData: Partial<UserInfo>) => void;
}

const Account: React.FC<AccountProps> = ({ user, updateProfilePicture, updateUser }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editUser, setEditUser] = useState({
    username: user.username,
    email: user.email || "",
    phone: user.phone || "",
    password: "",
  });
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowUploadModal(true);
    }
  };

 const handleUploadPicture = async () => {
    if (!selectedFile) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        "http://localhost:8080/api/user/upload-profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.profilePicture) {
        updateProfilePicture(response.data.profilePicture);
        updateUser({ profilePicture: response.data.profilePicture });
      }
      setShowUploadModal(false);
      setSelectedFile(null);
      window.location.reload();
    } catch (err: any) {
      console.error("Profil resmi yükleme hatası:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setErrors([err.response?.data?.message || "Profil resmi yüklenirken bir hata oluştu."]);
    }
  };

  const handleEditUser = async () => {
    setErrors([]);
    const newErrors: string[] = [];

    // İstemci tarafı doğrulaması
    if (!editUser.username.trim()) {
      newErrors.push("Kullanıcı adı boş olamaz.");
    } else if (editUser.username.length < 3 || editUser.username.length > 20) {
      newErrors.push("Kullanıcı adı 3 ile 20 karakter arasında olmalıdır.");
    }
    if (!editUser.email.trim()) {
      newErrors.push("E-posta boş olamaz.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
      newErrors.push("Geçerli bir e-posta adresi girin.");
    }
    if (!editUser.phone.trim()) {
      newErrors.push("Telefon numarası boş olamaz.");
    } else if (!/^\+?\d{10,15}$/.test(editUser.phone)) {
      newErrors.push("Geçerli bir telefon numarası girin (10-15 rakam).");
    }
    if (editUser.password && editUser.password.length < 8) {
      newErrors.push("Yeni şifre en az 8 karakter olmalıdır.");
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

      // Gönderilen veriyi loglayarak kontrol edelim
      const requestBody = {
        username: editUser.username.trim(),
        email: editUser.email.trim(),
        phone: editUser.phone.trim(),
        password: editUser.password || undefined,
        status: user.status || "ACTIVE", // Mevcut durumu koru
        role: user.role || "USER", // Mevcut rolü koru
      };
      console.log("Gönderilen veri:", requestBody);

      const response = await axios.put(
        "http://localhost:8080/api/user/update",
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Backend yanıtı:", response.data);

      updateUser({
        username: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
        status: response.data.status,
        role: response.data.role,
      });
      setShowEditModal(false);
      setSuccessMessage("Bilgiler başarıyla güncellendi!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Bilgi güncelleme hatası:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      const backendMessage = err.response?.data?.message || "Bilgiler güncellenirken bir hata oluştu.";
      if (err.response?.status === 400) {
        if (backendMessage.includes("Kullanıcı adı zaten mevcut")) {
          newErrors.push("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
        } else if (backendMessage.includes("E-posta zaten mevcut")) {
          newErrors.push("Bu e-posta adresi zaten kayıtlı. Lütfen başka bir e-posta kullanın.");
        } else if (backendMessage.includes("Geçerli bir e-posta giriniz")) {
          newErrors.push("Geçerli bir e-posta adresi girin.");
        } else if (backendMessage.includes("Telefon numarası")) {
          newErrors.push("Telefon numarası 10-15 karakter olmalı.");
        } else if (backendMessage.includes("Şifre")) {
          newErrors.push("Şifre en az 8 karakter olmalı.");
        } else {
          newErrors.push(backendMessage);
        }
      } else if (err.response?.status === 401) {
        newErrors.push("Yetkisiz işlem. Lütfen tekrar giriş yapın.");
        navigate("/login");
      } else if (err.response?.status === 404) {
        newErrors.push("Kullanıcı bulunamadı.");
      } else if (err.response?.status === 500) {
        newErrors.push("Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.");
      } else {
        newErrors.push(backendMessage);
      }
      setErrors(newErrors);
    }
  };

  const handleFreezeAccount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErrors(["Oturumunuz sona ermiş. Lütfen tekrar giriş yapın."]);
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:8080/api/user/freeze-account",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowFreezeModal(false);
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (err: any) {
      console.error("Hesap dondurma hatası:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setErrors([err.response?.data?.message || "Hesap dondurulurken bir hata oluştu."]);
    }
  };

  if (errors.length > 0 && !showEditModal && !showUploadModal && !showFreezeModal) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 items-center justify-center text-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-500 max-w-md animate-fade-in">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <ul className="text-red-600 font-semibold text-lg mb-4 list-disc list-inside">
            {errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
          <button
            onClick={() => setErrors([])}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-green-600 transition-all duration-300"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 w-screen min-w-full overflow-x-hidden box-border text-gray-800 font-sans">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1 pt-3">
        <Sidebar />
        <main className="ml-14 sm:ml-8 md:ml-64 p-3 sm:p-4 md:p-8 w-full box-border">
          <div className="max-w-full sm:max-w-full md:max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500 mb-6 sm:mb-8 md:mb-8 animate-fade-in">
              Hesabım
            </h1>

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 rounded mb-4 animate-fade-in">
                {successMessage}
              </div>
            )}

            {/* Profil Resmi Kartı */}
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 shadow-lg mb-6 sm:mb-8 md:mb-8 transform hover:scale-105 transition-transform duration-300 animate-fade-in">
              <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-4">Profil Resmi</h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                <div className="relative">
                  <img
                    src={
                      user.profilePicture
                        ? `data:image/jpeg;base64,${user.profilePicture}`
                        : "https://via.placeholder.com/150?text=Resim+Yok"
                    }
                    alt="Profil resmi"
                    className="w-20 sm:w-24 md:w-28 h-20 sm:h-24 md:h-28 rounded-full object-cover border-4 border-gradient-to-r from-red-500 to-green-500 shadow-lg"
                  />
                  {!user.profilePicture && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-green-500 bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm md:text-sm font-semibold">Resim Ekle</span>
                    </div>
                  )}
                  <label
                    htmlFor="profile-picture-upload"
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-red-500 to-green-500 text-white p-2 sm:p-2.5 md:p-2.5 rounded-full cursor-pointer hover:from-red-600 hover:to-green-600 transition-all duration-200 shadow-md"
                  >
                    <CameraIcon className="w-4 sm:w-5 md:w-5 h-4 sm:h-5 md:h-5" />
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <p className="text-gray-700 font-medium text-sm sm:text-base md:text-base">Profilini kişiselleştir!</p>
                  <p className="text-xs sm:text-sm md:text-sm text-gray-500">Maksimum dosya boyutu: 5MB</p>
                </div>
              </div>
            </div>

            {/* Kullanıcı Bilgileri Kartı */}
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 shadow-lg mb-6 sm:mb-8 md:mb-8 transform hover:scale-105 transition-transform duration-300 animate-fade-in">
              <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-6">Kullanıcı Bilgileri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 md:gap-6">
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-4 p-3 sm:p-4 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <UserIcon className="w-6 sm:w-8 md:w-8 h-6 sm:h-8 md:h-8 text-green-500" />
                  <div>
                    <p className="text-xs sm:text-sm md:text-sm font-medium text-gray-500">Kullanıcı Adı</p>
                    <p className="text-base sm:text-lg md:text-lg font-semibold text-gray-900 truncate">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-4 p-3 sm:p-4 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <EnvelopeIcon className="w-6 sm:w-8 md:w-8 h-6 sm:h-8 md:h-8 text-red-500" />
                  <div>
                    <p className="text-xs sm:text-sm md:text-sm font-medium text-gray-500">E-posta</p>
                    <p className="text-base sm:text-lg md:text-lg font-semibold text-gray-900 truncate">{user.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-4 p-3 sm:p-4 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <PhoneIcon className="w-6 sm:w-8 md:w-8 h-6 sm:h-8 md:h-8 text-green-500" />
                  <div>
                    <p className="text-xs sm:text-sm md:text-sm font-medium text-gray-500">Telefon</p>
                    <p className="text-base sm:text-lg md:text-lg font-semibold text-gray-900 truncate">{user.phone || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-4 p-3 sm:p-4 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <ShieldCheckIcon className="w-6 sm:w-8 md:w-8 h-6 sm:h-8 md:h-8 text-green-500" />
                  <div>
                    <p className="text-xs sm:text-sm md:text-sm font-medium text-gray-500">Durum</p>
                    <p className="text-base sm:text-lg md:text-lg font-semibold text-gray-900 truncate">{user.status || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 md:gap-4 mt-4 sm:mt-6 md:mt-6">
                <button
                  onClick={() => {
                    setEditUser({
                      username: user.username,
                      email: user.email || "",
                      phone: user.phone || "",
                      password: "",
                    });
                    setShowEditModal(true);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-green-600 transition-all duration-300"
                >
                  Bilgileri Düzenle
                </button>
                <button
                  onClick={() => setShowFreezeModal(true)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-green-600 transition-all duration-300"
                >
                  Hesabı Dondur
                </button>
              </div>
            </div>

            {/* Profil Resmi Yükleme Modalı */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-white p-6 sm:p-8 md:p-8 rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-md md:max-w-md transform transition-all duration-300 animate-fade-in">
                  <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-4">Profil Resmini Yükle</h2>
                  <p className="text-gray-600 text-sm sm:text-base md:text-base mb-4 sm:mb-6 md:mb-6">Seçtiğiniz resmi yüklemek istediğinize emin misiniz?</p>
                  <div className="flex justify-end gap-3 sm:gap-4 md:gap-4">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setSelectedFile(null);
                      }}
                      className="px-4 sm:px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleUploadPicture}
                      className="px-4 sm:px-5 py-2 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg hover:from-red-600 hover:to-green-600 transition-all duration-300"
                    >
                      Yükle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Kullanıcı Bilgisi Düzenleme Modalı */}
            {showEditModal && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-white p-6 sm:p-8 md:p-8 rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-md md:max-w-md transform transition-all duration-300 animate-fade-in">
                  <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-6">Bilgileri Düzenle</h2>
                  {errors.length > 0 && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 rounded mb-4 animate-fade-in">
                      <ul className="list-disc list-inside text-xs sm:text-sm md:text-sm">
                        {errors.map((err, index) => (
                          <li key={index}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={editUser.username}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    className={`w-full p-2 sm:p-3 md:p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm sm:text-base md:text-base ${
                      errors.some((err) => err.includes("Kullanıcı adı")) ? "border-red-500" : "border-gray-200"
                    }`}
                    required
                  />
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className={`w-full p-2 sm:p-3 md:p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm sm:text-base md:text-base ${
                      errors.some((err) => err.includes("E-posta")) ? "border-red-500" : "border-gray-200"
                    }`}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Telefon"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    className={`w-full p-2 sm:p-3 md:p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm sm:text-base md:text-base ${
                      errors.some((err) => err.includes("Telefon")) ? "border-red-500" : "border-gray-200"
                    }`}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Yeni Şifre (boş bırakılabilir)"
                    value={editUser.password}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                    className={`w-full p-2 sm:p-3 md:p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm sm:text-base md:text-base ${
                      errors.some((err) => err.includes("Şifre")) ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  <div className="flex justify-end gap-3 sm:gap-4 md:gap-4">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setErrors([]);
                      }}
                      className="px-4 sm:px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleEditUser}
                      className="px-4 sm:px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hesap Dondurma Modalı */}
            {showFreezeModal && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-white p-6 sm:p-8 md:p-8 rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-md md:max-w-md transform transition-all duration-300 animate-fade-in">
                  <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-4">Hesabı Dondur</h2>
                  <p className="text-gray-600 text-sm sm:text-base md:text-base mb-4 sm:mb-6 md:mb-6">
                    Hesabınızı dondurmak istediğinize emin misiniz? Hesabınız 30 gün boyunca pasif kalacak ve sonrasında tamamen silinecek.
                  </p>
                  <div className="flex justify-end gap-3 sm:gap-4 md:gap-4">
                    <button
                      onClick={() => setShowFreezeModal(false)}
                      className="px-4 sm:px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleFreezeAccount}
                      className="px-4 sm:px-5 py-2 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg hover:from-red-600 hover:to-green-600 transition-all duration-300"
                    >
                      Dondur
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Account;