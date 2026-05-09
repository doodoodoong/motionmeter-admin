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
  unknown: '알 수 없음',
};

const WEAPON_COLORS = ['#06b6d4', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

export default function ComparisonChart({ data }: ComparisonChartProps) {
  const { energyData, velocityData, weapons } = useMemo(() => {
    const uniqueWeapons = Array.from(new Set(data.map((item) => item.weapon)));

    const weaponGroups: Record<string, MeasurementData[]> = {};
    for (const weapon of uniqueWeapons) {
      weaponGroups[weapon] = data.filter((item) => item.weapon === weapon);
    }

    const calcAvg = (items: MeasurementData[], key: 'maxEnergy' | 'maxAngularVelocity') => {
      if (items.length === 0) return 0;
      return Number((items.reduce((sum, item) => sum + item[key], 0) / items.length).toFixed(2));
    };

    const calcMax = (items: MeasurementData[], key: 'maxEnergy' | 'maxAngularVelocity') => {
      if (items.length === 0) return 0;
      return Number(Math.max(...items.map((item) => item[key])).toFixed(2));
    };

    return {
      weapons: uniqueWeapons,
      energyData: [
        {
          name: '평균 에너지',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, calcAvg(weaponGroups[w], 'maxEnergy')])),
        },
        {
          name: '최대 에너지',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, calcMax(weaponGroups[w], 'maxEnergy')])),
        },
      ],
      velocityData: [
        {
          name: '평균 각속도',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, calcAvg(weaponGroups[w], 'maxAngularVelocity')])),
        },
        {
          name: '최대 각속도',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, calcMax(weaponGroups[w], 'maxAngularVelocity')])),
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

  const legendFormatter = (value: string) => (
    <span style={{ color: '#c4b5fd' }}>{WEAPON_NAMES[value] ?? value}</span>
  );

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
            <Tooltip {...chartConfig.tooltip} formatter={(value, name) => [value, WEAPON_NAMES[name as string] ?? name]} />
            <Legend formatter={legendFormatter} />
            {weapons.map((weapon, i) => (
              <Bar key={weapon} dataKey={weapon} fill={WEAPON_COLORS[i % WEAPON_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
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
            <Tooltip {...chartConfig.tooltip} formatter={(value, name) => [value, WEAPON_NAMES[name as string] ?? name]} />
            <Legend formatter={legendFormatter} />
            {weapons.map((weapon, i) => (
              <Bar key={weapon} dataKey={weapon} fill={WEAPON_COLORS[i % WEAPON_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
