import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { FaUniversity, FaEnvelope, FaUsers, FaFolder } from "react-icons/fa";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    const iconClass = "text-indigo-600 w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7";
    if (name.includes("banka")) return <FaUniversity className={iconClass} />;
    if (name.includes("posta") || name.includes("email") || name.includes("e-posta"))
      return <FaEnvelope className={iconClass} />;
    if (name.includes("sosyal") || name.includes("medya")) return <FaUsers className={iconClass} />;
    return <FaFolder className={iconClass} />;
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
    if (!newCategory.name.trim()) newErrors.push("Kategori adı boş olamaz.");
    else if (newCategory.name.length < 3 || newCategory.name.length > 100)
      newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
    if (newCategory.description.length > 500) newErrors.push("Açıklama 500 karakterden uzun olamaz.");
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
      setSuccessMessage("Kategori başarıyla eklendi!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchCategories();
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "Kategori eklenirken bir hata oluştu.";
      if (backendMessage.includes("Kategori adı 3-100 karakter olmalı"))
        newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
      else if (backendMessage.includes("Kategori adı zaten mevcut"))
        newErrors.push("Bu kategori adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
      else newErrors.push(backendMessage);
      setErrors(newErrors);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    setErrors([]);
    const newErrors: string[] = [];
    if (!selectedCategory.name.trim()) newErrors.push("Kategori adı boş olamaz.");
    else if (selectedCategory.name.length < 3 || selectedCategory.name.length > 100)
      newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
    if (selectedCategory.description.length > 500) newErrors.push("Açıklama 500 karakterden uzun olamaz.");
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
      setSuccessMessage("Kategori başarıyla güncellendi!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchCategories();
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || "Kategori güncellenirken bir hata oluştu.";
      if (backendMessage.includes("Kategori adı 3-100 karakter olmalı"))
        newErrors.push("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
      else if (backendMessage.includes("Kategori adı zaten mevcut"))
        newErrors.push("Bu kategori adı zaten kullanılıyor. Lütfen başka bir ad seçin.");
      else newErrors.push(backendMessage);
      setErrors(newErrors);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.delete(`http://localhost:8080/api/admin/categories/${categoryToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteConfirmModal(false);
      setCategoryToDelete(null);
      setSuccessMessage("Kategori başarıyla silindi!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchCategories();
    } catch (error: any) {
      console.error("Kategori silme hatası:", error.response ? error.response.data : error.message);
      const backendMessage = error.response?.data?.message || "Kategori silinirken bir hata oluştu.";
      setErrors([backendMessage]);
      setShowDeleteConfirmModal(false);
      setCategoryToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 w-screen min-w-full overflow-x-hidden box-border text-gray-800 font-sans">
      <Navbar username={user.username} profilePicture={user.profilePicture} />
      <div className="flex flex-1 pt-2">
        <Sidebar />
        <main className="ml-12 sm:ml-12 md:ml-64 p-2 sm:p-3 md:p-4 w-full max-w-full sm:max-w-[calc(100vw-3rem)] md:max-w-full box-border mt-2 sm:mt-3 md:mt-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 md:mb-5 gap-1 sm:gap-2 md:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-0 md:mb-0 text-gray-900 animate-fade-in">
              Kategori Yönetimi
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-56 md:w-64">
                <MagnifyingGlassIcon className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-gray-400 absolute left-1 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Kategori ara..."
                  className="pl-5 sm:pl-8 md:pl-10 pr-1.5 sm:pr-3 md:pr-4 py-0.5 sm:py-1 md:py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none bg-white text-gray-700 text-xs sm:text-sm md:text-base shadow-sm transition-colors"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
              >
                + Kategori Ekle
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 rounded mb-3 sm:mb-4 md:mb-5 animate-fade-in text-xs sm:text-sm md:text-base">
              {successMessage}
            </div>
          )}

          {errors.length > 0 && !showAddModal && !showUpdateModal && !showDeleteConfirmModal && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 rounded mb-3 sm:mb-4 md:mb-5 animate-fade-in">
              <ul className="list-disc list-inside text-xs sm:text-sm md:text-base">
                {errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl shadow-2xl w-full max-w-[85vw] sm:max-w-sm md:max-w-md">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 md:mb-5 text-indigo-700">Yeni Kategori</h2>
                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 rounded mb-2 sm:mb-4 md:mb-5 animate-fade-in">
                    <ul className="list-disc list-inside text-xs sm:text-sm md:text-base">
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
                  className={`w-full p-1 sm:p-1.5 md:p-2 mb-2 sm:mb-3 md:mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm md:text-base ${
                    errors.some((err) => err.includes("Kategori adı")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <textarea
                  placeholder="Açıklama"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className={`w-full p-1 sm:p-1.5 md:p-2 mb-2 sm:mb-3 md:mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm md:text-base ${
                    errors.some((err) => err.includes("Açıklama")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <div className="mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  <span className="text-gray-600 text-xs sm:text-sm md:text-base">Logo:</span>
                  {newCategory.name ? getIconForCategory(newCategory.name) : <span className="text-gray-400 text-xs sm:text-sm md:text-base">Logo atanacak...</span>}
                </div>
                <select
                  value={newCategory.status}
                  onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                  className="w-full p-1 sm:p-1.5 md:p-2 mb-2 sm:mb-4 md:mb-5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm md:text-base"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <div className="flex justify-end gap-1 sm:gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setErrors([]);
                    }}
                    className="bg-gray-200 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="bg-indigo-600 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {showUpdateModal && selectedCategory && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl shadow-2xl w-full max-w-[85vw] sm:max-w-sm md:max-w-md">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 md:mb-5 text-indigo-700">Kategoriyi Güncelle</h2>
                {errors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 rounded mb-2 sm:mb-4 md:mb-5 animate-fade-in">
                    <ul className="list-disc list-inside text-xs sm:text-sm md:text-base">
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
                  className={`w-full p-1 sm:p-1.5 md:p-2 mb-2 sm:mb-3 md:mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm md:text-base ${
                    errors.some((err) => err.includes("Kategori adı")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <textarea
                  placeholder="Açıklama"
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  className={`w-full p-1 sm:p-1.5 md:p-2 mb-2 sm:mb-3 md:mb-4 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm md:text-base ${
                    errors.some((err) => err.includes("Açıklama")) ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <div className="mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  <span className="text-gray-600 text-xs sm:text-sm md:text-base">Logo:</span>
                  {selectedCategory.name ? getIconForCategory(selectedCategory.name) : <span className="text-gray-400 text-xs sm:text-sm md:text-base">Logo atanacak...</span>}
                </div>
                <select
                  value={selectedCategory.status}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, status: e.target.value })}
                  className="w-full p-1 sm:p-1.5 md:p-2 mb-2 sm:mb-4 md:mb-5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm md:text-base"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <div className="flex justify-end gap-1 sm:gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setErrors([]);
                    }}
                    className="bg-gray-200 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    className="bg-indigo-600 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirmModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl shadow-2xl w-full max-w-[85vw] sm:max-w-sm md:max-w-md">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 md:mb-5 text-indigo-700">Kategoriyi Sil</h2>
                <p className="mb-2 sm:mb-4 md:mb-5 text-gray-700 text-xs sm:text-sm md:text-base">
                  <strong>{categories.find((c) => c.id === categoryToDelete)?.name}</strong> kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </p>
                <div className="flex justify-end gap-1 sm:gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirmModal(false);
                      setCategoryToDelete(null);
                    }}
                    className="bg-gray-200 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    className="bg-red-600 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-1.5 sm:p-2 md:p-3 animate-fade-in">
            <div className="flex px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 font-semibold text-gray-500 text-xs sm:text-sm md:text-base uppercase tracking-wider">
              <div className="w-8 sm:w-10 md:w-12 flex-shrink-0" />
              <div className="flex-1">Başlık</div>
              <div className="flex-1 hidden sm:flex">Açıklama</div>
              <div className="w-16 sm:w-20 md:w-24 text-center">Statü</div>
              <div className="w-24 sm:w-28 md:w-36 text-center">İşlemler</div>
            </div>
            {categories
              .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
              .map((category) => (
                <div key={category.id} className="flex items-center px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 hover:bg-gray-50 transition group relative">
                  <div className="w-8 sm:w-10 md:w-12 flex-shrink-0 flex items-center justify-center">
                    {getIconForCategory(category.name)}
                  </div>
                  <div className="flex-1 text-gray-900 font-medium text-xs sm:text-sm md:text-base truncate">{category.name}</div>
                  <div className="flex-1 text-gray-600 text-xs sm:text-xs md:text-sm line-clamp-1 sm:line-clamp-2 hidden sm:flex">{category.description || "-"}</div>
                  <div className="w-16 sm:w-20 md:w-24 text-center">
                    <span
                      className={`px-1 sm:px-1.5 md:px-3 py-0.25 sm:py-0.5 md:py-1 rounded-full text-xs font-medium ${
                        category.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {category.status === "ACTIVE" ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <div className="w-24 sm:w-28 md:w-36 flex justify-center gap-1 sm:gap-1.5 md:gap-2 flex-col sm:flex-row">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowUpdateModal(true);
                      }}
                      className="bg-blue-500 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-xs md:text-sm min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                    >
                      Güncelle
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToDelete(category.id);
                        setShowDeleteConfirmModal(true);
                      }}
                      className="bg-red-500 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-xs md:text-sm min-h-[32px] sm:min-h-[36px] md:min-h-[44px] w-full sm:w-auto"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryManagement;