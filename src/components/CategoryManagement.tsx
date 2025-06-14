import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { FaUniversity, FaEnvelope, FaUsers, FaFolder } from "react-icons/fa";

interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface CategoryManagementProps {
  user: {
    username: string;
    profilePicture: string | null;
  };
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ user }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const navigate = useNavigate();

  // Kategori adına göre ikon eşleştirme
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("banka")) return <FaUniversity className="w-8 h-8 text-indigo-600" />;
    if (name.includes("posta") || name.includes("email") || name.includes("e-posta"))
      return <FaEnvelope className="w-8 h-8 text-indigo-600" />;
    if (name.includes("sosyal") || name.includes("medya")) return <FaUsers className="w-8 h-8 text-indigo-600" />;
    return <FaFolder className="w-8 h-8 text-indigo-600" />;
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:8080/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error: any) {
      console.error("Kategoriler çekme hatası:", error.response ? error.response.data : error.message);
      setErrors(["Kategoriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [navigate]);

  const handleAddCategory = async () => {
    setErrors([]);
    const newErrors: string[] = [];

    // İstemci tarafı doğrulama
    if (!newCategory.name.trim()) {
      newErrors.push("Kategori adı boş olamaz.");
    } else if (newCategory.name.length < 3 || newCategory.name.length > 100) {
      newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
    }
    if (newCategory.description.length > 500) {
      newErrors.push("Açıklama 500 karakterden uzun olamaz.");
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
        "http://localhost:8080/api/admin/categories",
        {
          name: newCategory.name.trim(),
          description: newCategory.description.trim(),
          status: newCategory.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      setNewCategory({ name: "", description: "", status: "ACTIVE" });
      setErrors([]);
      fetchCategories();
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "Kategori eklenirken bir hata oluştu.";
      if (backendMessage.includes("Kategori adı 3-100 karakter olmalı")) {
        newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
      } else if (backendMessage.includes("Kategori adı zaten mevcut")) {
        newErrors.push("Bu kategori adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
      } else {
        newErrors.push(backendMessage);
      }
      setErrors(newErrors);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    setErrors([]);
    const newErrors: string[] = [];

    if (!selectedCategory.name.trim()) {
      newErrors.push("Kategori adı boş olamaz.");
    } else if (selectedCategory.name.length < 3 || selectedCategory.name.length > 100) {
      newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
    }
    if (selectedCategory.description.length > 500) {
      newErrors.push("Açıklama 500 karakterden uzun olamaz.");
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
        `http://localhost:8080/api/admin/categories/${selectedCategory.id}`,
        {
          name: selectedCategory.name.trim(),
          description: selectedCategory.description.trim(),
          status: selectedCategory.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowUpdateModal(false);
      setSelectedCategory(null);
      setErrors([]);
      fetchCategories();
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "Kategori güncellenirken bir hata oluştu.";
      if (backendMessage.includes("Kategori adı 3-100 karakter olmalı")) {
        newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
      } else if (backendMessage.includes("Kategori adı zaten mevcut")) {
        newErrors.push("Bu kategori adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
      } else {
        newErrors.push(backendMessage);
      }
      setErrors(newErrors);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(`http://localhost:8080/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (error: any) {
      console.error("Kategori silme hatası:", error.response ? error.response.data : error.message);
      setErrors(["Kategori silinirken bir hata oluştu. Lütfen tekrar deneyin."]);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="ml-64 p-6 w-full mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 animate-fade-in">Kategori Yönetimi</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
            >
              + Kategori Ekle
            </button>
          </div>

          {/* Genel Hata Mesajları (örneğin, kategori listesi yüklenemediğinde) */}
          {errors.length > 0 && !showAddModal && !showUpdateModal && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 animate-fade-in">
              <ul className="list-disc list-inside">
                {errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ekle Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 max-w-full">
                <h2 className="text-2xl font-bold mb-6 text-indigo-700">Yeni Kategori</h2>
                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 animate-fade-in">
                    <ul className="list-disc list-inside">
                      {errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Kategori Başlığı"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className={`w-full p-3 mb-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none ${
                    errors.some((err) => err.includes("Kategori adı")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <textarea
                  placeholder="Açıklama"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className={`w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none ${
                    errors.some((err) => err.includes("Açıklama")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-gray-600">Logo:</span>
                  {newCategory.name ? getIconForCategory(newCategory.name) : <span className="text-gray-400">Logo atanacak...</span>}
                </div>
                <select
                  value={newCategory.status}
                  onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                  className="w-full p-3 mb-6 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setErrors([]);
                    }}
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Güncelle Modal */}
          {showUpdateModal && selectedCategory && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 max-w-full">
                <h2 className="text-2xl font-bold mb-6 text-indigo-700">Kategoriyi Güncelle</h2>
                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 animate-fade-in">
                    <ul className="list-disc list-inside">
                      {errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Kategori Başlığı"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  className={`w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none ${
                    errors.some((err) => err.includes("Kategori adı")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <textarea
                  placeholder="Açıklama"
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  className={`w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none ${
                    errors.some((err) => err.includes("Açıklama")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-gray-600">Logo:</span>
                  {selectedCategory.name ? getIconForCategory(selectedCategory.name) : <span className="text-gray-400">Logo atanacak...</span>}
                </div>
                <select
                  value={selectedCategory.status}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, status: e.target.value })}
                  className="w-full p-3 mb-6 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                >
               <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setErrors([]);
                    }}
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Kategori Çizgisel Liste */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <div className="flex px-6 py-3 font-semibold text-gray-500 text-sm uppercase tracking-wider">
              <div className="w-12 flex-shrink-0" />
              <div className="flex-1">Başlık</div>
              <div className="flex-1">Açıklama</div>
              <div className="w-24 text-center">Statü</div>
              <div className="w-36 text-center">İşlemler</div>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center px-6 py-4 hover:bg-gray-50 transition group relative">
                <div className="w-12 flex-shrink-0 flex items-center justify-center">
                  {getIconForCategory(category.name)}
                </div>
                <div className="flex-1 text-gray-900 font-medium">{category.name}</div>
                <div className="flex-1 text-gray-600 text-sm line-clamp-2">{category.description}</div>
                <div className="w-24 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
  category.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
}`}
                  >
                    {category.status === "ACTIVE" ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="w-36 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowUpdateModal(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    Güncelle
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;