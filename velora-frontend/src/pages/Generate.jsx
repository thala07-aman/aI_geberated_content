import { useState } from "react";

export default function Generate() {
  const [form, setForm] = useState({
    productName: "",
    features: "",
    audience: "",
    brandVoice: ""
  });

  const [customVoice, setCustomVoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput(null);

    const token = localStorage.getItem("token");

    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      alert("Session expired. Please login again.");
      window.location.href = "/login";
      return;
    }

    const data = await response.json();
    setOutput(data);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2">
          AI Copy Generator
        </h2>
        <p className="text-slate-400">
          Generate premium, high-converting fashion copy instantly.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm text-slate-400">Product Name</label>
            <input
              name="productName"
              onChange={handleChange}
              className="mt-1 w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Features</label>
            <textarea
              name="features"
              rows={3}
              onChange={handleChange}
              className="mt-1 w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Target Audience</label>
            <input
              name="audience"
              onChange={handleChange}
              className="mt-1 w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Brand Voice</label>
            <select
              name="brandVoice"
              onChange={(e) => {
                handleChange(e);
                if (e.target.value !== "Other") {
                  setCustomVoice("");
                }
              }}
              className="mt-1 w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              <option value="">Select Brand Voice</option>
              <option value="Minimal Luxury">Minimal Luxury</option>
              <option value="Bold Streetwear">Bold Streetwear</option>
              <option value="Feminine Elegant">Feminine Elegant</option>
              <option value="Modern Techwear">Modern Techwear</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {form.brandVoice === "Other" && (
            <input
              type="text"
              placeholder="Describe your custom brand voice..."
              value={customVoice}
              onChange={(e) => {
                setCustomVoice(e.target.value);
                setForm({
                  ...form,
                  brandVoice: e.target.value
                });
              }}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          )}

          <button
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 shadow-lg shadow-indigo-600/20"
          >
            {loading ? "Generating..." : "Generate Copy"}
          </button>

        </form>
      </div>

      {/* Output Section */}
      {output && (
        <div className="mt-12 space-y-6 animate-fadeIn">

          {/* Product Description */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-indigo-400 text-sm uppercase tracking-wider">
                Product Description
              </h3>
              <button
                onClick={() => copyToClipboard(output.product_description)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Copy
              </button>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-wrap text-slate-200">
              {output.product_description}
            </div>
          </div>

          {/* Ads */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-indigo-400 text-sm uppercase tracking-wider">
                Ad Variations
              </h3>
              <button
                onClick={() => copyToClipboard(output.ads?.join("\n\n"))}
                className="text-xs text-slate-400 hover:text-white"
              >
                Copy
              </button>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-wrap text-slate-200">
              {output.ads?.join("\n\n")}
            </div>
          </div>

          {/* Email */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-indigo-400 text-sm uppercase tracking-wider">
                Email Campaign
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    `Subject: ${output.email_subject}\n\n${output.email_body}`
                  )
                }
                className="text-xs text-slate-400 hover:text-white"
              >
                Copy
              </button>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-wrap text-slate-200">
              <strong>Subject:</strong> {output.email_subject}
              {"\n\n"}
              {output.email_body}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}