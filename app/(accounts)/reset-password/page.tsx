'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import AuthButton from '@/components/authButton'
import { apiClient } from '@/lib/api-client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !otp.trim() || !password) {
      setError('All fields are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: password
        })
      })
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[500px] w-full max-w-[1100px] items-center justify-center rounded-[58px] bg-white px-8 py-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.30),0_4px_8px_3px_rgba(0,0,0,0.15)] lg:min-h-[684px]">
      <form onSubmit={handleSubmit} className="w-full max-w-[670px]">
        <h1 className="mb-16 text-center text-[2.6rem] font-bold text-black text-balance">
          RESET PASSWORD
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

        <div className="space-y-8">
          {/* Email */}
          <div className="grid items-center gap-4 md:grid-cols-[120px_1fr]">
            <label className="text-xl text-black" htmlFor="reset-email">
              Email:
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>

          {/* OTP */}
          <div className="grid items-center gap-4 md:grid-cols-[120px_250px]">
            <label className="text-xl text-black" htmlFor="reset-otp">
              OTP:
            </label>
            <input
              id="reset-otp"
              type="text"
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>

          {/* New Password */}
          <div className="grid items-center gap-4 md:grid-cols-[120px_250px]">
            <label className="text-xl text-black" htmlFor="reset-password">
              New Password:
            </label>
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[64px] rounded-[40px] border-0 bg-[#d9d9d9] px-7 text-lg text-black outline-none"
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <AuthButton type="submit" disabled={loading}>
            {loading ? 'RESETTING...' : 'RESET PASSWORD'}
          </AuthButton>
          <Link
            href="/login"
            className="text-sm font-bold text-black hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </section>
  )
}
