import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC<{ username: string; profilePicture: string | null }> = ({ username, profilePicture }) => {
  const initial = username.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white shadow-[0_0_10px_rgba(0,255,0,0.5)] fixed w-full h-16 top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <span className="text-3xl font-bold tracking-wider text-neon-green animate-glitch">TRINITY</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-mono text-neon-blue truncate max-w-xs hidden sm:block">
          Hoş geldiniz, {username}!
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
              className="w-10 h-10 rounded-full object-cover border-2 border-neon-green shadow-[0_0_8px_rgba(0,255,0,0.5)] transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-neon-green font-mono text-lg border-2 border-neon-green shadow-[0_0_8px_rgba(0,255,0,0.5)] transition-transform group-hover:scale-105">
              {initial}
            </div>
          )}
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-neon-blue rounded-lg shadow-[0_0_10px_rgba(0,183,235,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-50">
            <button
              onClick={() => navigate("/user/account")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-neon-green transition-colors duration-200 rounded-t-lg font-mono"
            >
              Hesabım
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-neon-green transition-colors duration-200 rounded-b-lg font-mono"
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