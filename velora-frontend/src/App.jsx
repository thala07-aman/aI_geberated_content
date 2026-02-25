import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({
    productName: "",
    features: "",
    audience: ""
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput(null);

    console.log("Sending to backend:", form);

    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    setOutput(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Velora AI
        </h1>
        <p className="text-slate-400 mt-4">
          AI Conversion Copy Engine for Shopify Fashion Brands
        </p>
      </div>

      {/* App Card */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="productName"
              placeholder="Product Name"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none"
              required
            />

            <textarea
              name="features"
              placeholder="Product Features"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none"
              required
            />

            <input
              name="audience"
              placeholder="Target Audience"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none"
              required
            />

            <button
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold"
            >
              Generate High-Converting Copy
            </button>

          </form>

          {loading && (
            <p className="text-center mt-6 text-slate-400">
              Generating premium copy...
            </p>
          )}
        </div>

        {output && output.product_description && (
          <div className="mt-10 bg-slate-900 p-8 rounded-2xl shadow-2xl space-y-6">

            <div>
              <h2 className="font-semibold text-lg mb-2">Product Description</h2>
              <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-wrap">
                {output.product_description}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2">Ad Variations</h2>
              <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-wrap">
                {output.ads?.join("\n\n")}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2">Email Campaign</h2>
              <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-wrap">
                Subject: {output.email_subject}
                {"\n\n"}
                {output.email_body}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}