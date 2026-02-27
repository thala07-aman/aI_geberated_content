import { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    if (response.status !== 200) {
      alert(data.detail || "Registration failed");
      return;
    }

    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="flex justify-center items-center h-[70vh]">
        <div className="bg-slate-900 p-10 rounded-xl w-96">
          <h2 className="text-xl font-semibold mb-6 text-center">Register</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
              required
            />

            <button
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}