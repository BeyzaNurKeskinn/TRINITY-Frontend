import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC<{ username: string; profilePicture: string | null }> = ({ username, profilePicture }) => {
  const initial = username.charAt(0).toUpperCase();
  const navigate = useNavigate();

  // Profil resmi prop'unun değişimini izle
  useEffect(() => {
    console.log("Navbar received profilePicture:", profilePicture);
  }, [profilePicture]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white shadow-[0_0_10px_rgba(255,0,0,0.5)] fixed w-full h-16 top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <span className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 animate-gradient-x">
            TRINITY
          </span>
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-white/20 to-red-500/20 blur-sm"></div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-mono text-white font-semibold drop-shadow-sm tracking-wide hidden sm:block">
          Hoş geldin, {username.charAt(0).toUpperCase() + username.slice(1)}!
        </span>
        <div className="relative group">
          {profilePicture ? (
            <img
              src={
                profilePicture.startsWith("data:image")
                  ? profilePicture
                  : `data:image/jpeg;base64,${profilePicture}`
              }
              alt="Profil resmi"
              className="w-10 h-10 rounded-full object-cover border-2 border-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)] transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-mono text-lg border-2 border-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)] transition-transform group-hover:scale-105">
              {initial}
            </div>
          )}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-neon-blue rounded-lg shadow-[0_0_10px_rgba(0,183,235,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-50">
            <button
              onClick={() => navigate("/user/account")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-red-500 transition-colors duration-200 rounded-t-lg font-mono"
            >
              Hesabım
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-red-500 transition-colors duration-200 rounded-b-lg font-mono"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;