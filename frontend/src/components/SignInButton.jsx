import React from "react";

export default function SignInButton({
  onClick,
  isAuthenticated = false,
  onLogout,
  onDashboard,
  userName
}) {
  if (isAuthenticated) {
    const nameLabel = userName ? `Hi, ${userName.split(" ")[0]}` : "Dashboard";
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onDashboard}
          className="
            flex items-center gap-2
            bg-white/80 text-gray-900 font-semibold
            px-4 py-1.5 rounded-lg
            transition-all duration-200
            hover:bg-white
            focus:outline-none focus:ring-2 focus:ring-gray-300
            active:scale-95
          "
        >
          {nameLabel}
        </button>
        <button
          onClick={onLogout}
          className="
            flex items-center gap-2
            bg-red-500 text-white font-semibold
            px-4 py-1.5 rounded-lg
            transition-all duration-200
            hover:bg-red-400
            focus:outline-none focus:ring-2 focus:ring-red-300
            active:scale-95
          "
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-2
        bg-white text-gray-900 font-semibold
        px-5 py-1.5 rounded-lg
        transition-all duration-200
        hover:bg-gray-200
        focus:outline-none focus:ring-2 focus:ring-gray-300
        active:scale-95
      "
    >
      <span>Sign In</span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 transform rotate-180"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12H3m0 0l4-4m-4 4l4 4m6 4h6a2 2 0 002-2V6a2 2 0 00-2-2h-6"
        />
      </svg>
    </button>
  );
}
