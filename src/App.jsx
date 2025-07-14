import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const modulate = (bits, type) => {
  const data = [];
  const time = [];
  let t = 0;
  const dt = 0.1;
  const freq = 1;
  const amp = 1;
  const carrier = (x, f) => Math.sin(2 * Math.PI * f * x);

  // For QAM: group bits into 2 (4-QAM)
  const symbols = type === 'QAM' ? bits.match(/.{1,2}/g) : bits.split('');

  for (let i = 0; i < symbols.length; i++) {
    for (let j = 0; j < 10; j++) {
      const tt = t + j * dt;
      let val = 0;

      if (type === 'ASK') {
        val = symbols[i] === '1' ? amp * carrier(tt, freq) : 0;
      } else if (type === 'FSK') {
        val = carrier(tt, symbols[i] === '1' ? freq * 2 : freq);
      } else if (type === 'PSK') {
        val = amp * Math.sin(2 * Math.PI * freq * tt + (symbols[i] === '1' ? 0 : Math.PI));
      } else if (type === 'PAM') {
        const level = parseInt(symbols[i], 2); // supports multilevel if needed
        val = level * amp;
      } else if (type === 'QAM') {
        const qamMap = {
          '00': { I: 1, Q: 1 },
          '01': { I: -1, Q: 1 },
          '10': { I: -1, Q: -1 },
          '11': { I: 1, Q: -1 },
        };
        const { I, Q } = qamMap[symbols[i].padEnd(2, '0')] || { I: 0, Q: 0 };
        val = I * Math.cos(2 * Math.PI * freq * tt) + Q * Math.sin(2 * Math.PI * freq * tt);
      }

      data.push(val);
      time.push(tt.toFixed(2));
    }
    t += 1;
  }

  return { time, data };
};

export default function App() {
  const [bits, setBits] = useState('101001');
  const [type, setType] = useState('ASK');
  const [graphData, setGraphData] = useState({ time: [], data: [] });

  const handleGenerate = () => {
    const result = modulate(bits, type);
    setGraphData(result);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Digital Modulation</h1>

      <div className="mb-4 flex flex-wrap gap-4">
        <input
          value={bits}
          onChange={(e) => setBits(e.target.value.replace(/[^01]/g, ''))}
          className="p-2 border rounded w-56"
          placeholder="Enter binary (e.g. 10101)"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
          <option value="ASK">ASK</option>
          <option value="FSK">FSK</option>
          <option value="PSK">PSK</option>
          <option value="PAM">PAM</option>
          <option value="QAM">QAM</option>
        </select>
        <button onClick={handleGenerate} className="bg-blue-500 text-white px-4 py-2 rounded">
          Generate Signal
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <Line
          data={{
            labels: graphData.time,
            datasets: [
              {
                label: `${type} Signal`,
                data: graphData.data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.3,
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { display: true } } }}
        />
      </div>
    </div>
  );
}
