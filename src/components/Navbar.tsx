import React from "react";

const Navbar: React.FC<{ username: string; profilePicture: string | null }> = ({ username, profilePicture }) => {
  const initial = username.charAt(0).toUpperCase();

  console.log("Navbar'a gelen profilePicture:", profilePicture);

  return (
    <nav className="bg-indigo-600 text-white p-4 shadow-md fixed w-full h-16 top-0 z-30 flex items-center justify-between">
      <div className="text-xl font-bold">Trinity</div>
      <div className="flex items-center space-x-4 sm:space-x-2">
        <span className="text-sm sm:text-base truncate max-w-xs">Hoş geldiniz, {username}!</span>
        <div className="relative">
          {profilePicture ? (
            <img
              src={
                profilePicture.startsWith("data:image")
                  ? profilePicture
                  : `data:image/jpeg;base64,${profilePicture}`
              }
              alt="Profil resmi"
              className="w-8 h-8 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-sm border-2 border-white">
              {initial}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;