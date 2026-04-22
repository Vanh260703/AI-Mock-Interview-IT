import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const ProgressChart = ({ data = [], days = 30 }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Chưa có dữ liệu trong {days} ngày qua
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: d.date?.slice(5), // MM-DD
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
          formatter={(val) => [`${val} điểm`]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone" dataKey="avgScore" name="Điểm TB"
          stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }}
        />
        <Line
          type="monotone" dataKey="bestScore" name="Điểm cao nhất"
          stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
