'use client';

import { FilterOptions } from '@/types';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
      <div className="flex items-center gap-2">
        <label className="text-purple-200 text-sm font-medium">카테고리:</label>
        <select
          value={filters.category}
          onChange={(e) =>
            onFilterChange({ ...filters, category: e.target.value as FilterOptions['category'] })
          }
          className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all" className="bg-slate-800">전체</option>
          <option value="elementary" className="bg-slate-800">초중등</option>
          <option value="secondary" className="bg-slate-800">고등/일반</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-purple-200 text-sm font-medium">유형:</label>
        <select
          value={filters.type}
          onChange={(e) =>
            onFilterChange({ ...filters, type: e.target.value as FilterOptions['type'] })
          }
          className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all" className="bg-slate-800">전체</option>
          <option value="infantry" className="bg-slate-800">보병용</option>
          <option value="cavalry" className="bg-slate-800">마상용</option>
        </select>
      </div>
    </div>
  );
}
