'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { derive, normalizeWeapon, WeaponCode } from '@/lib/physics';
import { DerivedMeasurement, FilterOptions, Statistics, WeaponStatistics } from '@/types';

/** 대시보드에서 제외하는 무기 (철퇴) */
const EXCLUDED_WEAPONS = new Set(['mace', '철퇴']);

const EMPTY_STATISTICS: Statistics = {
  totalCount: 0,
  avgAngularVelocity: 0,
  maxAngularVelocity: 0,
  avgTipSpeed: 0,
  avgEnergyRecomputed: 0,
  avgIndex: 0,
  maxIndex: 0,
};

const avg = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;

const max = (values: number[]) => (values.length === 0 ? 0 : Math.max(...values));

/**
 * 측정 레코드 집합의 통계를 계산한다.
 *
 * 에너지는 DB의 maxEnergy(구 계수)가 아니라 derived의 재계산값만 사용한다.
 * 구 계수 값과 현행 계수 값이 섞이면 통계가 오염된다.
 */
function summarize(items: DerivedMeasurement[]): Statistics {
  if (items.length === 0) return EMPTY_STATISTICS;

  const omegas = items.map((item) => item.maxAngularVelocity);
  const derived = items
    .map((item) => item.derived)
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return {
    totalCount: items.length,
    avgAngularVelocity: avg(omegas),
    maxAngularVelocity: max(omegas),
    avgTipSpeed: avg(derived.map((d) => d.tipSpeed)),
    avgEnergyRecomputed: avg(derived.map((d) => d.energy)),
    avgIndex: avg(derived.map((d) => d.index)),
    maxIndex: max(derived.map((d) => d.index)),
  };
}

/**
 * Firestore `measurements` 컬렉션 실시간 구독.
 * 이 대시보드는 읽기 전용이다 — 쓰기/삭제 API를 사용하지 않는다.
 */
export function useFirebaseData() {
  const [data, setData] = useState<DerivedMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    weapon: 'all',
  });

  useEffect(() => {
    const q = query(collection(db, 'measurements'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedData: DerivedMeasurement[] = [];
        snapshot.forEach((doc) => {
          const docData = doc.data();
          const rawWeapon: string = docData.weapon || 'unknown';
          if (EXCLUDED_WEAPONS.has(rawWeapon)) {
            return;
          }

          const maxAngularVelocity = docData.maxAngularVelocity || 0;
          const weaponCode = normalizeWeapon(rawWeapon);

          loadedData.push({
            id: doc.id,
            weapon: rawWeapon,
            weaponCode,
            // 보존용 원본 필드. 표시에는 쓰지 않는다.
            maxEnergy: docData.rotationalEnergy || docData.maxEnergy || 0,
            maxAngularVelocity,
            timestamp:
              docData.timestamp instanceof Timestamp
                ? docData.timestamp.toMillis()
                : docData.timestamp || Date.now(),
            derived: derive(weaponCode, maxAngularVelocity),
          });
        });

        setData(loadedData);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading measurements:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 필터링된 데이터 — 정규화된 코드로 비교한다
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.weapon !== 'all' && item.weaponCode !== filters.weapon) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  // 전체 통계
  const statistics: Statistics = useMemo(() => summarize(filteredData), [filteredData]);

  // 무기별 통계 — 원본 표기가 달라도 정규화 코드로 하나로 묶인다
  const weaponStatistics: WeaponStatistics[] = useMemo(() => {
    const groups = new Map<WeaponCode, DerivedMeasurement[]>();
    for (const item of data) {
      if (!item.weaponCode) continue;
      const bucket = groups.get(item.weaponCode);
      if (bucket) bucket.push(item);
      else groups.set(item.weaponCode, [item]);
    }

    return Array.from(groups.entries()).map(([weapon, items]) => ({
      weapon,
      ...summarize(items),
    }));
  }, [data]);

  return {
    data: filteredData,
    allData: data,
    loading,
    error,
    filters,
    setFilters,
    statistics,
    weaponStatistics,
  };
}
