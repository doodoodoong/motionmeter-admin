'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import StatCard from '@/components/StatCard';
import FilterBar from '@/components/FilterBar';
import DataTable from '@/components/DataTable';
import ComparisonChart from '@/components/ComparisonChart';
import { FiActivity, FiZap, FiTrendingUp, FiDatabase, FiLogOut } from 'react-icons/fi';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data, allData, loading: dataLoading, filters, setFilters, statistics } = useFirebaseData();
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
            <h1 className="text-2xl font-bold text-white">편곤 에너지 측정 결과 Admin</h1>
            <p className="text-sm text-purple-300">편곤 에너지 측정 데이터 관리</p>
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
        {/* 통계 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="총 측정 수"
            value={statistics.totalCount.toLocaleString()}
            icon={<FiDatabase size={20} />}
            color="purple"
          />
          <StatCard
            title="평균 에너지"
            value={`${statistics.avgEnergy.toFixed(2)} J`}
            icon={<FiZap size={20} />}
            color="blue"
          />
          <StatCard
            title="평균 각속도"
            value={`${statistics.avgAngularVelocity.toFixed(2)} rad/s`}
            icon={<FiActivity size={20} />}
            color="green"
          />
          <StatCard
            title="최대 에너지"
            value={`${statistics.maxEnergy.toFixed(2)} J`}
            icon={<FiTrendingUp size={20} />}
            color="orange"
          />
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
      </main>
    </div>
  );
}
