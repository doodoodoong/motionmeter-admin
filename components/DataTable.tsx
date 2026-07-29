'use client';

import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp, FiDownload } from 'react-icons/fi';
import { DerivedMeasurement } from '@/types';
import { weaponLabel } from '@/lib/physics';

interface DataTableProps {
  data: DerivedMeasurement[];
  loading: boolean;
}

type SortKey = 'timestamp' | 'omega' | 'tipSpeed' | 'energy' | 'index';
type SortOrder = 'asc' | 'desc';
type Kind = '실측' | '추정' | null;

const ITEMS_PER_PAGE = 10;
const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const NUMERIC_COLUMNS: { key: SortKey; label: string; shortLabel: string; unit: string; kind: Kind }[] = [
  { key: 'omega', label: '각속도', shortLabel: '각속도', unit: 'rad/s', kind: '실측' },
  { key: 'tipSpeed', label: '끝속도', shortLabel: '끝속도', unit: 'm/s', kind: '추정' },
  { key: 'energy', label: '등가 에너지', shortLabel: '에너지', unit: 'J', kind: '추정' },
  { key: 'index', label: '상대 타격지수', shortLabel: '타격지수', unit: '', kind: null },
];

const KIND_STYLE = {
  실측: 'bg-emerald-50 text-emerald-700',
  추정: 'bg-amber-50 text-amber-700',
};

const WEAPON_STYLE: Record<string, string> = {
  편곤: 'bg-sky-50 text-sky-800 ring-sky-600/15',
  봉: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15',
};

function sortValue(item: DerivedMeasurement, key: SortKey): number | null {
  if (key === 'timestamp') return item.timestamp;
  if (key === 'omega') return item.maxAngularVelocity;
  if (!item.derived) return null;
  return item.derived[key];
}

function valueFor(item: DerivedMeasurement, key: SortKey): number | null {
  return sortValue(item, key);
}

function SortIndicator({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return null;
  return order === 'asc' ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />;
}

function WeaponBadge({ weapon }: { weapon: string }) {
  const label = weaponLabel(weapon);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${WEAPON_STYLE[label] ?? 'bg-slate-100 text-slate-700 ring-slate-500/15'}`}>
      {label}
    </span>
  );
}

export default function DataTable({ data, loading }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = sortValue(a, sortKey);
      const bValue = sortValue(b, sortKey);
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      return (aValue - bValue) * (sortOrder === 'asc' ? 1 : -1);
    });
  }, [data, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedData = sortedData.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    const header = ['측정 시각', '무기', '각속도(rad/s, 실측)', '추정 끝속도(m/s)', '등가 에너지(J)', '상대 타격지수'];
    const rows = sortedData.map((item) => [
      DATE_FORMATTER.format(new Date(item.timestamp)),
      weaponLabel(item.weapon),
      item.maxAngularVelocity.toFixed(2),
      item.derived ? item.derived.tipSpeed.toFixed(2) : '계산 불가',
      item.derived ? item.derived.energy.toFixed(2) : '계산 불가',
      item.derived ? item.derived.index.toFixed(1) : '계산 불가',
    ]);
    const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
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
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white" aria-live="polite">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700/20 border-t-teal-700" />
          측정 기록을 불러오는 중…
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center">
        <div>
          <p className="font-bold text-slate-800">조건에 맞는 측정 기록이 없습니다.</p>
          <p className="mt-1 text-sm text-slate-500">다른 무기를 선택해 다시 확인해 주세요.</p>
        </div>
      </div>
    );
  }

  const startItem = (visiblePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(visiblePage * ITEMS_PER_PAGE, data.length);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-slate-500"><strong className="text-slate-900">{data.length.toLocaleString('ko-KR')}개</strong> 기록</p>
        <div className="flex gap-2">
          <label htmlFor="mobile-sort" className="sr-only">정렬 기준</label>
          <select
            id="mobile-sort"
            name="record-sort"
            value={sortKey}
            onChange={(event) => handleSort(event.target.value as SortKey)}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 md:hidden"
          >
            <option value="timestamp">최신 측정순</option>
            {NUMERIC_COLUMNS.map((column) => <option key={column.key} value={column.key}>{column.shortLabel}순</option>)}
          </select>
          <button
            type="button"
            onClick={() => setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))}
            aria-label={sortOrder === 'asc' ? '내림차순으로 변경' : '오름차순으로 변경'}
            title={sortOrder === 'asc' ? '현재 오름차순' : '현재 내림차순'}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 md:hidden"
          >
            {sortOrder === 'asc' ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-800"
          >
            <FiDownload aria-hidden="true" /> CSV 내보내기
          </button>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <SortableHeader label="측정 시각" columnKey="timestamp" sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
              <th scope="col" className="px-5 py-3 text-left text-xs font-bold tracking-wide text-slate-500">무기</th>
              {NUMERIC_COLUMNS.map((column) => (
                <SortableHeader
                  key={column.key}
                  label={column.label}
                  unit={column.unit}
                  kind={column.kind}
                  columnKey={column.key}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{DATE_FORMATTER.format(new Date(item.timestamp))}</td>
                <td className="px-5 py-4"><WeaponBadge weapon={item.weapon} /></td>
                {NUMERIC_COLUMNS.map((column) => {
                  const value = valueFor(item, column.key);
                  return (
                    <td key={column.key} className="whitespace-nowrap px-5 py-4 tabular-nums text-sm font-semibold text-slate-800">
                      {value === null ? <span className="font-normal text-slate-400">계산 불가</span> : value.toFixed(column.key === 'index' ? 1 : 2)}
                      {value !== null && column.unit ? <span className="ml-1 text-xs font-normal text-slate-400">{column.unit}</span> : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {paginatedData.map((item) => (
          <article key={item.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <WeaponBadge weapon={item.weapon} />
              <time className="text-xs text-slate-500" dateTime={new Date(item.timestamp).toISOString()}>
                {DATE_FORMATTER.format(new Date(item.timestamp))}
              </time>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2">
              {NUMERIC_COLUMNS.map((column) => {
                const value = valueFor(item, column.key);
                return (
                  <div key={column.key} className="rounded-xl bg-slate-50 p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                      {column.shortLabel}
                      {column.kind ? <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${KIND_STYLE[column.kind]}`}>{column.kind}</span> : null}
                    </dt>
                    <dd className="mt-1 tabular-nums text-base font-bold text-slate-900">
                      {value === null ? <span className="text-xs font-normal text-slate-400">계산 불가</span> : value.toFixed(column.key === 'index' ? 1 : 2)}
                      {value !== null && column.unit ? <span className="ml-1 text-[10px] font-medium text-slate-400">{column.unit}</span> : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </article>
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" aria-label="측정 기록 페이지">
          <p className="text-center text-sm text-slate-500 sm:text-left">{startItem}–{endItem} / {data.length.toLocaleString('ko-KR')}</p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <button type="button" onClick={() => setCurrentPage(Math.max(1, visiblePage - 1))} disabled={visiblePage === 1} className="flex min-h-11 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              <FiChevronLeft aria-hidden="true" /> 이전
            </button>
            <span className="min-w-16 text-center tabular-nums text-sm font-semibold text-slate-600">{visiblePage} / {totalPages}</span>
            <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, visiblePage + 1))} disabled={visiblePage === totalPages} className="flex min-h-11 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              다음 <FiChevronRight aria-hidden="true" />
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function SortableHeader({
  label,
  unit,
  kind,
  columnKey,
  sortKey,
  sortOrder,
  onSort,
}: {
  label: string;
  unit?: string;
  kind?: Kind;
  columnKey: SortKey;
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === columnKey;
  return (
    <th scope="col" aria-sort={active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'} className="px-5 py-1 text-left">
      <button type="button" onClick={() => onSort(columnKey)} className="flex min-h-11 items-center gap-1.5 text-xs font-bold tracking-wide text-slate-500 transition-colors hover:text-slate-900">
        {label}{unit ? <span className="font-medium text-slate-400">({unit})</span> : null}
        {kind ? <span className={`rounded px-1.5 py-0.5 text-[9px] ${KIND_STYLE[kind]}`}>{kind}</span> : null}
        <SortIndicator active={active} order={sortOrder} />
      </button>
    </th>
  );
}
