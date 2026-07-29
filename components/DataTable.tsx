'use client';

import { useState } from 'react';
import { DerivedMeasurement } from '@/types';
import { weaponLabel } from '@/lib/physics';
import { FiChevronUp, FiChevronDown, FiDownload } from 'react-icons/fi';

interface DataTableProps {
  data: DerivedMeasurement[];
  loading: boolean;
}

type SortKey = 'timestamp' | 'omega' | 'tipSpeed' | 'energy' | 'index';
type SortOrder = 'asc' | 'desc';

/** 값의 성격 배지 — 실측인지 환산 추정인지 구분한다 */
type Kind = '실측' | '추정' | null;

const KIND_STYLE: Record<Exclude<Kind, null>, string> = {
  실측: 'bg-emerald-500/20 text-emerald-300',
  추정: 'bg-amber-500/20 text-amber-300',
};

/** 정렬 가능한 수치 컬럼. 무기 컬럼은 정렬 대상이 아니므로 별도로 렌더한다. */
const NUMERIC_COLUMNS: { key: SortKey; label: string; kind: Kind }[] = [
  { key: 'omega', label: '각속도 (rad/s)', kind: '실측' },
  { key: 'tipSpeed', label: '추정 끝속도 (m/s)', kind: '추정' },
  { key: 'energy', label: '등가 에너지 (J)', kind: '추정' },
  { key: 'index', label: '상대 타격지수', kind: null },
];

const getWeaponColor = (weapon: string) => {
  switch (weaponLabel(weapon)) {
    case '편곤':
      return 'bg-purple-500/20 text-purple-300';
    case '봉':
      return 'bg-emerald-500/20 text-emerald-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

/** 정렬 키에 해당하는 수치. 계산 불가 레코드는 항상 뒤로 밀리도록 -Infinity */
const sortValue = (item: DerivedMeasurement, key: SortKey): number => {
  if (key === 'timestamp') return item.timestamp;
  if (key === 'omega') return item.maxAngularVelocity;
  if (!item.derived) return Number.NEGATIVE_INFINITY;
  return item.derived[key];
};

function SortIcon({
  columnKey,
  sortKey,
  sortOrder,
}: {
  columnKey: SortKey;
  sortKey: SortKey;
  sortOrder: SortOrder;
}) {
  if (sortKey !== columnKey) return null;
  return sortOrder === 'asc' ? (
    <FiChevronUp className="inline ml-1" />
  ) : (
    <FiChevronDown className="inline ml-1" />
  );
}

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
    setCurrentPage(1);
  };

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return (sortValue(a, sortKey) - sortValue(b, sortKey)) * multiplier;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /** 작품설명서 표 작성용 CSV 내보내기 — 현재 정렬 순서 전체를 담는다 */
  const handleExportCsv = () => {
    const header = [
      '측정 시각',
      '무기',
      '각속도(rad/s, 실측)',
      '추정 끝속도(m/s)',
      '등가 에너지(J)',
      '상대 타격지수',
    ];
    const rows = sortedData.map((item) => [
      new Date(item.timestamp).toLocaleString('ko-KR'),
      weaponLabel(item.weapon),
      item.maxAngularVelocity.toFixed(2),
      item.derived ? item.derived.tipSpeed.toFixed(2) : '계산 불가',
      item.derived ? item.derived.energy.toFixed(2) : '계산 불가',
      item.derived ? item.derived.index.toFixed(1) : '계산 불가',
    ]);

    const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');

    // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'measurements.csv';
    link.click();
    URL.revokeObjectURL(url);
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
      <div className="flex items-center justify-end px-6 py-3 border-b border-white/10">
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <FiDownload />
          CSV 내보내기
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">
                <button
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center hover:text-white transition-colors"
                >
                  측정 시각
                  <SortIcon columnKey="timestamp" sortKey={sortKey} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200">
                무기
              </th>
              {NUMERIC_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-purple-200"
                >
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    {column.label}
                    {column.kind && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${KIND_STYLE[column.kind]}`}
                      >
                        {column.kind}
                      </span>
                    )}
                    <SortIcon columnKey={column.key} sortKey={sortKey} sortOrder={sortOrder} />
                  </button>
                </th>
              ))}
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
                    {weaponLabel(item.weapon)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white font-mono">
                  {item.maxAngularVelocity.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-white font-mono">
                  {item.derived ? item.derived.tipSpeed.toFixed(2) : '계산 불가'}
                </td>
                <td className="px-6 py-4 text-sm text-white font-mono">
                  {item.derived ? item.derived.energy.toFixed(2) : '계산 불가'}
                </td>
                <td className="px-6 py-4 text-sm text-white font-mono">
                  {item.derived ? item.derived.index.toFixed(1) : '계산 불가'}
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
