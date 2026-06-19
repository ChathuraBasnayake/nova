'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import AuthButton from '@/components/authButton'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Username and password are required.')
      return
    }

    setLoading(true)
    try {
      await login(username.trim(), password)
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials or connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[480px] w-full max-w-[1060px] overflow-hidden rounded-[56px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] lg:min-h-[660px]" style={{ background: 'rgba(18, 11, 32, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <aside
        aria-label="Nova Bank shell artwork"
        className="relative hidden w-[46.2%] shrink-0 overflow-hidden bg-[#1d0730] md:block"
      >
        <img
          src="/loginshellbg.png"
          alt=""
          className="size-full object-cover"
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/loginlogo.png"
            alt="Nova Bank"
            className="w-[38%] max-w-[276px]"
          />
        </div>
      </aside>

      <div className="flex flex-1 items-center justify-center px-8 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[450px] text-center"
        >
          <h1 className="mb-11 text-[2.45rem] font-bold text-balance" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LOGIN
          </h1>

          {error && (
            <div className="mb-6 rounded-lg p-3 text-sm font-semibold" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="relative">
              <label className="sr-only" htmlFor="login-account">
                Username
              </label>
              <img
                src="/person.png"
                alt=""
                aria-hidden="true"
                className="-translate-y-1/2 absolute left-8 top-1/2 size-6"
                style={{ filter: 'brightness(0) invert(0.7)' }}
              />
              <input
                id="login-account"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ height: '64px', width: '100%', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', padding: '0 2rem 0 5rem', fontSize: '1.125rem', color: '#f3f0f7', outline: 'none', transition: 'box-shadow 0.2s' }}
              />
            </div>

            <div className="relative">
              <label className="sr-only" htmlFor="login-password">
                Password
              </label>
              <img
                src="/password.png"
                alt=""
                aria-hidden="true"
                className="-translate-y-1/2 absolute left-8 top-1/2 size-6"
                style={{ filter: 'brightness(0) invert(0.7)' }}
              />
              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ height: '64px', width: '100%', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', padding: '0 2rem 0 5rem', fontSize: '1.125rem', color: '#f3f0f7', outline: 'none', transition: 'box-shadow 0.2s' }}
              />
            </div>
          </div>

          <div className="mt-3 text-right">
            <Link
              href="/reset-password"
              style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" disabled={loading} className="mt-8">
            {loading ? 'LOADING...' : 'SIGN IN'}
          </AuthButton>

          <p className="mt-6 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Don't have an account?
          </p>
          <Link href="/sign-up" className="text-2xl font-bold" style={{ color: '#d8b4fe' }}>
            SIGN UP
          </Link>
        </form>
      </div>
    </section>
  )
}
