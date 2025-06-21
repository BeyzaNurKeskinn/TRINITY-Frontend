import React, { useState, type FormEvent } from "react";
import { forgotPassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import passwordBg from '../assets/password-bg.jpg';

const ForgotPassword: React.FC = () => {
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInput = () => {
    const newErrors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = input.includes("@");
    if (isEmail && !emailRegex.test(input)) {
      newErrors.push("Geçerli bir e-posta adresi girin.");
    } else if (!isEmail && (input.length < 10 || input.length > 15)) {
      newErrors.push("Telefon numarası 10-15 karakter olmalı.");
    }
    if (!input) {
      newErrors.push("E-posta veya telefon numarası gerekli.");
    }
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess([]);
    setLoading(true);

    const clientErrors = validateInput();
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword(input);
      setSuccess([response || "Şifre sıfırlama kodu gönderildi."]);
      setTimeout(() => navigate("/reset-password"), 3000);
    } catch (err: any) {
      console.error("Hata detayları:", err.message, err);
      if (err.message === "Ağ hatası: Sunucuya bağlanılamadı.") {
        setErrors(["Daha sonra tekrar deneyiniz."]);
      } else if (err.message.includes(";")) {
        setErrors(err.message.split(";"));
      } else {
        setErrors([err.message || "Şifre sıfırlama kodu gönderilemedi."]);
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

      <div className="w-full max-w-[90%] sm:max-w-lg md:max-w-xl relative z-20 px-4 md:px-8 md:mr-32">
        {/* Logo ve başlık */}
        <div className="text-center mb-8 sm:mb-6 md:mb-12">
          <div className="inline-block p-4 sm:p-6 md:p-6 rounded-2xl bg-black/40 backdrop-blur-md mb-4 sm:mb-6 md:mb-6 border border-white/10">
            <div className="relative">
              <span className="text-4xl sm:text-3xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 animate-gradient-x">
                TRINITY
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-white/20 to-red-500/20 blur-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-2xl md:text-3xl font-bold mb-6 text-gray-300 animate-fade-in">Şifremi Unuttum</h1>
          <p className="text-sm sm:text-xs md:text-base text-gray-300">Şifre sıfırlama kodu alın</p>
        </div>

        {/* Form container */}
        <div className="relative group">
          {/* Animasyonlu border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-black via-red-900 to-black rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient"></div>
          
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-4 md:p-8 shadow-2xl border border-white/20 animate-fade-in">
            {errors.length > 0 && (
              <div className="flex justify-between items-center bg-red-100 border border-red-400 text-red-700 px-3 sm:px-2 py-1 sm:py-1 md:px-4 md:py-2 rounded mb-4 animate-fade-in text-base sm:text-sm md:text-base">
                <ul className="list-disc list-inside">
                  {errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
                <button onClick={() => setErrors([])} className="text-red-700 hover:text-red-900">
                  <svg className="h-4 w-4 sm:h-3 sm:w-3 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {success.length > 0 && (
              <div className="flex justify-between items-center bg-green-100 border border-green-400 text-green-700 px-3 sm:px-2 py-1 sm:py-1 md:px-4 md:py-2 rounded mb-4 animate-fade-in text-base sm:text-sm md:text-base">
                <ul className="list-disc list-inside">
                  {success.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
                <button onClick={() => setSuccess([])} className="text-green-700 hover:text-green-900">
                  <svg className="h-4 w-4 sm:h-3 sm:w-3 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-3 md:space-y-6">
              <div>
                <div className="relative">
                  <input
                    type={input.includes("@") ? "email" : "tel"}
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full pl-10 sm:pl-8 md:pl-12 pr-4 py-3 sm:py-2 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 text-base sm:text-sm md:text-base"
                    placeholder="E-posta veya telefon numarası"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-2 md:pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-3 sm:w-3 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 sm:py-2 md:py-4 bg-gradient-to-r from-black to-red-900 text-white rounded-xl font-semibold hover:from-red-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900 transform transition-all duration-300 hover:scale-[1.02] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                } text-base sm:text-sm md:text-base`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-3 sm:w-3 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yükleniyor...
                  </div>
                ) : (
                  "Şifre Sıfırlama Kodu Gönder"
                )}
              </button>
            </form>

            <div className="mt-6 sm:mt-4 md:mt-8 space-y-3 sm:space-y-2 md:space-y-4 text-center text-sm sm:text-xs md:text-base">
              <a href="/login" className="block text-gray-300 hover:text-white transition-colors duration-200">
                Giriş sayfasına dön
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;