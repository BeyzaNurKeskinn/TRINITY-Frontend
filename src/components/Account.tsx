import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

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
}

const Account: React.FC<AccountProps> = ({ user, updateProfilePicture }) => {
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
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

      const response = await axios.post("http://localhost:8080/api/user/upload-profile-picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.profilePicture) {
        updateProfilePicture(response.data.profilePicture);
      }

      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Profil resmi yükleme hatası:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "Profil resmi yüklenirken bir hata oluştu.");
    }
  };

  const handleFreezeAccount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
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
      console.error("Hesap dondurma hatası:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "Hesap dondurulurken bir hata oluştu.");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Hesabım</h1>

          <div className="flex items-center mb-6 relative">
            <div className="relative">
              <img
                src={
                  user.profilePicture
                    ? `data:image/jpeg;base64,${user.profilePicture}`
                    : "https://via.placeholder.com/150"
                }
                alt="Profil resmi"
                className="w-32 h-32 rounded-full object-cover border-4 border-white ring-4 ring-indigo-600 shadow-lg"
              />
              {!user.profilePicture && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">Profil Resmi</span>
                </div>
              )}
              <label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700"
              >
                +
              </label>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Kullanıcı Bilgileri</h2>
            <p>
              <strong>Kullanıcı Adı:</strong> {user.username}
            </p>
            <p>
              <strong>E-posta:</strong> {user.email || "-"}
            </p>
            <p>
              <strong>Telefon:</strong> {user.phone || "-"}
            </p>
            <p>
              <strong>Rol:</strong> {user.role || "-"}
            </p>
            <p>
              <strong>Durum:</strong> {user.status || "-"}
            </p>
          </div>

          <button
            onClick={() => setShowFreezeModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Hesabı Dondur
          </button>

          {showUploadModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Profil Resmini Yükle</h2>
                <p>Seçtiğiniz resmi yüklemek istediğinize emin misiniz?</p>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUploadPicture}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Yükle
                  </button>
                </div>
              </div>
            </div>
          )}

          {showFreezeModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Hesabı Dondur</h2>
                <p>
                  Hesabınızı dondurmak istediğinize emin misiniz? Hesabınız 30 gün boyunca pasif kalacak ve
                  sonrasında tamamen silinecek.
                </p>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => setShowFreezeModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleFreezeAccount}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Dondur
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

export default Account;