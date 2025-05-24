import React, { useState, type FormEvent } from "react";
import { forgotPassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInput = () => {
    if (!emailOrPhone.trim()) {
      setError("E-posta veya telefon numarası zorunludur");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(emailOrPhone);
    const isPhone = emailOrPhone.replace(/[^0-9]/g, "").length >= 10;
    if (!isEmail && !isPhone) {
      setError("Geçerli bir e-posta veya telefon numarası girin");
      return false;
    }
    setError("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrPhone(e.target.value);
    validateInput();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError("");
    setLoading(true);

    if (!validateInput()) {
      toast.error("Lütfen geçerli bir e-posta veya telefon numarası girin", { position: "top-right" });
      setLoading(false);
      return;
    }

    try {
      console.log("Şifre sıfırlama isteği gönderiliyor: emailOrPhone=", emailOrPhone);
      const response = await forgotPassword(emailOrPhone);
      console.log("Şifre sıfırlama isteği başarılı:", response);
      setSuccess("Sıfırlama kodu e-postanıza gönderildi. Lütfen kodu girerek şifrenizi sıfırlayın.");
      toast.success("Sıfırlama kodu gönderildi! Şifre sıfırlama sayfasına yönlendiriliyorsunuz...", {
        position: "top-right",
      });
      setTimeout(() => navigate("/reset-password"), 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Şifre sıfırlama isteği başarısız";
      console.error("Şifre sıfırlama isteği hatası:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Şifremi Unuttum</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          E-posta adresinizi veya telefon numaranızı girin, şifre sıfırlama kodunu gönderelim.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
              E-posta veya Telefon
            </label>
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={emailOrPhone}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="E-posta veya telefon numaranızı girin"
              required
              aria-label="E-posta veya telefon numarası"
              autoComplete="email tel"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Yükleniyor..." : "Kodu Gönder"}
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

export default ForgotPassword;