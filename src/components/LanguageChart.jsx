import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LanguageChart({ langData }) {
  const top = langData.slice(0, 8);

  const data = {
    labels: top.map((l) => l.lang),
    datasets: [
      {
        data: top.map((l) => l.pct),
        backgroundColor: [
          '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
          '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
        ],
      },
    ],
  };

  return (
    <div style={{ maxWidth: 350 }}>
      <Pie data={data} />
    </div>
  );
}