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
  const [error, setError] = useState<string | null>(null);
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
      setError(error.response ? error.response.data.message : "Kategoriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [navigate]);

  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:8080/api/admin/categories",
        {
          name: newCategory.name,
          description: newCategory.description,
          status: newCategory.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAddModal(false);
      setNewCategory({ name: "", description: "", status: "ACTIVE" });
      fetchCategories();
    } catch (error: any) {
      console.error("Kategori ekleme hatası:", error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data.message : "Kategori eklenirken bir hata oluştu.");
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:8080/api/admin/categories/${selectedCategory.id}`,
        {
          name: selectedCategory.name,
          description: selectedCategory.description,
          status: selectedCategory.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowUpdateModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      console.error("Kategori güncelleme hatası:", error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data.message : "Kategori güncellenirken bir hata oluştu.");
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
      setError(error.response ? error.response.data.message : "Kategori silinirken bir hata oluştu.");
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
            <h1 className="text-3xl font-bold text-gray-800">Kategori Yönetimi</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Kategori Ekle
            </button>
          </div>

          {/* Ekle Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Yeni Kategori</h2>
                <input
                  type="text"
                  placeholder="Kategori Başlığı"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <textarea
                  placeholder="Açıklama"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <div className="mb-4">
                  <p className="text-gray-600">Logo:</p>
                  {newCategory.name ? getIconForCategory(newCategory.name) : <p>Logo atanacak...</p>}
                </div>
                <select
                  value={newCategory.status}
                  onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
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
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Kategoriyi Güncelle</h2>
                <input
                  type="text"
                  placeholder="Kategori Başlığı"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <textarea
                  placeholder="Açıklama"
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                />
                <div className="mb-4">
                  <p className="text-gray-600">Otomatik Logo:</p>
                  {selectedCategory.name ? getIconForCategory(selectedCategory.name) : <p>Logo atanacak...</p>}
                </div>
                <select
                  value={selectedCategory.status}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, status: e.target.value })}
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Kategori Tablosu */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">ID</th>
                  <th className="p-3">Başlık</th>
                  <th className="p-3">Açıklama</th>
                  <th className="p-3">Logo</th>
                  <th className="p-3">Statü</th>
                  <th className="p-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b">
                    <td className="p-3">{category.id}</td>
                    <td className="p-3">{category.name}</td>
                    <td className="p-3">{category.description}</td>
                    <td className="p-3">{getIconForCategory(category.name)}</td>
                    <td className="p-3">{category.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowUpdateModal(true);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Güncelle
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;