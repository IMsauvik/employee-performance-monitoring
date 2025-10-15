const StatsCard = ({ title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
