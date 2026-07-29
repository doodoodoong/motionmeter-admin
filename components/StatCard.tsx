'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
  /** '실측' / '추정' 등 값의 성격 배지 */
  badge?: string;
  /** 값 아래 보조 설명 */
  note?: string;
}

const colorClasses = {
  purple: 'from-purple-500 to-indigo-600',
  blue: 'from-blue-500 to-cyan-600',
  green: 'from-emerald-500 to-teal-600',
  orange: 'from-orange-500 to-amber-600',
  pink: 'from-pink-500 to-rose-600',
};

export default function StatCard({ title, value, icon, color, badge, note }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-20`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-2 text-purple-200 text-sm font-medium">
            {title}
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                {badge}
              </span>
            )}
          </span>
          <div className="p-2 bg-white/10 rounded-lg text-white">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {note && <p className="mt-1 text-xs text-purple-300/80">{note}</p>}
      </div>
    </div>
  );
}
