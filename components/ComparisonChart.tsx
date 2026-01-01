'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MeasurementData } from '@/types';

interface ComparisonChartProps {
  data: MeasurementData[];
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
  const { energyData, velocityData } = useMemo(() => {
    // 보병용/마상용별 통계 계산
    const infantryData = data.filter((item) => item.type === 'infantry');
    const cavalryData = data.filter((item) => item.type === 'cavalry');

    const calcAvg = (items: MeasurementData[], key: 'maxEnergy' | 'maxAngularVelocity') => {
      if (items.length === 0) return 0;
      return items.reduce((sum, item) => sum + item[key], 0) / items.length;
    };

    const calcMax = (items: MeasurementData[], key: 'maxEnergy' | 'maxAngularVelocity') => {
      if (items.length === 0) return 0;
      return Math.max(...items.map((item) => item[key]));
    };

    return {
      energyData: [
        {
          name: '평균 에너지',
          보병용: Number(calcAvg(infantryData, 'maxEnergy').toFixed(2)),
          마상용: Number(calcAvg(cavalryData, 'maxEnergy').toFixed(2)),
        },
        {
          name: '최대 에너지',
          보병용: Number(calcMax(infantryData, 'maxEnergy').toFixed(2)),
          마상용: Number(calcMax(cavalryData, 'maxEnergy').toFixed(2)),
        },
      ],
      velocityData: [
        {
          name: '평균 각속도',
          보병용: Number(calcAvg(infantryData, 'maxAngularVelocity').toFixed(2)),
          마상용: Number(calcAvg(cavalryData, 'maxAngularVelocity').toFixed(2)),
        },
        {
          name: '최대 각속도',
          보병용: Number(calcMax(infantryData, 'maxAngularVelocity').toFixed(2)),
          마상용: Number(calcMax(cavalryData, 'maxAngularVelocity').toFixed(2)),
        },
      ],
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
        <p className="text-purple-200">차트를 표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  const chartConfig = {
    grid: { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' },
    xAxis: { tick: { fill: '#c4b5fd', fontSize: 12 }, axisLine: { stroke: 'rgba(255,255,255,0.2)' } },
    yAxis: { tick: { fill: '#c4b5fd', fontSize: 12 }, axisLine: { stroke: 'rgba(255,255,255,0.2)' } },
    tooltip: {
      contentStyle: {
        backgroundColor: 'rgba(30, 20, 60, 0.95)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        color: '#fff',
      },
      labelStyle: { color: '#c4b5fd' },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 에너지 차트 */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">에너지 비교 (J)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={energyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis dataKey="name" {...chartConfig.xAxis} />
            <YAxis {...chartConfig.yAxis} />
            <Tooltip {...chartConfig.tooltip} />
            <Legend formatter={(value) => <span style={{ color: '#c4b5fd' }}>{value}</span>} />
            <Bar dataKey="보병용" fill="url(#infantryGradient)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="마상용" fill="url(#cavalryGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="infantryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="cavalryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 각속도 차트 */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">각속도 비교 (rad/s)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={velocityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid {...chartConfig.grid} />
            <XAxis dataKey="name" {...chartConfig.xAxis} />
            <YAxis {...chartConfig.yAxis} />
            <Tooltip {...chartConfig.tooltip} />
            <Legend formatter={(value) => <span style={{ color: '#c4b5fd' }}>{value}</span>} />
            <Bar dataKey="보병용" fill="url(#infantryGradient2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="마상용" fill="url(#cavalryGradient2)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="infantryGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="cavalryGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
