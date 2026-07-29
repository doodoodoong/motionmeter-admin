'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiBarChart2, FiLock, FiLogIn, FiMail } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (signInError) {
      setError('로그인하지 못했습니다. 이메일과 비밀번호를 다시 확인해 주세요.');
      console.error(signInError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
            <FiBarChart2 size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold">상대 타격지수 데이터 비교</p>
            <p className="text-xs text-slate-400">편곤·봉 회전운동 측정 프로젝트</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-bold tracking-[0.16em] text-teal-300">MEASURE · COMPARE · UNDERSTAND</p>
          <h2 className="mt-5 text-balance text-5xl font-bold leading-tight tracking-tight">
            움직임을 측정하고, 차이를 이해합니다.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            편곤과 봉의 회전 속도를 같은 기준으로 비교하고 학생들이 이해하기 쉬운 결과로 확인하세요.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">상대 타격지수 데이터 비교 · 관리자 대시보드</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
              <FiBarChart2 size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="break-keep font-bold leading-tight text-slate-950">상대 타격지수 데이터 비교</p>
              <p className="text-xs text-slate-500">편곤·봉 회전운동 측정 결과</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-bold text-teal-700">관리자 전용</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">대시보드 로그인</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">등록된 관리자 계정으로 측정 결과를 확인하세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                >
                  {error}
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">이메일</label>
                <div className="relative mt-2 focus-within:text-teal-700">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    spellCheck={false}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="예: admin@example.com…"
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-950 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">비밀번호</label>
                <div className="relative mt-2 focus-within:text-teal-700">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="비밀번호 입력…"
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-950 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-bold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                    로그인 중…
                  </>
                ) : (
                  <>
                    <FiLogIn aria-hidden="true" /> 로그인 <FiArrowRight aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
