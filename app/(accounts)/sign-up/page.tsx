'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import AuthButton from '@/components/authButton'
import { useAuth } from '@/lib/auth-context'

export default function SignUpPage() {
  const { register } = useAuth()
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (
      !accountNumber.trim() ||
      !accountName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('All fields are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({
        username: accountNumber.trim(),
        fullName: accountName.trim(),
        email: email.trim(),
        password
      })
      setSuccess('Account created successfully! Redirecting to login...')
    } catch (err: any) {
      setError(err?.message || 'Failed to register account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto min-h-[700px] w-full max-w-[1100px] rounded-[58px] bg-white px-8 py-9 shadow-[0_1px_3px_0_rgba(0,0,0,0.30),0_4px_8px_3px_rgba(0,0,0,0.15)] lg:min-h-[820px] lg:px-14">
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto w-full max-w-[860px]"
      >
        <img
          src="/loginlogo.png"
          alt="Nova Bank"
          className="absolute left-0 top-0 hidden w-[128px] md:block"
        />

        <h1 className="mb-12 text-center text-[2.6rem] font-bold text-black text-balance">
          SIGN UP
        </h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-3 text-sm font-semibold text-red-700 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-100 p-3 text-sm font-semibold text-green-700 text-center">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Account Number */}
          <div className="grid items-center gap-4 md:grid-cols-[180px_1fr]">
            <label
              className="text-xl text-black"
              htmlFor="signup-account-number"
            >
              Account Number :
            </label>
            <input
              id="signup-account-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>

          {/* Account Name */}
          <div className="grid items-center gap-4 md:grid-cols-[180px_1fr]">
            <label className="text-xl text-black" htmlFor="signup-account-name">
              Account Name :
            </label>
            <input
              id="signup-account-name"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>

          {/* Email */}
          <div className="grid items-center gap-4 md:grid-cols-[180px_1fr]">
            <label className="text-xl text-black" htmlFor="signup-email">
              Email :
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>

          {/* Password */}
          <div className="grid items-center gap-4 md:grid-cols-[180px_1fr]">
            <label className="text-xl text-black" htmlFor="signup-password">
              Password :
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div className="grid items-center gap-4 md:grid-cols-[180px_1fr]">
            <label
              className="text-xl text-black"
              htmlFor="signup-confirm-password"
            >
              Confirm Password :
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <AuthButton type="submit" disabled={loading}>
            {loading ? 'SAVING...' : 'SIGN UP'}
          </AuthButton>
          <Link
            href="/login"
            className="text-sm font-bold text-black hover:underline"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </form>
    </section>
  )
}
