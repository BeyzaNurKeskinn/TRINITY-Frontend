import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

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
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newUser, setNewUser] = useState<UserForm>({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatePassword, setUpdatePassword] = useState<string>("");
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
      setError(error.response?.data?.message || "Kullanıcılar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:8080/api/admin/users",
        {
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          role: newUser.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      setNewUser({ username: "", email: "", phone: "", password: "", role: "USER" });
      fetchUsers();
    } catch (error: any) {
      console.error("Kullanıcı ekleme hatası:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Kullanıcı eklenirken bir hata oluştu.");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:8080/api/admin/users/${selectedUser.id}`,
        {
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone,
          password: updatePassword || undefined,
          status: selectedUser.status,
          role: selectedUser.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowUpdateModal(false);
      setSelectedUser(null);
      setUpdatePassword("");
      fetchUsers();
    } catch (error: any) {
      console.error("Kullanıcı güncelleme hatası:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Kullanıcı güncellenirken bir hata oluştu.");
    }
  };

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
          onClick={() => {
            setError(null);
            fetchUsers();
          }}
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
        <div className="ml-64 p-6 w-full mt-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Yeni Kullanıcı Ekle
            </button>
          </div>

          {/* Ekle Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Yeni Kullanıcı</h2>
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="E-posta"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={newUser.password || ""}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="USER">Kullanıcı</option>
                  <option value="ADMIN">Yönetici</option>
                </select>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Güncelle Modal */}
          {showUpdateModal && selectedUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Kullanıcıyı Güncelle</h2>
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="E-posta"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={selectedUser.phone}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Yeni Şifre (boş bırakılabilir)"
                  value={updatePassword}
                  onChange={(e) => setUpdatePassword(e.target.value)}
                  className="w-full p-2 mb-4 border rounded"
                />
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="USER">Kullanıcı</option>
                  <option value="ADMIN">Yönetici</option>
                </select>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdatePassword("");
                    }}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Kullanıcı Tablosu */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">Kullanıcı Adı</th>
                  <th className="p-3">E-posta</th>
                  <th className="p-3">Telefon</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone || "-"}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setUpdatePassword("");
                          setShowUpdateModal(true);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Güncelle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;