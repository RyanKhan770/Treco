export default function StatsCard({ label, value, icon, color = 'bg-primaryPale', textColor = 'text-primary' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}
