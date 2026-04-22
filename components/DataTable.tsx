'use client';

import { useState } from 'react';
import { MeasurementData } from '@/types';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface DataTableProps {
  data: MeasurementData[];
  loading: boolean;
}

type SortKey = 'timestamp' | 'maxEnergy' | 'maxAngularVelocity';
type SortOrder = 'asc' | 'desc';

const WEAPON_NAMES: Record<string, string> = {
  flail: '편곤',
  staff: '봉',
  mace: '철퇴',
  unknown: '알 수 없음',
};

const getWeaponColor = (weapon: string) => {
  switch (weapon) {
    case 'flail':
      return 'bg-purple-500/20 text-purple-300';
    case 'staff':
      return 'bg-emerald-500/20 text-emerald-300';
    case 'mace':
      return 'bg-orange-500/20 text-orange-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

export default function DataTable({ data, loading }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortOrder === 'asc' ? (
      <FiChevronUp className="inline ml-1" />
    ) : (
      <FiChevronDown className="inline ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
        <p className="text-purple-200">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">
                <button
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center hover:text-white transition-colors"
                >
                  측정 시간
                  <SortIcon columnKey="timestamp" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">
                무기
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">
                <button
                  onClick={() => handleSort('maxEnergy')}
                  className="flex items-center hover:text-white transition-colors"
                >
                  최대 에너지 (J)
                  <SortIcon columnKey="maxEnergy" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">
                <button
                  onClick={() => handleSort('maxAngularVelocity')}
                  className="flex items-center hover:text-white transition-colors"
                >
                  최대 각속도 (rad/s)
                  <SortIcon columnKey="maxAngularVelocity" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  index % 2 === 0 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <td className="px-6 py-4 text-sm text-white">
                  {new Date(item.timestamp).toLocaleString('ko-KR')}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getWeaponColor(item.weapon)}`}
                  >
                    {WEAPON_NAMES[item.weapon] || item.weapon}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white font-mono">
                  {item.maxEnergy.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-white font-mono">
                  {item.maxAngularVelocity.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p className="text-sm text-purple-200">
            총 {data.length}개 중 {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, data.length)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              이전
            </button>
            <span className="px-4 py-2 text-purple-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
