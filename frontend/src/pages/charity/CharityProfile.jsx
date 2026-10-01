import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function CharityProfile() {
  const toast = useToast();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get("/charities/my/dashboard")
      .then((r) => {
        setCharity(r.data.charity);
        setForm({ description: r.data.charity.description, website: r.data.charity.website || "", phone: r.data.charity.phone || "" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await api.put(`/charities/${charity._id}`, form);
      setCharity({ ...charity, ...form });
      setEditing(false);
      toast.success("Profile updated");
    } catch { toast.error("Update failed"); }
  };

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>;
  if (!charity) return <div className="text-gray-500 text-center py-20">No charity found.</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Charity Profile</h1>
        <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="text-xs text-gray-400">Organization Name</label>
          <p className="font-semibold text-gray-900">{charity.name}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400">Category</label>
          <p className="text-gray-700">{charity.category}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Description</label>
          {editing ? (
            <textarea rows={4} className="input resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          ) : (
            <p className="text-sm text-gray-700">{charity.description}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Website</label>
          {editing ? (
            <input type="url" className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          ) : (
            <p className="text-sm text-gray-700">{charity.website || "—"}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Phone</label>
          {editing ? (
            <input type="text" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          ) : (
            <p className="text-sm text-gray-700">{charity.phone || "—"}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-400">Wallet Address</label>
          <p className="font-mono text-sm text-gray-700">{charity.walletAddress}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400">Status</label>
          <p className={`font-semibold ${charity.verificationStatus === "verified" ? "text-green-600" : charity.verificationStatus === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
            {charity.verificationStatus}
          </p>
        </div>
        {editing && (
          <button onClick={handleSave} className="btn-primary w-full">Save Changes</button>
        )}
      </div>
    </div>
  );
}
