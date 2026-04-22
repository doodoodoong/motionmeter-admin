// 측정 데이터 타입 정의
export interface MeasurementData {
  id: string;
  weapon: 'flail' | 'staff' | 'mace' | string; // 편곤, 봉, 철퇴
  maxEnergy: number;                           // 최대 에너지 (J)
  maxAngularVelocity: number;                  // 최대 각속도 (rad/s)
  timestamp: number;                           // 측정 시간
}

// 필터 타입
export interface FilterOptions {
  weapon: 'all' | 'flail' | 'staff' | 'mace';
}

// 통계 타입
export interface Statistics {
  totalCount: number;
  avgEnergy: number;
  avgAngularVelocity: number;
  maxEnergy: number;
  maxAngularVelocity: number;
}

export interface WeaponStatistics extends Statistics {
  weapon: string;
}
