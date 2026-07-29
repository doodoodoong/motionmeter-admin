'use client';

import { FiArrowDown, FiArrowRight } from 'react-icons/fi';
import { WeaponStatistics } from '@/types';
import { REFERENCE_WEAPON, THEORETICAL_RATIO } from '@/lib/physics';

interface WeaponComparisonProps {
  weaponStatistics: WeaponStatistics[];
}

type Metric = {
  label: string;
  description: string;
  kind: '실측' | '추정' | '지수';
  unit: string;
  value: (stat: WeaponStatistics) => number;
  digits: number;
};

const METRICS: Metric[] = [
  {
    label: '평균 각속도',
    description: '손잡이 센서가 직접 측정한 회전 속도',
    kind: '실측',
    unit: 'rad/s',
    value: (stat) => stat.avgAngularVelocity,
    digits: 1,
  },
  {
    label: '평균 끝속도',
    description: '각속도와 무기 길이로 환산한 끝부분 속도',
    kind: '추정',
    unit: 'm/s',
    value: (stat) => stat.avgTipSpeed,
    digits: 1,
  },
  {
    label: '평균 등가 에너지',
    description: '현행 물리 계수로 다시 계산한 에너지',
    kind: '추정',
    unit: 'J',
    value: (stat) => stat.avgEnergyRecomputed,
    digits: 1,
  },
  {
    label: '평균 상대 타격지수',
    description: '봉 10 rad/s를 100으로 둔 비교용 수치',
    kind: '지수',
    unit: '',
    value: (stat) => stat.avgIndex,
    digits: 1,
  },
];

const KIND_STYLE = {
  실측: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  추정: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  지수: 'bg-sky-50 text-sky-700 ring-sky-600/15',
};

function Difference({ flail, staff }: { flail: number; staff: number }) {
  if (staff <= 0) return <span className="text-slate-400">비교 불가</span>;
  const percent = ((flail - staff) / staff) * 100;
  const direction = percent >= 0 ? '높음' : '낮음';

  return (
    <span className={percent >= 0 ? 'text-sky-700' : 'text-slate-600'}>
      편곤이 {Math.abs(percent).toFixed(1)}% {direction}
    </span>
  );
}

export default function WeaponComparison({ weaponStatistics }: WeaponComparisonProps) {
  const staff = weaponStatistics.find((stat) => stat.weapon === REFERENCE_WEAPON);
  const flail = weaponStatistics.find((stat) => stat.weapon === '편곤');

  if (!staff || !flail || staff.totalCount === 0 || flail.totalCount === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">편곤과 봉 비교</h2>
        <p className="mt-2 text-sm text-slate-500">두 무기의 측정값이 모두 모이면 비교 결과를 표시합니다.</p>
      </div>
    );
  }

  const measuredRatio = staff.avgIndex > 0 ? flail.avgIndex / staff.avgIndex : 0;
  const omegaDifference =
    staff.avgAngularVelocity > 0
      ? ((flail.avgAngularVelocity - staff.avgAngularVelocity) / staff.avgAngularVelocity) * 100
      : 0;
  const theoryGap = measuredRatio - THEORETICAL_RATIO;

  const explanation =
    omegaDifference < -0.05
      ? `편곤의 평균 각속도가 봉보다 ${Math.abs(omegaDifference).toFixed(1)}% 낮았습니다. 그래서 실제 지수 비는 동일한 각속도를 가정한 이론값보다 작게 나타났습니다.`
      : omegaDifference > 0.05
        ? `편곤의 평균 각속도가 봉보다 ${omegaDifference.toFixed(1)}% 높았습니다. 그래서 실제 지수 비는 동일한 각속도를 가정한 이론값보다 크게 나타났습니다.`
        : '두 무기의 평균 각속도가 거의 같아 실제 지수 비가 이론 계수 비에 가까워졌습니다.';

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm font-bold text-teal-700">핵심 비교</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">편곤과 봉을 같은 기준으로 비교하기</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          같은 행의 숫자를 좌우로 읽으면 두 무기의 차이와 측정값의 성격을 바로 확인할 수 있습니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.25fr_1fr_1fr] border-b border-slate-200 bg-slate-50 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div className="p-4 sm:p-5">
            <p className="text-xs font-bold tracking-wide text-slate-500">비교 항목</p>
          </div>
          <div className="border-l border-slate-200 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-600" aria-hidden="true" />
              <p className="font-bold text-sky-800">편곤</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">{flail.totalCount.toLocaleString('ko-KR')}회 측정</p>
          </div>
          <div className="border-l border-slate-200 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
              <p className="font-bold text-emerald-800">봉</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">{staff.totalCount.toLocaleString('ko-KR')}회 측정</p>
          </div>
        </div>

        {METRICS.map((metric) => {
          const flailValue = metric.value(flail);
          const staffValue = metric.value(staff);

          return (
            <div key={metric.label} className="grid grid-cols-[1.25fr_1fr_1fr] border-b border-slate-100 last:border-b-0 sm:grid-cols-[1.5fr_1fr_1fr]">
              <div className="min-w-0 p-4 sm:p-5">
                <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center">
                  <p className="text-sm font-bold text-slate-900">{metric.label}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${KIND_STYLE[metric.kind]}`}>
                    {metric.kind}
                  </span>
                </div>
                <p className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">{metric.description}</p>
                <p className="mt-2 hidden text-xs font-semibold sm:block">
                  <Difference flail={flailValue} staff={staffValue} />
                </p>
              </div>
              <div className="flex items-center border-l border-slate-100 p-3 sm:p-5">
                <p className="tabular-nums text-lg font-bold text-sky-800 sm:text-2xl">
                  {flailValue.toFixed(metric.digits)}
                  {metric.unit ? <span className="ml-1 block text-[10px] font-medium text-slate-500 sm:inline sm:text-xs">{metric.unit}</span> : null}
                </p>
              </div>
              <div className="flex items-center border-l border-slate-100 p-3 sm:p-5">
                <p className="tabular-nums text-lg font-bold text-emerald-800 sm:text-2xl">
                  {staffValue.toFixed(metric.digits)}
                  {metric.unit ? <span className="ml-1 block text-[10px] font-medium text-slate-500 sm:inline sm:text-xs">{metric.unit}</span> : null}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-slate-600">이론 계수 비</p>
          <p className="mt-1 text-xs text-slate-500">두 무기의 각속도가 같다고 가정</p>
          <p className="mt-4 tabular-nums text-4xl font-bold text-slate-950">
            {THEORETICAL_RATIO.toFixed(2)}<span className="ml-1 text-base font-semibold text-slate-500">배</span>
          </p>
        </div>

        <div className="hidden items-center justify-center text-slate-300 lg:flex">
          <FiArrowRight size={26} aria-hidden="true" />
        </div>
        <div className="flex justify-center text-slate-300 lg:hidden">
          <FiArrowDown size={24} aria-hidden="true" />
        </div>

        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
          <p className="text-sm font-semibold text-teal-800">학생 실측 지수 비</p>
          <p className="mt-1 text-xs text-teal-700/70">실제 평균 각속도의 차이까지 반영</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="tabular-nums text-4xl font-bold text-teal-950">
              {measuredRatio.toFixed(2)}<span className="ml-1 text-base font-semibold text-teal-700">배</span>
            </p>
            <span className="mb-1 text-xs font-bold text-teal-800">
              이론 대비 {Math.abs(theoryGap).toFixed(2)} {theoryGap >= 0 ? '높음' : '낮음'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm leading-6 text-slate-200 sm:px-6">
        <FiArrowRight className="mt-1 shrink-0 text-teal-300" aria-hidden="true" />
        <p><strong className="text-white">왜 차이가 났을까요?</strong> {explanation}</p>
      </div>
    </div>
  );
}
