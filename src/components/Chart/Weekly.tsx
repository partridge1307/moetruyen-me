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
const labels = ['0d', '1d', '3d', '5d', '7d'];

interface WeeklyProps {
  filteredView: number[];
}

const Weekly: FC<WeeklyProps> = ({ filteredView }) => {
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
    <Line options={opts} data={data} fallbackContent={<p>View trong tuần</p>} />
  );
};

export default Weekly;
