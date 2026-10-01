import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

const CATEGORIES = [
  "Education", "Health", "Environment", "Food & Nutrition",
  "Disaster Relief", "Animal Welfare", "Community Development",
  "Children & Youth", "Women Empowerment", "Other",
];

export default function CharityRegisterPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=account, 2=charity details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [account, setAccount] = useState({ name: "", email: "", password: "" });
  const [charity, setCharity] = useState({
    name: "", description: "", email: "", phone: "",
    city: "", country: "", category: "", website: "",
    walletAddress: "", documentType: "NGO Registration Certificate",
  });

  const handleAccountChange = (e) => setAccount({ ...account, [e.target.name]: e.target.value });
  const handleCharityChange = (e) => setCharity({ ...charity, [e.target.name]: e.target.value });

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (account.password.length < 6) { setError("Password must be 6+ characters"); return; }
    setError("");

    if (!user) {
      // Register user first
      setLoading(true);
      try {
        const res = await api.post("/auth/register", {
          name: account.name,
          email: account.email,
          password: account.password,
          role: "charity",
        });
        login(res.data.token, res.data.user);
        setStep(2);
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(2);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!charity.walletAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
      setError("Invalid Ethereum wallet address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/charities", {
        ...charity,
        address: { city: charity.city, country: charity.country },
      });
      toast.success("Charity application submitted! Pending admin review.");
      navigate("/charity/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-4xl">🏢</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Register Your Charity</h1>
        <p className="text-gray-500 mt-1">Submit an application for admin review and verification</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-8">
        {["Create Account", "Charity Details"].map((s, i) => (
          <div key={i} className={`flex-1 text-center text-sm font-medium py-2 rounded-lg ${step === i + 1 ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
      )}

      {/* Step 1 */}
      {step === 1 && !user && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Create Charity Account</h2>
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
              <input type="text" name="name" value={account.name} onChange={handleAccountChange} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={account.email} onChange={handleAccountChange} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={account.password} onChange={handleAccountChange} required className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating..." : "Continue →"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Login</Link>
          </p>
        </div>
      )}

      {/* Already logged in or step 2 */}
      {(step === 2 || (step === 1 && user && user.role === "charity")) && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Charity Details</h2>
          <form onSubmit={handleStep2} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
              <input type="text" name="name" value={charity.name} onChange={handleCharityChange} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={charity.description} onChange={handleCharityChange} required rows={4} className="input resize-none" placeholder="Describe your organization's mission and activities..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                <input type="email" name="email" value={charity.email} onChange={handleCharityChange} required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" name="phone" value={charity.phone} onChange={handleCharityChange} className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" value={charity.city} onChange={handleCharityChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" name="country" value={charity.country} onChange={handleCharityChange} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={charity.category} onChange={handleCharityChange} required className="input">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="url" name="website" value={charity.website} onChange={handleCharityChange} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ethereum Wallet Address *</label>
              <input type="text" name="walletAddress" value={charity.walletAddress} onChange={handleCharityChange} required className="input font-mono" placeholder="0x..." />
              <p className="text-xs text-gray-400 mt-1">This wallet will receive donations directly from the smart contract.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <input type="text" name="documentType" value={charity.documentType} onChange={handleCharityChange} className="input" placeholder="e.g., NGO Registration Certificate" />
              <p className="text-xs text-gray-400 mt-1">Mention what document you'll provide to the admin. (Academic demo — no actual upload)</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              ⚠️ Your application will be reviewed by the admin. You can only receive donations after verification.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
