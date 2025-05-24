import React, { useState, type FormEvent } from "react";
import { login, getUserInfo } from "../services/api";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(formData);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Kullanıcı bilgilerini al
      const userInfo = await getUserInfo(response.accessToken);
      const role = userInfo.role;

      // Role göre yönlendirme
      if (role === "ROLE_ADMIN") {
        navigate("/admin-dashboard");
      } else if (role === "ROLE_USER") {
        navigate("/user-dashboard");
      } else {
        setError("Bilinmeyen kullanıcı rolü");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Kullanıcı adınızı girin"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Şifrenizi girin"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Yükleniyor..." : "Giriş Yap"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Henüz hesabınız yok mu?{" "}
          <a href="/register" className="text-indigo-600 hover:underline">
            Kayıt Ol
          </a>
        </p>
         <p className="mt-4 text-center text-sm text-gray-600">
          Şifreni Mi Unuttun?{" "}
          <a href="/forgot-password" className="text-indigo-600 hover:underline">
            Şifremi Unuttum
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;