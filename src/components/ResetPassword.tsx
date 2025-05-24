import React, { useState, type FormEvent } from "react";
import { resetPassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword: React.FC = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({ token: "", newPassword: "", general: "" });
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return "Zayıf";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 12) return "Güçlü";
    return "Orta";
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { token: "", newPassword: "", general: "" };

    if (!token.trim()) {
      newErrors.token = "Sıfırlama kodu zorunludur";
      isValid = false;
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = "Yeni şifre en az 8 karakter olmalı";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "token") setToken(value);
    if (name === "newPassword") setNewPassword(value);
    validateForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setErrors({ token: "", newPassword: "", general: "" });
    setLoading(true);

    if (!validateForm()) {
      toast.error("Lütfen formdaki hataları düzeltin", { position: "top-right" });
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(token, newPassword);
      setSuccess(response);
      toast.success(response, { position: "top-right" });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      const errorMessage = err.message || "Şifre sıfırlama başarısız";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Şifre Sıfırlama</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          E-postanıza gönderilen sıfırlama kodunu ve yeni şifrenizi girin.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Sıfırlama Kodu
            </label>
            <input
              type="text"
              id="token"
              name="token"
              value={token}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.token ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="Sıfırlama kodunuzu girin"
              required
              aria-label="Sıfırlama kodu"
            />
            {errors.token && <p className="text-red-500 text-sm mt-1">{errors.token}</p>}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Yeni Şifre
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="Yeni şifrenizi girin"
              required
              aria-label="Yeni şifre"
            />
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            {newPassword && (
              <p
                className={`text-sm mt-1 ${
                  getPasswordStrength(newPassword) === "Zayıf"
                    ? "text-red-500"
                    : getPasswordStrength(newPassword) === "Orta"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                Şifre Gücü: {getPasswordStrength(newPassword)}
              </p>
            )}
          </div>
          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Yükleniyor..." : "Şifreyi Sıfırla"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Geri dönmek ister misiniz?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Giriş Yap
          </a>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ResetPassword;