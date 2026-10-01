import React from "react";
import { Link } from "react-router-dom";

const categoryColors = {
  Education: "bg-blue-100 text-blue-700",
  Health: "bg-red-100 text-red-700",
  Environment: "bg-green-100 text-green-700",
  "Food & Nutrition": "bg-orange-100 text-orange-700",
  "Disaster Relief": "bg-yellow-100 text-yellow-700",
  "Animal Welfare": "bg-pink-100 text-pink-700",
  "Community Development": "bg-purple-100 text-purple-700",
  "Children & Youth": "bg-indigo-100 text-indigo-700",
  "Women Empowerment": "bg-fuchsia-100 text-fuchsia-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function CharityCard({ charity }) {
  const colorClass = categoryColors[charity.category] || "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
          {charity.logoUrl ? (
            <img src={charity.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            "🏢"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base truncate">{charity.name}</h3>
            {charity.verificationStatus === "verified" && (
              <span className="badge-verified">
                ✓ Verified
              </span>
            )}
            {charity.verificationStatus === "pending" && (
              <span className="badge-pending">⏳ Pending</span>
            )}
          </div>
          <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {charity.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{charity.description}</p>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
        <div>
          <span className="block font-semibold text-gray-800 text-sm">
            {charity.totalDonations?.toFixed(3) || "0.000"} ETH
          </span>
          Total Raised
        </div>
        <div>
          <span className="block font-semibold text-gray-800 text-sm">
            {charity.totalDonors || 0}
          </span>
          Donors
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Link
          to={`/charities/${charity._id}`}
          className="flex-1 text-center btn-secondary text-sm py-2"
        >
          View Details
        </Link>
        {charity.verificationStatus === "verified" ? (
          <Link
            to={`/charities/${charity._id}`}
            className="flex-1 text-center btn-primary text-sm py-2"
          >
            Donate
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 text-center bg-gray-100 text-gray-400 text-sm py-2 rounded-lg cursor-not-allowed"
            title="Only verified charities can receive donations"
          >
            Not Verified
          </button>
        )}
      </div>
    </div>
  );
}
