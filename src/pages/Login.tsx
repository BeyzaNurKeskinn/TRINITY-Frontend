import React, { useState } from "react";
import { login } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { useNavigate } from "react-router-dom"; // React Router için yönlendirme

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Yönlendirme için useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      console.log("Login success:", data);
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
       // Başarılı login sonrası ana sayfaya yönlendir
        navigate("/dashboard"); // /dashboard sayfasına yönlendir (veya /)
      }
   } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      console.log("Login error:", err); // Hata detaylarını logla
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google login success:", credentialResponse.credential);
    // Backend'e Google token'ı gönder
  };

  const handleFacebookSuccess = (response: any) => {
    console.log("Facebook login success:", response.accessToken);
    // Backend'e Facebook token'ı gönder
  };

  const handleFacebookFail = (error: any) => {
    console.log("Facebook login failed:", error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="Enter username"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
         <div className="mt-4 text-center">
          <a href="/register" className="text-blue-500 hover:underline">
            Hesabın Yok Mu? Üye Ol
          </a>
        </div>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </a>
        </div>
        <div className="mt-4 text-center">
          <p>Or login with:</p>
          <div className="flex flex-col items-center space-y-2 mt-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google login failed")}
              containerProps={{
                style: { width: "100%", borderRadius: "0.5rem", overflow: "hidden" },
              }}
            />
            <FacebookLogin
              appId="your-facebook-app-id" // Facebook App ID'nizi buraya ekleyin
              onSuccess={handleFacebookSuccess}
              onFail={handleFacebookFail}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  className="w-full bg-blue-700 text-white p-2 rounded hover:bg-blue-800"
                >
                  Login with Facebook
                </button>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;