import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const classNames: { [key: number]: string } = {
  0: "Anger怒り",
  1: "Contempt軽蔑",
  2: "Disgust嫌悪",
  3: "Fear恐怖",
  4: "Happy幸せ",
  5: "Neutral無表情",
  6: "Sad悲しみ",
  7: "Surprise驚き",
};

// Y軸のデータ
const emotionData: number[] = [0, 1, 4, 2, 3, 4, 5, 6, 7, 4]; // 例としてランダムなクラスIDを使用


// X軸のラベル（10秒ごと）
const timeLabels: string[] = Array.from({ length: emotionData.length }, (_, i) => `${i * 10}s`);




const data = {
  labels: timeLabels,
  datasets: [
    {
      label: '表情',
      data: emotionData,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      fill: false, // 塗りつぶしを無効にする
      tension: 0.1, // 線のテンション（滑らかさ）
    },
  ],
};

const options = {
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: number | string): string {
          return classNames[Number(value)] || String(value);
        },
      },
    },
    x: {
      title: {
        display: true,
        text: 'Time',
      },
    },
  },
};

export default function Graph() {
  return (
    <div>
      <h1>発表時の表情推移</h1>
      <Line data={data} options={options} />
    </div>
  );
}
