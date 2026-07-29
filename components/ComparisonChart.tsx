'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DerivedMeasurement } from '@/types';
import { WEAPON_CODES, WeaponCode } from '@/lib/physics';

interface ComparisonChartProps {
  data: DerivedMeasurement[];
}

type Tab = 'index' | 'omega';

const TABS: { key: Tab; label: string; description: string }[] = [
  { key: 'index', label: '상대 타격지수', description: '구조와 속도를 함께 반영한 비교값' },
  { key: 'omega', label: '각속도', description: '센서로 직접 측정한 회전 속도' },
];

const WEAPON_COLORS: Record<WeaponCode, string> = {
  편곤: '#0284c7',
  봉: '#059669',
};

const round1 = (value: number) => Number(value.toFixed(1));

export default function ComparisonChart({ data }: ComparisonChartProps) {
  const [tab, setTab] = useState<Tab>('index');

  const { chartData, availableWeapons, summaries } = useMemo(() => {
    const groups = new Map<WeaponCode, { omega: number[]; index: number[] }>();
    for (const weapon of WEAPON_CODES) groups.set(weapon, { omega: [], index: [] });

    for (const item of data) {
      if (!item.weaponCode) continue;
      const group = groups.get(item.weaponCode);
      if (!group) continue;
      group.omega.push(item.maxAngularVelocity);
      if (item.derived) group.index.push(item.derived.index);
    }

    const weapons = WEAPON_CODES.filter((weapon) => {
      const group = groups.get(weapon);
      return group ? group.omega.length > 0 : false;
    });

    const values = (weapon: WeaponCode) => {
      const group = groups.get(weapon)!;
      const source = tab === 'index' ? group.index : group.omega;
      let total = 0;
      let maximum = 0;
      for (const value of source) {
        total += value;
        if (value > maximum) maximum = value;
      }
      const average = source.length ? total / source.length : 0;
      return { average: round1(average), maximum: round1(maximum) };
    };

    const summaryByWeapon = new Map(weapons.map((weapon) => [weapon, values(weapon)]));

    return {
      availableWeapons: weapons,
      chartData: [
        {
          name: '평균',
          ...Object.fromEntries(weapons.map((weapon) => [weapon, summaryByWeapon.get(weapon)!.average])),
        },
        {
          name: '최대',
          ...Object.fromEntries(weapons.map((weapon) => [weapon, summaryByWeapon.get(weapon)!.maximum])),
        },
      ],
      summaries: weapons.map((weapon) => ({ weapon, ...summaryByWeapon.get(weapon)! })),
    };
  }, [data, tab]);

  if (availableWeapons.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
        <p className="text-sm text-slate-500">차트를 표시할 측정 데이터가 없습니다.</p>
      </div>
    );
  }

  const activeTab = TABS.find((item) => item.key === tab)!;
  const unit = tab === 'omega' ? 'rad/s' : '무단위';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{activeTab.label} 비교</h3>
          <p className="mt-1 text-sm text-slate-500">{activeTab.description} · {unit}</p>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="차트 지표 선택">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              aria-controls="comparison-chart-panel"
              onClick={() => setTab(key)}
              className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors ${
                tab === key
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div id="comparison-chart-panel" role="tabpanel" className="mt-5 h-[300px] w-full sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            accessibilityLayer
            margin={{ top: 28, right: 8, left: 0, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                color: '#0f172a',
                boxShadow: '0 8px 24px rgb(15 23 42 / 10%)',
              }}
              formatter={(value, name) => [`${value} ${unit === '무단위' ? '' : unit}`.trim(), name]}
            />
            <Legend wrapperStyle={{ paddingTop: 16, color: '#334155', fontSize: 13 }} />
            {availableWeapons.map((weapon) => (
              <Bar key={weapon} dataKey={weapon} fill={WEAPON_COLORS[weapon]} radius={[6, 6, 0, 0]} maxBarSize={72}>
                <LabelList dataKey={weapon} position="top" fill="#334155" fontSize={12} fontWeight={700} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2" aria-label={`${activeTab.label} 수치 요약`}>
        {summaries.map((summary) => (
          <div key={summary.weapon} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 font-bold text-slate-800">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: WEAPON_COLORS[summary.weapon] }} aria-hidden="true" />
              {summary.weapon}
            </span>
            <span className="tabular-nums text-slate-600">
              평균 <strong className="text-slate-950">{summary.average}</strong> · 최대 <strong className="text-slate-950">{summary.maximum}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
