import React, { useState, type FormEvent } from "react";
import { resetPassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import passwordBg from '../assets/password-bg.jpg';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    if (formData.newPassword.length < 8) {
      newErrors.push("Yeni şifre en az 8 karakter olmalı.");
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push("Şifreler eşleşmiyor.");
    }
    if (!formData.token) {
      newErrors.push("Sıfırlama kodu gerekli.");
    }
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess([]);
    setLoading(true);

    const clientErrors = validateForm();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(formData.token, formData.newPassword);
      setSuccess([response || "Şifre başarıyla sıfırlandı."]);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      console.error("Hata detayları:", err.message, err);
      if (err.message === "Ağ hatası: Sunucuya bağlanılamadı.") {
        setErrors(["Daha sonra tekrar deneyiniz."]);
      } else if (err.message.includes(";")) {
        setErrors(err.message.split(";"));
      } else {
        setErrors([err.message || "Şifre sıfırlama işlemi başarısız oldu."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:justify-end relative overflow-hidden">
      {/* Arka plan görseli */}
      <div className="absolute inset-0 w-full h-full">
        <img src={passwordBg} alt="Password BG" className="w-full h-full object-cover filter-none brightness-100 contrast-100" />
      </div>

      {/* Responsive padding ve margin ayarları */}
      <div className="w-full max-w-xl relative z-20 px-4 sm:px-6 md:px-8 md:mr-32 md:max-w-xl mx-auto">
        {/* Logo ve başlık */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 rounded-2xl bg-black/40 backdrop-blur-md mb-6 border border-white/10">
            <div className="relative">
              <span className="text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 animate-gradient-x">
                TRINITY
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-white/20 to-red-500/20 blur-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-300 animate-fade-in">Şifreyi Sıfırla</h1>
          <p className="text-gray-300">Yeni şifrenizi belirleyin</p>
        </div>

        {/* Form container */}
        <div className="relative group">
          {/* Animasyonlu border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-black via-red-900 to-black rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient"></div>
          
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/20 animate-fade-in">
            {errors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 animate-fade-in">
                <ul className="list-disc list-inside">
                  {errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            {success.length > 0 && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 animate-fade-in">
                <ul className="list-disc list-inside">
                  {success.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    id="token"
                    name="token"
                    value={formData.token}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all duration-300 text-base"
                    placeholder="Sıfırlama kodu"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all duration-300 text-base"
                    placeholder="Yeni şifre"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all duration-300 text-base"
                    placeholder="Yeni şifre tekrar"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-gradient-to-r from-black to-red-900 text-white rounded-xl font-semibold hover:from-red-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900 transform transition-all duration-300 hover:scale-[1.02] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yükleniyor...
                  </div>
                ) : (
                  "Şifreyi Sıfırla"
                )}
              </button>
            </form>

            <div className="mt-8 space-y-4 text-center">
              <a href="/login" className="block text-gray-300 hover:text-white transition-colors duration-200">
                Giriş sayfasına dön
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* 
        Responsive düzenler:
        - md:justify-end ve md:mr-32 sadece masaüstünde, küçük ekranlarda mx-auto ile ortalanır.
        - px-8 -> px-4 sm:px-6 md:px-8
        - p-8 -> p-4 sm:p-8
        - text-xl, text-3xl -> text-2xl sm:text-3xl
        - text-5xl -> text-4xl sm:text-5xl
        - max-w-xl -> md:max-w-xl w-full
      */}
    </div>
  );
};

export default ResetPassword;