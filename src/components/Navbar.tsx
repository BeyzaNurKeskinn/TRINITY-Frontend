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
    <nav className="bg-gray-900 text-white shadow-[0_0_10px_rgba(255,0,0,0.5)] fixed w-full h-14 sm:h-16 md:h-18 top-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-8">
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
        <div className="relative">
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 animate-gradient-x">
            TRINITY
          </span>
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-white/20 to-red-500/20 blur-sm"></div>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
        <span className="text-xs sm:text-sm md:text-base font-mono text-white font-semibold drop-shadow-sm tracking-wide hidden sm:block md:block">
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
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)] transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-mono text-base sm:text-lg md:text-xl border-2 border-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)] transition-transform group-hover:scale-105">
              {initial}
            </div>
          )}
          <div className="absolute right-0 mt-2 w-40 sm:w-48 md:w-56 bg-gray-800 text-neon-blue rounded-lg shadow-[0_0_10px_rgba(0,183,235,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-50">
            <button
              onClick={() => navigate("/user/account")}
              className="block w-full text-left px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 hover:bg-gray-700 hover:text-red-500 transition-colors duration-200 rounded-t-lg font-mono text-xs sm:text-sm md:text-base"
            >
              Hesabım
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 hover:bg-gray-700 hover:text-red-500 transition-colors duration-200 rounded-b-lg font-mono text-xs sm:text-sm md:text-base"
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