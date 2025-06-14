import React, { useState, type FormEvent } from "react";
import { forgotPassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import passwordBg from '../assets/password-bg.jpg';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setSuccess(response);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Şifre sıfırlama bağlantısı gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end relative overflow-hidden">
      {/* Arka plan görseli ve gradient overlay */}
      <div className="absolute inset-0 w-full h-full">
        <img src={passwordBg} alt="Password BG" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
      </div>

      <div className="w-full max-w-xl relative z-20 px-8 mr-32">
        {/* Logo ve başlık */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 rounded-2xl bg-black/40 backdrop-blur-md mb-6 border border-white/10">
            <div className="relative">
              <span className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 animate-gradient-x">
                TRINITY
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-white/20 to-red-500/20 blur-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-6 text-gray-900 animate-fade-in">Şifremi Unuttum</h1>
          <p className="text-gray-300">Şifre sıfırlama bağlantısı alın</p>
        </div>

        {/* Form container */}
        <div className="relative group">
          {/* Animasyonlu border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-black via-red-900 to-black rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient"></div>
          
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all duration-300"
                    placeholder="E-posta adresiniz"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl">
                  <p className="text-green-200 text-sm">{success}</p>
                </div>
              )}

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
                  "Şifre Sıfırlama Bağlantısı Gönder"
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
    </div>
  );
};

export default ForgotPassword;