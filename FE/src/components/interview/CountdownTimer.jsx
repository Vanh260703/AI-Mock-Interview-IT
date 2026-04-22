import { useCountdown } from '../../hooks/useCountdown.js';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ seconds, onExpire }) => {
  const { remaining, formatted } = useCountdown(seconds, onExpire);
  const isWarning = remaining <= 30 && remaining > 0;
  const isDanger  = remaining <= 10 && remaining > 0;

  return (
    <div className={`flex items-center gap-1.5 font-mono font-bold text-lg tabular-nums ${
      isDanger ? 'text-red-600 animate-pulse' : isWarning ? 'text-orange-500' : 'text-gray-700'
    }`}>
      <Clock size={18} />
      {formatted}
    </div>
  );
};

export default CountdownTimer;
