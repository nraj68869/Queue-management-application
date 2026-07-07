import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './TrendChart.css';

export default function TrendChart({ data }) {
  const chartData = data.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    tickets: d.count,
  }));

  return (
    <div className="trend-chart">
      <h3 className="trend-chart__title">Tickets per day — last 7 days</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde1e5" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#4a5568', fontFamily: 'Inter' }}
            axisLine={{ stroke: '#dde1e5' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#4a5568', fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              fontFamily: 'Inter',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid #dde1e5',
            }}
          />
          <Line
            type="monotone"
            dataKey="tickets"
            stroke="#e8a33d"
            strokeWidth={2.5}
            dot={{ fill: '#e8a33d', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
