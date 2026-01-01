// 측정 데이터 타입 정의
export interface MeasurementData {
  id: string;
  category: 'elementary' | 'secondary';  // 초중등 / 고등,일반
  type: 'infantry' | 'cavalry';          // 보병용 / 마상용
  maxEnergy: number;                      // 최대 에너지 (J)
  maxAngularVelocity: number;             // 최대 각속도 (rad/s)
  timestamp: number;                      // 측정 시간
}

// 필터 타입
export interface FilterOptions {
  category: 'all' | 'elementary' | 'secondary';
  type: 'all' | 'infantry' | 'cavalry';
}

// 통계 타입
export interface Statistics {
  totalCount: number;
  avgEnergy: number;
  avgAngularVelocity: number;
  maxEnergy: number;
  maxAngularVelocity: number;
}
