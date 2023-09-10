'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { FC } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const opts = {
  responsive: true,
  scales: {
    y: {
      min: 0,
      ticks: {
        stepSize: 1,
      },
    },
  },
};
const labels = ['0h', '1h', '3h', '6h', '12h', '22h'];

interface DailyProps {
  filteredView: number[];
}

const Daily: FC<DailyProps> = ({ filteredView }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Lượt xem',
        data: filteredView,
        pointRadius: 5,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
      },
    ],
  };

  return (
    <Line options={opts} data={data} fallbackContent={<p>View trong ngày</p>} />
  );
};

export default Daily;
