'use client';

import { WeaponStatistics } from '@/types';
import { REFERENCE_WEAPON, THEORETICAL_RATIO } from '@/lib/physics';
import { FiArrowRight } from 'react-icons/fi';

interface WeaponComparisonProps {
  weaponStatistics: WeaponStatistics[];
}

/**
 * 이론 계수 비(동일 각속도 가정)와 실측 지수 비(학생 측정값 기준)를 나란히 비교한다.
 * 두 값의 차이가 연구 서술의 핵심 근거이므로 해설 문구는 실제 데이터에 따라 생성한다.
 */
export default function WeaponComparison({ weaponStatistics }: WeaponComparisonProps) {
  const staff = weaponStatistics.find((s) => s.weapon === REFERENCE_WEAPON);
  const flail = weaponStatistics.find((s) => s.weapon === '편곤');

  // 한쪽 무기 데이터가 없으면 비교가 성립하지 않으므로 카드를 숨긴다
  if (!staff || !flail || staff.totalCount === 0 || flail.totalCount === 0) {
    return null;
  }
  if (staff.avgIndex <= 0 || staff.avgAngularVelocity <= 0) {
    return null;
  }

  const measuredRatio = flail.avgIndex / staff.avgIndex;
  // 양수면 편곤 각속도가 그만큼 낮게 측정된 것
  const omegaDropPercent =
    ((staff.avgAngularVelocity - flail.avgAngularVelocity) / staff.avgAngularVelocity) * 100;

  const explanation = (() => {
    const gap = Math.abs(omegaDropPercent).toFixed(1);

    if (omegaDropPercent > 0.05) {
      return `편곤은 관성모멘트가 커서 각속도가 ${gap}% 낮게 측정되었고, 그 결과 실측 지수 비(${measuredRatio.toFixed(
        2
      )}배)가 이론 계수 비(${THEORETICAL_RATIO.toFixed(2)}배)보다 작게 나타났다.`;
    }

    if (omegaDropPercent < -0.05) {
      return `편곤의 평균 각속도가 ${REFERENCE_WEAPON}보다 ${gap}% 높게 측정되었고, 그 결과 실측 지수 비(${measuredRatio.toFixed(
        2
      )}배)가 이론 계수 비(${THEORETICAL_RATIO.toFixed(2)}배)보다 크게 나타났다.`;
    }

    return `두 무기의 평균 각속도가 거의 같게(차이 ${gap}%) 측정되어, 실측 지수 비(${measuredRatio.toFixed(
      2
    )}배)가 이론 계수 비(${THEORETICAL_RATIO.toFixed(2)}배)에 근접했다.`;
  })();

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      <h3 className="text-lg font-semibold text-white mb-5">이론값과 실측값 비교</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-sm text-purple-200">이론 계수 비</p>
          <p className="text-xs text-purple-300/70 mb-2">동일 각속도 가정</p>
          <p className="text-3xl font-bold text-cyan-300 font-mono">
            {THEORETICAL_RATIO.toFixed(2)}
            <span className="text-base font-normal text-purple-200 ml-1">배</span>
          </p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-sm text-purple-200">실측 지수 비</p>
          <p className="text-xs text-purple-300/70 mb-2">학생 측정값 기준</p>
          <p className="text-3xl font-bold text-emerald-300 font-mono">
            {measuredRatio.toFixed(2)}
            <span className="text-base font-normal text-purple-200 ml-1">배</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-5">
        <span className="text-sm text-purple-200">
          평균 각속도
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            실측
          </span>
        </span>
        <span className="text-sm text-white">
          {REFERENCE_WEAPON}{' '}
          <span className="font-mono font-semibold">
            {staff.avgAngularVelocity.toFixed(1)} rad/s
          </span>
        </span>
        <span className="text-white/20">│</span>
        <span className="text-sm text-white">
          편곤{' '}
          <span className="font-mono font-semibold">
            {flail.avgAngularVelocity.toFixed(1)} rad/s
          </span>
        </span>
      </div>

      <div className="flex gap-2 text-sm text-purple-100 leading-relaxed">
        <FiArrowRight className="mt-1 shrink-0 text-purple-300" />
        <p>{explanation}</p>
      </div>
    </div>
  );
}
