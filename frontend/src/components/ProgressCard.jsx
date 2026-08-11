import { BarChart3 } from "lucide-react";

export default function ProgressCard({ title, progress = 0, subtitle = "" }) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <span className="text-sm font-bold text-blue-600">{clamped}%</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {subtitle && <p className="text-gray-400 text-xs mt-2">{subtitle}</p>}
    </div>
  );
}
