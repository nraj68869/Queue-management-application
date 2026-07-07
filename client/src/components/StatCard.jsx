import './StatCard.css';

function formatSeconds(sec) {
  if (!sec) return '0m';
  const mins = Math.floor(sec / 60);
  const remaining = sec % 60;
  if (mins === 0) return `${remaining}s`;
  return `${mins}m ${remaining}s`;
}

export default function StatCard({ label, value, unit, accent }) {
  return (
    <div className={`stat-card${accent ? ` stat-card--${accent}` : ''}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {unit && <span className="stat-card__unit">{unit}</span>}
    </div>
  );
}

export { formatSeconds };
