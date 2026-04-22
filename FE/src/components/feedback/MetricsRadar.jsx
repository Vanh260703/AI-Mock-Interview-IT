import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

const MetricsRadar = ({ metrics }) => {
  if (!metrics) return null;

  const data = [
    { metric: 'Rõ ràng',    score: (metrics.clarity ?? 0) * 10 },
    { metric: 'Liên quan',  score: (metrics.relevance ?? 0) * 10 },
    { metric: 'Kỹ thuật',   score: (metrics.technicalAccuracy ?? 0) * 10 },
    { metric: 'Giao tiếp',  score: (metrics.communication ?? 0) * 10 },
    { metric: 'Tự tin',     score: (metrics.confidence ?? 0) * 10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip formatter={(val) => [`${val}%`]} />
        <Radar
          dataKey="score" name="Điểm"
          fill="#7c3aed" fillOpacity={0.2}
          stroke="#7c3aed" strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default MetricsRadar;
