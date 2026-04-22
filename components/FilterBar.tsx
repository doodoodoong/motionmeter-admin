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
        <label className="text-purple-200 text-sm font-medium">무기:</label>
        <select
          value={filters.weapon}
          onChange={(e) =>
            onFilterChange({ ...filters, weapon: e.target.value as FilterOptions['weapon'] })
          }
          className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all" className="bg-slate-800">전체</option>
          <option value="flail" className="bg-slate-800">편곤</option>
          <option value="staff" className="bg-slate-800">봉</option>
          <option value="mace" className="bg-slate-800">철퇴</option>
        </select>
      </div>
    </div>
  );
}
