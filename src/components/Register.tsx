import React, { useState, type FormEvent, Component } from "react";
import { register } from "../services/api";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <p className="text-red-500 text-center">Bir hata oluştu. Lütfen tekrar deneyin.</p>;
    }
    return this.props.children;
  }
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    general: "",
  });
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
    const newErrors = {
      username: "",
      password: "",
      email: "",
      phone: "",
      general: "",
    };

    // Username validation (3-20 characters)
    if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = "Kullanıcı adı 3-20 karakter arasında olmalı";
      isValid = false;
    }

    // Password validation (at least 8 characters)
    if (formData.password.length < 8) {
      newErrors.password = "Şifre en az 8 karakter olmalı";
      isValid = false;
    }

    // Email validation (regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
      isValid = false;
    }

    // Phone validation (at least 10 digits after cleaning)
    if (formData.phone.replace(/[^0-9]/g, "").length < 10) {
      newErrors.phone = "Geçerli bir telefon numarası girin";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setErrors((prev) => ({ ...prev, general: "" }));
    setLoading(true);

    if (!validateForm()) {
      toast.error("Lütfen formdaki hataları düzeltin", { position: "top-right" });
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        ...formData,
        phone: formData.phone.replace(/[^0-9]/g, ""), // Send only digits to backend
      });
      setSuccess(response);
      toast.success(response, { position: "top-right" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Kayıt başarısız";
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Kayıt Ol</h2>
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Kullanıcı adınızı girin"
                required
                aria-label="Kullanıcı adı"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
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
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Şifrenizi girin"
                required
                aria-label="Şifre"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              {formData.password && (
                <p
                  className={`text-sm mt-1 ${
                    getPasswordStrength(formData.password) === "Zayıf"
                      ? "text-red-500"
                      : getPasswordStrength(formData.password) === "Orta"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  Şifre Gücü: {getPasswordStrength(formData.password)}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="E-posta adresinizi girin"
                required
                aria-label="E-posta"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <IMaskInput
                mask="+90 000 000 00 00"
                id="phone"
                name="phone"
                value={formData.phone}
                onAccept={(value: string) => {
                  setFormData((prev) => ({ ...prev, phone: value }));
                  validateForm();
                }}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="+90 555 555 55 55"
                required
                aria-label="Telefon numarası"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
              {loading ? "Yükleniyor..." : "Kayıt Ol"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{" "}
            <a href="/login" className="text-indigo-600 hover:underline">
              Giriş Yap
            </a>
          </p>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ErrorBoundary>
  );
};

export default Register;