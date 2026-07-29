import type { DerivedValues, WeaponCode } from '@/lib/physics';

// 측정 데이터 타입 정의 (Firestore 원본에 대응)
export interface MeasurementData {
  id: string;
  /** Firestore에 저장된 원본 무기명. 정본은 한글('편곤' | '봉') */
  weapon: string;
  /** 정규화된 무기 코드. 특정 불가 시 null */
  weaponCode: WeaponCode | null;
  /** @deprecated 구 계수로 계산된 값. 표시에 사용하지 말 것 */
  maxEnergy: number;
  /** 최대 각속도 (rad/s) — 원본 실측값. 모든 파생값의 근거 */
  maxAngularVelocity: number;
  /** 측정 시간 */
  timestamp: number;
}

/** 측정 원본 + 현행 계수로 재계산한 파생값 */
export interface DerivedMeasurement extends MeasurementData {
  /** 재계산된 파생값. 무기 특정 불가 등으로 계산 불가하면 null */
  derived: DerivedValues | null;
}

// 필터 타입
export interface FilterOptions {
  weapon: 'all' | WeaponCode;
}

// 통계 타입
// 주의: 구 계수로 저장된 maxEnergy 기반 집계는 의도적으로 제외했다.
export interface Statistics {
  totalCount: number;
  /** 평균 각속도 (rad/s) — 실측 */
  avgAngularVelocity: number;
  /** 최대 각속도 (rad/s) — 실측 */
  maxAngularVelocity: number;
  /** 평균 추정 끝속도 (m/s) — 추정 */
  avgTipSpeed: number;
  /** 평균 등가 운동에너지 (J) — 현행 계수로 재계산 */
  avgEnergyRecomputed: number;
  /** 평균 상대 타격지수 (무단위) */
  avgIndex: number;
  /** 최대 상대 타격지수 (무단위) */
  maxIndex: number;
}

export interface WeaponStatistics extends Statistics {
  /** 정규화된 무기 코드 */
  weapon: WeaponCode;
}
