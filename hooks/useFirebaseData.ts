'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MeasurementData, FilterOptions, Statistics } from '@/types';

// Firestore 서브컬렉션 경로들
const COLLECTION_PATHS = [
  { path: 'measurements/elementary/infantry', category: 'elementary' as const, type: 'infantry' as const },
  { path: 'measurements/elementary/cavalry', category: 'elementary' as const, type: 'cavalry' as const },
  { path: 'measurements/secondary/infantry', category: 'secondary' as const, type: 'infantry' as const },
  { path: 'measurements/secondary/cavalry', category: 'secondary' as const, type: 'cavalry' as const },
];

export function useFirebaseData() {
  const [data, setData] = useState<MeasurementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    type: 'all',
  });

  useEffect(() => {
    const allData: Map<string, MeasurementData> = new Map();
    let loadedCount = 0;

    const unsubscribes = COLLECTION_PATHS.map(({ path, category, type }) => {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'));

      return onSnapshot(
        q,
        (snapshot) => {
          // 해당 경로의 기존 데이터 제거
          for (const [key] of allData) {
            if (key.startsWith(path)) {
              allData.delete(key);
            }
          }

          // 새 데이터 추가
          snapshot.forEach((doc) => {
            const docData = doc.data();
            allData.set(`${path}/${doc.id}`, {
              id: doc.id,
              category,
              type,
              maxEnergy: docData.maxEnergy || 0,
              maxAngularVelocity: docData.maxAngularVelocity || 0,
              timestamp: docData.timestamp instanceof Timestamp 
                ? docData.timestamp.toMillis() 
                : docData.timestamp || Date.now(),
            });
          });

          loadedCount++;
          if (loadedCount >= COLLECTION_PATHS.length) {
            // 모든 컬렉션이 로드되면 데이터 정렬 후 설정
            const sortedData = Array.from(allData.values()).sort(
              (a, b) => b.timestamp - a.timestamp
            );
            setData(sortedData);
            setLoading(false);
          }
        },
        (err) => {
          console.error(`Error loading ${path}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  // 통계 계산
  const statistics: Statistics = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalCount: 0,
        avgEnergy: 0,
        avgAngularVelocity: 0,
        maxEnergy: 0,
        maxAngularVelocity: 0,
      };
    }

    const totalEnergy = filteredData.reduce((sum, item) => sum + item.maxEnergy, 0);
    const totalAngularVelocity = filteredData.reduce(
      (sum, item) => sum + item.maxAngularVelocity,
      0
    );

    return {
      totalCount: filteredData.length,
      avgEnergy: totalEnergy / filteredData.length,
      avgAngularVelocity: totalAngularVelocity / filteredData.length,
      maxEnergy: Math.max(...filteredData.map((item) => item.maxEnergy)),
      maxAngularVelocity: Math.max(...filteredData.map((item) => item.maxAngularVelocity)),
    };
  }, [filteredData]);

  return {
    data: filteredData,
    allData: data,
    loading,
    error,
    filters,
    setFilters,
    statistics,
  };
}
