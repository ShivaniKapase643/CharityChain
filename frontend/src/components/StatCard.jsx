import React from "react";

export default function StatCard({ label, value, icon, color = "primary", subtitle }) {
  const colorMap = {
    primary: "bg-primary-50 text-primary-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    teal: "bg-teal-50 text-teal-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-2xl p-2 rounded-lg ${colorMap[color]}`}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-0.5">{label}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}
