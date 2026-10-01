import React, { useEffect, useState } from "react";
import api from "../services/api";
import CharityCard from "../components/CharityCard";
import LoadingSpinner from "../components/LoadingSpinner";

const CATEGORIES = [
  "All", "Education", "Health", "Environment", "Food & Nutrition",
  "Disaster Relief", "Animal Welfare", "Community Development",
  "Children & Youth", "Women Empowerment", "Other",
];

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: "verified" });
      if (search) params.set("search", search);
      if (category !== "All") params.set("category", category);
      const res = await api.get(`/charities?${params}`);
      setCharities(res.data.charities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCharities();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Verified Charities</h1>
        <p className="text-gray-500 mt-2">
          All charities listed here have been reviewed and approved by the platform administrator.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
        </form>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mt-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                category === cat
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : charities.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900">No charities found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-6">{charities.length} verified charities</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((c) => (
              <CharityCard key={c._id} charity={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
