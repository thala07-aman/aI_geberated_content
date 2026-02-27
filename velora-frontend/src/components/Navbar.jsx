import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b border-slate-800 bg-slate-950 text-white">

      {/* Logo */}
      <Link
        to="/"
        className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
      >
        Velora AI
      </Link>

      {/* Links */}
      <div className="space-x-6 text-slate-400 font-medium">

        <Link to="/" className="hover:text-white transition">
          Home
        </Link>

        {token && (
          <Link to="/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
        )}

        {!token && (
          <>
            <Link to="/login" className="hover:text-white transition">
              Login
            </Link>
            <Link to="/register" className="hover:text-white transition">
              Register
            </Link>
          </>
        )}

        {token && (
          <button
            onClick={handleLogout}
            className="hover:text-red-400 transition"
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}