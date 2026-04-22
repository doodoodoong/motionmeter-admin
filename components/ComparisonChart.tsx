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

const WEAPON_NAMES: Record<string, string> = {
  flail: '편곤',
  staff: '봉',
  mace: '철퇴',
};

export default function ComparisonChart({ data }: ComparisonChartProps) {
  const { energyData, velocityData } = useMemo(() => {
    // 무기별 통계 계산
    const flailData = data.filter((item) => item.weapon === 'flail');
    const staffData = data.filter((item) => item.weapon === 'staff');
    const maceData = data.filter((item) => item.weapon === 'mace');

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
          편곤: Number(calcAvg(flailData, 'maxEnergy').toFixed(2)),
          봉: Number(calcAvg(staffData, 'maxEnergy').toFixed(2)),
          철퇴: Number(calcAvg(maceData, 'maxEnergy').toFixed(2)),
        },
        {
          name: '최대 에너지',
          편곤: Number(calcMax(flailData, 'maxEnergy').toFixed(2)),
          봉: Number(calcMax(staffData, 'maxEnergy').toFixed(2)),
          철퇴: Number(calcMax(maceData, 'maxEnergy').toFixed(2)),
        },
      ],
      velocityData: [
        {
          name: '평균 각속도',
          편곤: Number(calcAvg(flailData, 'maxAngularVelocity').toFixed(2)),
          봉: Number(calcAvg(staffData, 'maxAngularVelocity').toFixed(2)),
          철퇴: Number(calcAvg(maceData, 'maxAngularVelocity').toFixed(2)),
        },
        {
          name: '최대 각속도',
          편곤: Number(calcMax(flailData, 'maxAngularVelocity').toFixed(2)),
          봉: Number(calcMax(staffData, 'maxAngularVelocity').toFixed(2)),
          철퇴: Number(calcMax(maceData, 'maxAngularVelocity').toFixed(2)),
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
            <Bar dataKey="편곤" fill="url(#flailGradient)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="봉" fill="url(#staffGradient)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="철퇴" fill="url(#maceGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="flailGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="staffGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="maceGradient" x1="0" y1="0" x2="0" y2="1">
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
            <Bar dataKey="편곤" fill="url(#flailGradient2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="봉" fill="url(#staffGradient2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="철퇴" fill="url(#maceGradient2)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="flailGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="staffGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="maceGradient2" x1="0" y1="0" x2="0" y2="1">
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
