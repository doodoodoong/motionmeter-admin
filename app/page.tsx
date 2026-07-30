'use client';

import dynamic from 'next/dynamic';
import { FiBarChart2, FiDatabase } from 'react-icons/fi';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import FilterBar from '@/components/FilterBar';
import DataTable from '@/components/DataTable';
import WeaponComparison from '@/components/WeaponComparison';
import { INDEX_REFERENCE_OMEGA, REFERENCE_WEAPON } from '@/lib/physics';

const ComparisonChart = dynamic(() => import('@/components/ComparisonChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const DISCLAIMER = `상대 타격지수는 ${REFERENCE_WEAPON}을 ${INDEX_REFERENCE_OMEGA} rad/s로 휘두를 때를 100으로 한 무단위 비교값이며 실제 타격력이 아닙니다. 측정값은 손잡이의 각속도이고, 끝속도와 에너지는 환산계수를 적용한 추정값입니다.`;

function ChartSkeleton() {
  return (
    <div
      className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white"
      aria-live="polite"
    >
      <p className="text-sm text-slate-500">차트를 불러오는 중…</p>
    </div>
  );
}

export default function Dashboard() {
  const {
    filteredData,
    allData,
    loading: dataLoading,
    error,
    filters,
    setFilters,
    overallStatistics,
    weaponStatistics,
  } = useFirebaseData();

  const flail = weaponStatistics.find((stat) => stat.weapon === '편곤');
  const staff = weaponStatistics.find((stat) => stat.weapon === REFERENCE_WEAPON);
  const measuredRatio =
    flail && staff && staff.avgIndex > 0 ? flail.avgIndex / staff.avgIndex : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        본문으로 바로가기
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-800">
              <FiBarChart2 size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="break-keep text-sm font-bold leading-tight tracking-tight text-slate-950 sm:text-base">
                상대 타격지수 데이터 비교
              </p>
              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">편곤·봉 회전운동 측정 결과</p>
            </div>
          </div>

          <nav
            className="hidden shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 sm:flex"
            aria-label="대시보드 주요 영역"
          >
            {[
              ['핵심 비교', '#comparison'],
              ['비교 차트', '#chart'],
              ['측정 기록', '#records'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-950 hover:shadow-sm"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="grid overflow-hidden rounded-3xl border border-teal-900/10 bg-slate-950 text-white shadow-sm lg:grid-cols-[1.55fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="mb-4 text-xs font-bold tracking-[0.16em] text-teal-300">핵심 결과</p>
            <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              편곤과 봉, 같은 회전에서도 결과는 어떻게 달라질까요?
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
              {measuredRatio === null
                ? '두 무기의 측정 데이터가 모이면 핵심 비교 결과가 여기에 표시됩니다.'
                : `학생 측정값에서 편곤의 평균 상대 타격지수는 봉의 ${measuredRatio.toFixed(2)}배였습니다. 아래에서 속도와 구조가 결과에 미친 영향을 비교해 보세요.`}
            </p>
          </div>

          <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.04] lg:grid-cols-1 lg:border-l lg:border-t-0">
            {[
              ['전체 측정', overallStatistics.totalCount, '회'],
              ['편곤 표본', flail?.totalCount ?? 0, '회'],
              ['봉 표본', staff?.totalCount ?? 0, '회'],
            ].map(([label, value, unit]) => (
              <div key={label} className="border-r border-white/10 p-4 last:border-r-0 lg:border-b lg:border-r-0 lg:p-6 lg:last:border-b-0">
                <p className="text-xs text-slate-400 sm:text-sm">{label}</p>
                <p className="mt-1 tabular-nums text-xl font-bold sm:text-2xl">
                  {Number(value).toLocaleString('ko-KR')}
                  <span className="ml-1 text-xs font-medium text-slate-400 sm:text-sm">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            측정 데이터를 불러오지 못했습니다. 네트워크 연결을 확인한 뒤 새로고침해 주세요.
          </div>
        ) : null}

        <section id="comparison" className="section-anchor mt-12 sm:mt-16">
          <WeaponComparison weaponStatistics={weaponStatistics} />
        </section>

        <section id="chart" className="section-anchor mt-12 sm:mt-16">
          <div className="mb-5">
            <p className="text-sm font-bold text-teal-700">시각적 비교</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">차트로 차이 확인하기</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              단위가 다른 값은 분리해서 보여 주어 막대 길이를 정확하게 비교할 수 있습니다.
            </p>
          </div>
          <ComparisonChart data={allData} />
        </section>

        <aside className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
          <FiDatabase className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-amber-950">수치를 읽기 전에 확인하세요</p>
            <p className="mt-1 text-sm leading-6 text-amber-900/80">{DISCLAIMER}</p>
          </div>
        </aside>

        <section id="records" className="section-anchor mt-12 sm:mt-16">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold text-teal-700">원본 확인</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">측정 기록 탐색</h2>
              <p className="mt-2 text-sm text-slate-600">필터는 아래 기록에만 적용되며 상단 비교 결과에는 영향을 주지 않습니다.</p>
            </div>
            <FilterBar filters={filters} onFilterChange={setFilters} />
          </div>
          <DataTable data={filteredData} loading={dataLoading} />
        </section>

        <footer className="mt-14 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          상대 타격지수 데이터 비교 · 편곤·봉 회전운동 측정 프로젝트
        </footer>
      </main>
    </div>
  );
}
