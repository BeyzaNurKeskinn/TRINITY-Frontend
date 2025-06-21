import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { UserIcon, EnvelopeIcon, PhoneIcon,  MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

interface UserForm {
  username: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
}

interface UserManagementProps {
  user: {
    username: string;
    profilePicture: string | null;
  };
}

const UserManagement: React.FC<UserManagementProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeactivateConfirmModal, setShowDeactivateConfirmModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<number | null>(null);
  const [newUser, setNewUser] = useState<UserForm>({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatePassword, setUpdatePassword] = useState<string>("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error: any) {
      console.error("Kullanıcılar çekme hatası:", error.response ? error.response.data : error.message);
      setErrors(["Kullanıcılar yüklenirken bir hata oluştu. Lütfen tekrar deneyin."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const handleAddUser = async () => {
    setErrors([]);
    const newErrors: string[] = [];

    if (!newUser.username.trim()) {
      newErrors.push("Kullanıcı adı boş olamaz.");
    } else if (newUser.username.length < 3 || newUser.username.length > 50) {
      newErrors.push("Kullanıcı adı 3 ile 50 karakter arasında olmalıdır.");
    }
    if (!newUser.email.trim()) {
      newErrors.push("E-posta boş olamaz.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.push("Geçerli bir e-posta adresi girin.");
    }
    if (!newUser.phone.trim()) {
      newErrors.push("Telefon numarası boş olamaz.");
    } else if (!/^\+?\d{10,15}$/.test(newUser.phone)) {
      newErrors.push("Geçerli bir telefon numarası girin (10-15 rakam).");
    }
    if (!newUser.password) {
      newErrors.push("Şifre boş olamaz.");
    } else if (newUser.password.length < 6) {
      newErrors.push("Şifre en az 6 karakter olmalıdır.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:8080/api/admin/users",
        {
          username: newUser.username.trim(),
          email: newUser.email.trim(),
          phone: newUser.phone.trim(),
          password: newUser.password,
          role: newUser.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      setNewUser({ username: "", email: "", phone: "", password: "", role: "USER" });
      setErrors([]);
      setSuccessMessage("Kullanıcı başarıyla eklendi!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUsers();
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "Kullanıcı eklenirken bir hata oluştu.";
      if (backendMessage.includes("Kullanıcı adı zaten mevcut")) {
        newErrors.push("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
      } else if (backendMessage.includes("E-posta zaten mevcut")) {
        newErrors.push("Bu e-posta adresi zaten kayıtlı. Lütfen başka bir e-posta kullanın.");
      } else {
        newErrors.push(backendMessage);
      }
      setErrors(newErrors);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setErrors([]);
    const newErrors: string[] = [];

    if (!selectedUser.username.trim()) {
      newErrors.push("Kullanıcı adı boş olamaz.");
    } else if (selectedUser.username.length < 3 || selectedUser.username.length > 50) {
      newErrors.push("Kullanıcı adı 3 ile 50 karakter arasında olmalıdır.");
    }
    if (!selectedUser.email.trim()) {
      newErrors.push("E-posta boş olamaz.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedUser.email)) {
      newErrors.push("Geçerli bir e-posta adresi girin.");
    }
    if (!selectedUser.phone.trim()) {
      newErrors.push("Telefon numarası boş olamaz.");
    } else if (!/^\+?\d{10,15}$/.test(selectedUser.phone)) {
      newErrors.push("Geçerli bir telefon numarası girin (10-15 rakam).");
    }
    if (updatePassword && updatePassword.length < 6) {
      newErrors.push("Yeni şifre en az 6 karakter olmalıdır.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:8080/api/admin/users/${selectedUser.id}`,
        {
          username: selectedUser.username.trim(),
          email: selectedUser.email.trim(),
          phone: selectedUser.phone.trim(),
          password: updatePassword || undefined,
          status: selectedUser.status,
          role: selectedUser.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowUpdateModal(false);
      setSelectedUser(null);
      setUpdatePassword("");
      setSuccessMessage("Kullanıcı başarıyla güncellendi!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUsers();
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "Kullanıcı güncellenirken bir hata oluştu.";
      if (backendMessage.includes("Kullanıcı adı zaten mevcut")) {
        newErrors.push("Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
      } else if (backendMessage.includes("E-posta zaten mevcut")) {
        newErrors.push("Bu e-posta adresi zaten kayıtlı. Lütfen başka bir e-posta kullanın.");
      } else {
        newErrors.push(backendMessage);
      }
      setErrors(newErrors);
    }
  };

  const handleDeactivateUser = async () => {
    if (!userToDeactivate) return;

    const user = users.find((u) => u.id === userToDeactivate);
    if (!user) {
      setErrors(["Kullanıcı bulunamadı."]);
      setShowDeactivateConfirmModal(false);
      setUserToDeactivate(null);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:8080/api/admin/users/${userToDeactivate}`,
        {
          username: user.username,
          email: user.email,
          phone: user.phone,
          password: undefined,
          status: "INACTIVE",
          role: user.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDeactivateConfirmModal(false);
      setUserToDeactivate(null);
      setSuccessMessage("Kullanıcı başarıyla pasif edildi!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchUsers();
    } catch (error: any) {
      console.error("Kullanıcı pasif etme hatası:", error.response ? error.response.data : error.message);
      const backendMessage = error.response?.data?.message || "Kullanıcı pasif edilirken bir hata oluştu.";
      let errorMessage = backendMessage;
      if (backendMessage.includes("Kullanıcı bulunamadı")) {
        errorMessage = "Pasif etmek istediğiniz kullanıcı bulunamadı.";
      } else if (backendMessage.includes("Durum ACTIVE veya INACTIVE olmalı")) {
        errorMessage = "Geçersiz durum değeri. Lütfen tekrar deneyin.";
      }
      setErrors([errorMessage]);
      setShowDeactivateConfirmModal(false);
      setUserToDeactivate(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }
return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 w-screen min-w-full overflow-x-hidden box-border text-gray-800 font-sans">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1 pt-2">
        <Sidebar />
        <main className="ml-14 sm:ml-12 md:ml-64 p-2 sm:p-4 md:p-6 w-full max-w-full box-border mt-3 sm:mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 animate-fade-in">
              Kullanıcı Yönetimi
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Kullanıcı ara..."
                  className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-700 text-sm sm:text-base shadow-sm"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm sm:text-base min-h-[40px] w-full sm:w-auto"
              >
                Yeni Kullanıcı Ekle
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-3 animate-fade-in text-sm sm:text-base">
              {successMessage}
            </div>
          )}

          {errors.length > 0 && !showAddModal && !showUpdateModal && !showDeactivateConfirmModal && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3 animate-fade-in text-sm sm:text-base">
              <ul className="list-disc list-inside">
                {errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Modal kodlarında da padding ve maxWidth'ler küçültüldü */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-2">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-indigo-700">Yeni Kullanıcı</h2>
                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 animate-fade-in text-sm">
                    <ul className="list-disc list-inside">
                      {errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${
                    errors.some((err) => err.includes("Kullanıcı adı")) ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                <input
                  type="email"
                  placeholder="E-posta"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${
                    errors.some((err) => err.includes("E-posta")) ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${
                    errors.some((err) => err.includes("Telefon")) ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={newUser.password || ""}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${
                    errors.some((err) => err.includes("Şifre")) ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2 mb-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                >
                  <option value="USER">Kullanıcı</option>
                  <option value="ADMIN">Yönetici</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setErrors([]);
                    }}
                    className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {showUpdateModal && selectedUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-2">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-indigo-700">Kullanıcıyı Güncelle</h2>
                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 animate-fade-in text-sm">
                    <ul className="list-disc list-inside">
                      {errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${
                    errors.some((err) => err.includes("Kullanıcı adı")) ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                <input
                  type="email"
                  placeholder="E-posta"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${
                    errors.some((err) => err.includes("E-posta")) ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={selectedUser.phone}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-sm ${
                    errors.some((err) => err.includes("Telefon")) ? "border-red-500" : "border-gray-200"
                  }`}
                  required
                />
                <input
                  type="password"
                  placeholder="Yeni Şifre (boş bırakılabilir)"
                  value={updatePassword}
                  onChange={(e) => setUpdatePassword(e.target.value)}
                  className={`w-full p-2 mb-3 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm ${
                    errors.some((err) => err.includes("Şifre")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                  className="w-full p-2 mb-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full p-2 mb-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                >
                  <option value="USER">Kullanıcı</option>
                  <option value="ADMIN">Yönetici</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdatePassword("");
                      setErrors([]);
                    }}
                    className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeactivateConfirmModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-2">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-indigo-700">Kullanıcıyı Pasif Et</h2>
                <p className="mb-4 text-gray-700 text-sm">
                  <strong>{users.find((u) => u.id === userToDeactivate)?.username}</strong> kullanıcısını pasif etmek istediğinizden emin misiniz? Kullanıcı artık sisteme giriş yapamayacak.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeactivateConfirmModal(false);
                      setUserToDeactivate(null);
                    }}
                    className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeactivateUser}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Pasif Et
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Responsive grid: mobilde 1, md'de 2, lg'de 3 sütun */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users
              .filter(
                (u) =>
                  u.username.toLowerCase().includes(search.toLowerCase()) ||
                  u.email.toLowerCase().includes(search.toLowerCase()) ||
                  (u.phone && u.phone.toLowerCase().includes(search.toLowerCase()))
              )
              .map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col px-4 py-3 gap-2 w-full hover:shadow-lg transition-all duration-200 animate-fade-in"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-base font-semibold text-gray-900 truncate">{u.username}</span>
                      <span className="flex items-center text-gray-600 text-xs truncate">
                        <EnvelopeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </span>
                      <span className="flex items-center text-gray-600 text-xs truncate">
                        <PhoneIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                        {u.phone || "-"}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setUpdatePassword("");
                        setShowUpdateModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      title="Düzenle"
                    >
                      Düzenle
                    </button>
                    {u.status === "ACTIVE" && (
                      <button
                        onClick={() => {
                          setUserToDeactivate(u.id);
                          setShowDeactivateConfirmModal(true);
                        }}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                        title="Pasif Et"
                      >
                        Pasif Et
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};
export default UserManagement;