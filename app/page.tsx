'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import StatCard from '@/components/StatCard';
import FilterBar from '@/components/FilterBar';
import DataTable from '@/components/DataTable';
import WeaponComparison from '@/components/WeaponComparison';
import { INDEX_REFERENCE_OMEGA, REFERENCE_WEAPON } from '@/lib/physics';
import { FiActivity, FiZap, FiTrendingUp, FiDatabase, FiLogOut } from 'react-icons/fi';

const ComparisonChart = dynamic(() => import('@/components/ComparisonChart'), { ssr: false });

/** 화면 어디에서나 동일하게 보여야 하는 해석 주의 문구 */
const DISCLAIMER = `상대 타격지수는 ${REFERENCE_WEAPON}을 ${INDEX_REFERENCE_OMEGA} rad/s로 휘두를 때를 100으로 한 무단위 비교값이며 실제 타격력이 아닙니다. 측정값은 손잡이(본체)의 각속도이고, 끝속도와 에너지는 환산계수를 적용해 계산한 추정값입니다.`;

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data, allData, loading: dataLoading, filters, setFilters, statistics, weaponStatistics } = useFirebaseData();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">회전운동 측정 결과 Admin</h1>
            <p className="text-sm text-purple-300">무기별 각속도·상대 타격지수 데이터 관리</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-200">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <FiLogOut />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* 전체 통계 */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">전체 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="총 측정 수"
              value={statistics.totalCount.toLocaleString()}
              icon={<FiDatabase size={20} />}
              color="purple"
            />
            <StatCard
              title="평균 각속도"
              badge="실측"
              value={`${statistics.avgAngularVelocity.toFixed(2)} rad/s`}
              note="자이로스코프가 측정한 손잡이 각속도"
              icon={<FiActivity size={20} />}
              color="green"
            />
            <StatCard
              title="평균 상대 타격지수"
              value={statistics.avgIndex.toFixed(1)}
              note="무단위"
              icon={<FiZap size={20} />}
              color="blue"
            />
            <StatCard
              title="최대 상대 타격지수"
              value={statistics.maxIndex.toFixed(1)}
              note="무단위"
              icon={<FiTrendingUp size={20} />}
              color="orange"
            />
          </div>
          <p className="mt-4 text-xs text-purple-300/80 leading-relaxed">{DISCLAIMER}</p>
        </section>

        {/* 무기별 통계 카드 */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">무기별 통계 요약</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {weaponStatistics.map((stat) => (
              <div key={stat.weapon} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                  {stat.weapon}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-200">총 측정 수</span>
                    <span className="font-semibold text-white">{stat.totalCount.toLocaleString()}회</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm text-purple-200">
                      평균 각속도
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                        실측
                      </span>
                    </span>
                    <span className="font-semibold text-green-300">{stat.avgAngularVelocity.toFixed(2)} rad/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm text-purple-200">
                      평균 추정 끝속도
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300">
                        추정
                      </span>
                    </span>
                    <span className="font-semibold text-amber-200">{stat.avgTipSpeed.toFixed(2)} m/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-200">평균 등가 운동에너지</span>
                    <span className="font-semibold text-blue-300">{stat.avgEnergyRecomputed.toFixed(2)} J</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-200">평균 상대 타격지수</span>
                    <span className="font-semibold text-cyan-300">{stat.avgIndex.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-200">최대 상대 타격지수</span>
                    <span className="font-semibold text-orange-300">{stat.maxIndex.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 이론값과 실측값 비교 */}
        <section>
          <WeaponComparison weaponStatistics={weaponStatistics} />
        </section>

        {/* 비교 차트 */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">유형별 비교</h2>
          <ComparisonChart data={allData} />
        </section>

        {/* 필터 */}
        <section>
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </section>

        {/* 데이터 테이블 */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">측정 기록</h2>
          <DataTable data={data} loading={dataLoading} />
        </section>

        {/* 해석 주의 문구 — 상시 표시 */}
        <footer className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-6 py-4">
          <p className="text-sm text-amber-100/90 leading-relaxed">{DISCLAIMER}</p>
        </footer>
      </main>
    </div>
  );
}
