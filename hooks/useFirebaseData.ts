'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MeasurementData, FilterOptions, Statistics, WeaponStatistics } from '@/types';

export function useFirebaseData() {
  const [data, setData] = useState<MeasurementData[]>([]);
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
        const loadedData: MeasurementData[] = [];
        snapshot.forEach((doc) => {
          const docData = doc.data();
          loadedData.push({
            id: doc.id,
            weapon: docData.weapon || 'unknown',
            maxEnergy: docData.rotationalEnergy || docData.maxEnergy || 0,
            maxAngularVelocity: docData.maxAngularVelocity || 0,
            timestamp: docData.timestamp instanceof Timestamp 
              ? docData.timestamp.toMillis() 
              : docData.timestamp || Date.now(),
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

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.weapon !== 'all' && item.weapon !== filters.weapon) {
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

  // 무기별 통계 계산
  const weaponStatistics: WeaponStatistics[] = useMemo(() => {
    const weaponGroups = data.reduce((groups, item) => {
      const weapon = item.weapon;
      if (!groups[weapon]) {
        groups[weapon] = [];
      }
      groups[weapon].push(item);
      return groups;
    }, {} as Record<string, MeasurementData[]>);

    return Object.entries(weaponGroups).map(([weapon, items]) => {
      const totalEnergy = items.reduce((sum, item) => sum + item.maxEnergy, 0);
      const totalAngularVelocity = items.reduce((sum, item) => sum + item.maxAngularVelocity, 0);
      return {
        weapon,
        totalCount: items.length,
        avgEnergy: totalEnergy / items.length,
        avgAngularVelocity: totalAngularVelocity / items.length,
        maxEnergy: Math.max(...items.map(i => i.maxEnergy)),
        maxAngularVelocity: Math.max(...items.map(i => i.maxAngularVelocity)),
      };
    });
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

