import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto text-center py-24 px-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          AI Copy That Converts
        </h1>

        <p className="mt-6 text-slate-400 text-lg">
          Built specifically for Shopify fashion brands.
        </p>

        <Link
          to="/dashboard"
          className="inline-block mt-10 px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold"
        >
          Start Generating
        </Link>
      </div>
    </div>
  );
}