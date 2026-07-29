'use client';

import { FilterOptions } from '@/types';
import { WEAPON_CODES } from '@/lib/physics';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:w-auto">
      <label htmlFor="weapon-filter" className="shrink-0 pl-2 text-sm font-semibold text-slate-700">
        무기
      </label>
      <select
        id="weapon-filter"
        name="weapon"
        value={filters.weapon}
        onChange={(event) =>
          onFilterChange({ ...filters, weapon: event.target.value as FilterOptions['weapon'] })
        }
        className="min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 md:w-36"
      >
        <option value="all">전체 무기</option>
        {WEAPON_CODES.map((code) => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
    </div>
  );
}
