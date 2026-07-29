'use client';

import { useMemo, useState } from 'react';
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
import { DerivedMeasurement } from '@/types';
import { WeaponCode } from '@/lib/physics';

interface ComparisonChartProps {
  data: DerivedMeasurement[];
}

const WEAPON_COLORS = ['#06b6d4', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

const INDEX_COLOR = '#06b6d4';
const OMEGA_COLOR = '#10b981';

type Tab = 'index' | 'omega' | 'both';

const TABS: { key: Tab; label: string }[] = [
  { key: 'index', label: '상대 타격지수' },
  { key: 'omega', label: '각속도' },
  { key: 'both', label: '함께 보기' },
];

const round2 = (n: number) => Number(n.toFixed(2));

export default function ComparisonChart({ data }: ComparisonChartProps) {
  const [tab, setTab] = useState<Tab>('index');

  const { weapons, indexData, omegaData, bothData } = useMemo(() => {
    // 무기를 특정할 수 없는 레코드는 계수를 적용할 수 없어 차트에서 제외한다
    const usable = data.filter((item) => item.weaponCode !== null);
    const uniqueWeapons = Array.from(
      new Set(usable.map((item) => item.weaponCode as WeaponCode))
    );

    const groups: Record<string, DerivedMeasurement[]> = {};
    for (const weapon of uniqueWeapons) {
      groups[weapon] = usable.filter((item) => item.weaponCode === weapon);
    }

    const indexValues = (items: DerivedMeasurement[]) =>
      items.map((item) => item.derived?.index ?? 0);
    const omegaValues = (items: DerivedMeasurement[]) =>
      items.map((item) => item.maxAngularVelocity);

    const avg = (values: number[]) =>
      values.length === 0 ? 0 : round2(values.reduce((s, v) => s + v, 0) / values.length);
    const peak = (values: number[]) => (values.length === 0 ? 0 : round2(Math.max(...values)));

    return {
      weapons: uniqueWeapons,
      indexData: [
        {
          name: '평균 지수',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, avg(indexValues(groups[w]))])),
        },
        {
          name: '최대 지수',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, peak(indexValues(groups[w]))])),
        },
      ],
      omegaData: [
        {
          name: '평균 각속도',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, avg(omegaValues(groups[w]))])),
        },
        {
          name: '최대 각속도',
          ...Object.fromEntries(uniqueWeapons.map((w) => [w, peak(omegaValues(groups[w]))])),
        },
      ],
      bothData: uniqueWeapons.map((w) => ({
        name: w,
        avgIndex: avg(indexValues(groups[w])),
        avgOmega: avg(omegaValues(groups[w])),
      })),
    };
  }, [data]);

  if (data.length === 0 || weapons.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
        <p className="text-purple-200">차트를 표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  const grid = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' };
  const axis = {
    tick: { fill: '#c4b5fd', fontSize: 12 },
    axisLine: { stroke: 'rgba(255,255,255,0.2)' },
  };
  const tooltip = {
    contentStyle: {
      backgroundColor: 'rgba(30, 20, 60, 0.95)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      color: '#fff',
    },
    labelStyle: { color: '#c4b5fd' },
  };
  const legendFormatter = (value: string) => {
    const label =
      value === 'avgIndex'
        ? '평균 상대 타격지수'
        : value === 'avgOmega'
          ? '평균 각속도 (rad/s)'
          : value;
    return <span style={{ color: '#c4b5fd' }}>{label}</span>;
  };

  const heading =
    tab === 'index'
      ? '상대 타격지수 비교 (무단위)'
      : tab === 'omega'
        ? '각속도 비교 (rad/s) · 실측'
        : '상대 타격지수와 각속도 (이중 축)';

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-white">{heading}</h3>
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                tab === key
                  ? 'bg-purple-500/30 text-white'
                  : 'text-purple-200 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        {tab === 'both' ? (
          <BarChart data={bothData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid {...grid} />
            <XAxis dataKey="name" {...axis} />
            <YAxis
              yAxisId="index"
              {...axis}
              label={{
                value: '상대 타격지수',
                angle: -90,
                position: 'insideLeft',
                fill: '#c4b5fd',
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="omega"
              orientation="right"
              {...axis}
              label={{
                value: '각속도 (rad/s)',
                angle: 90,
                position: 'insideRight',
                fill: '#c4b5fd',
                fontSize: 12,
              }}
            />
            <Tooltip
              {...tooltip}
              formatter={(value, name) => [
                value,
                name === 'avgIndex' ? '평균 상대 타격지수' : '평균 각속도 (rad/s)',
              ]}
            />
            <Legend formatter={legendFormatter} />
            <Bar
              yAxisId="index"
              dataKey="avgIndex"
              fill={INDEX_COLOR}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="omega"
              dataKey="avgOmega"
              fill={OMEGA_COLOR}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        ) : (
          <BarChart
            data={tab === 'index' ? indexData : omegaData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid {...grid} />
            <XAxis dataKey="name" {...axis} />
            <YAxis {...axis} />
            <Tooltip {...tooltip} />
            <Legend formatter={(value: string) => <span style={{ color: '#c4b5fd' }}>{value}</span>} />
            {weapons.map((weapon, i) => (
              <Bar
                key={weapon}
                dataKey={weapon}
                fill={WEAPON_COLORS[i % WEAPON_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>

      <p className="mt-4 text-xs text-purple-300/80">
        {tab === 'omega'
          ? '각속도는 자이로스코프가 측정한 손잡이(본체)의 실측값입니다.'
          : '상대 타격지수는 실측 각속도에서 현행 계수로 재계산한 무단위 비교값입니다.'}
      </p>
    </div>
  );
}
