import { Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">

        <div>
          <h1 className="text-xl font-bold mb-10 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Velora AI
          </h1>

          <nav className="space-y-4 text-slate-400">
            <button
              onClick={() => navigate("/dashboard")}
              className="block w-full text-left hover:text-white"
            >
              Generate
            </button>

            <button
              onClick={() => navigate("/dashboard/history")}
              className="block w-full text-left hover:text-white"
            >
              History
            </button>

            <button
              onClick={() => navigate("/dashboard/settings")}
              className="block w-full text-left hover:text-white"
            >
              Settings
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <Outlet />
      </div>
    </div>
  );
}