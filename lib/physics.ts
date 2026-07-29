/**
 * 회전운동 측정 물리 상수 및 파생값 계산
 *
 * 앱 레포 constants/physics.ts와 동일해야 함 (COEFF_VERSION v2-2026-07)
 *
 * 물리 상수는 반드시 이 파일에만 정의한다. 컴포넌트나 훅에 중복 정의하지 말 것.
 *
 * 설계 원칙
 * - 자이로가 실제로 측정하는 값은 손잡이(본체)의 각속도 omega 뿐이다. (실측)
 * - 보조체 끝속도와 등가 운동에너지는 환산계수를 적용한 추정값이다. (추정)
 * - 절대 물리량(뉴턴 단위 타격력) 주장은 근거가 없어 폐기했다.
 *   대신 기준무기(봉)를 100으로 하는 무단위 상대 타격지수를 사용한다.
 */

export const COEFF_VERSION = 'v2-2026-07';

/** 편곤 제원 (m, kg) */
export const FLAIL_SPEC = {
  /** 본체 (손잡이) */
  body: { length: 1.85, mass: 0.8 },
  /** 연결부 */
  joint: { length: 0.055, mass: 0.5 },
  /** 보조체 (타격부) */
  striker: { length: 0.47, mass: 0.7 },
} as const;

/** 전체 길이 (m) */
export const L_TOT = 2.375;

/** 총질량 (kg) */
export const TOTAL_MASS = 2.0;

/**
 * 무기 코드값.
 * Firestore에 저장되는 정본 값이며 한글이다. 이 값을 변경하면 앱이 저장한
 * 기존 문서와 매칭되지 않으므로 절대 바꾸지 말 것.
 */
export const WEAPON_CODES = ['편곤', '봉'] as const;
export type WeaponCode = (typeof WEAPON_CODES)[number];

/** 기준 무기 — 상대 타격지수의 분모 */
export const REFERENCE_WEAPON: WeaponCode = '봉';

/** 관성모멘트 I (kg·m²) */
export const MOMENT_OF_INERTIA: Record<WeaponCode, number> = {
  편곤: 5.894,
  봉: 3.76,
};

/** 끝속도 환산계수 k (무단위) */
export const TIP_SPEED_FACTOR: Record<WeaponCode, number> = {
  편곤: 1.3,
  봉: 1.0,
};

/**
 * 등가질량 m_eq = I / L_TOT²  (kg)
 * 봉 0.667kg, 편곤 1.045kg
 */
export const EQUIVALENT_MASS: Record<WeaponCode, number> = {
  편곤: MOMENT_OF_INERTIA['편곤'] / L_TOT ** 2,
  봉: MOMENT_OF_INERTIA['봉'] / L_TOT ** 2,
};

/**
 * 상대 타격계수 C = (I / I_기준) × k²  (무단위)
 * 봉 1.00, 편곤 2.65
 */
export const IMPACT_COEFFICIENT: Record<WeaponCode, number> = {
  편곤:
    (MOMENT_OF_INERTIA['편곤'] / MOMENT_OF_INERTIA[REFERENCE_WEAPON]) *
    TIP_SPEED_FACTOR['편곤'] ** 2,
  봉:
    (MOMENT_OF_INERTIA['봉'] / MOMENT_OF_INERTIA[REFERENCE_WEAPON]) *
    TIP_SPEED_FACTOR['봉'] ** 2,
};

/**
 * 이론 계수 비 — 동일 각속도를 가정했을 때 편곤이 기준무기 대비 몇 배인가.
 * 약 2.65
 */
export const THEORETICAL_RATIO =
  IMPACT_COEFFICIENT['편곤'] / IMPACT_COEFFICIENT[REFERENCE_WEAPON];

/** 상대 타격지수의 기준점: 봉을 이 각속도로 휘두를 때 지수 100 */
export const INDEX_REFERENCE_OMEGA = 10;

/**
 * 저장값 → 정본 무기 코드 정규화.
 *
 * 정본은 한글이지만, 과거/외부 데이터가 영문 코드로 들어올 수 있으므로 함께 흡수한다.
 * 알 수 없는 값은 null을 반환해 화면에서 '계산 불가'로 처리한다.
 * (기준무기 계수를 대신 적용해서는 안 된다.)
 */
const WEAPON_ALIASES: Record<string, WeaponCode> = {
  편곤: '편곤',
  flail: '편곤',
  봉: '봉',
  staff: '봉',
};

export function normalizeWeapon(raw: string | null | undefined): WeaponCode | null {
  if (!raw) return null;
  const key = String(raw).trim();
  return WEAPON_ALIASES[key] ?? WEAPON_ALIASES[key.toLowerCase()] ?? null;
}

/** 무기 표시 라벨 — 정본 코드가 이미 한글이므로 코드를 그대로 쓰고, 미상만 별도 처리 */
export function weaponLabel(raw: string | null | undefined): string {
  return normalizeWeapon(raw) ?? '알 수 없음';
}

export interface DerivedValues {
  /** 측정 최대 각속도 (rad/s) — 실측 */
  omega: number;
  /** 추정 끝속도 (m/s) = k · L_TOT · ω — 추정 */
  tipSpeed: number;
  /** 타격부 등가 운동에너지 (J) = ½ · m_eq · tipSpeed² — 추정 */
  energy: number;
  /** 상대 타격지수 (무단위) = C · ω² — 봉 10 rad/s 기준 100 */
  index: number;
}

/**
 * 실측 각속도에서 파생값 전부를 재계산한다.
 *
 * DB의 maxEnergy는 구 계수로 계산된 값이므로 절대 사용하지 않고,
 * 원본 실측값 maxAngularVelocity에서만 계산한다.
 *
 * 무기를 특정할 수 없거나 각속도가 유효하지 않으면 null.
 */
export function derive(
  weapon: string | null | undefined,
  omega: number
): DerivedValues | null {
  const code = normalizeWeapon(weapon);
  if (!code) return null;
  if (typeof omega !== 'number' || !Number.isFinite(omega) || omega < 0) return null;

  const tipSpeed = TIP_SPEED_FACTOR[code] * L_TOT * omega;

  return {
    omega,
    tipSpeed,
    energy: 0.5 * EQUIVALENT_MASS[code] * tipSpeed ** 2,
    index: IMPACT_COEFFICIENT[code] * omega ** 2,
  };
}
