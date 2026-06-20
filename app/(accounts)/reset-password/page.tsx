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
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [otpCountdown, setOtpCountdown] = useState(0)
  const router = useRouter()

  // Handle OTP request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Email is required.')
      return
    }

    setLoading(true)
    try {
      await apiClient('/auth/request-reset-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim()
        })
      })
      setSuccess('OTP sent to your email! Valid for 10 minutes.')
      setStep('reset')

      // Start countdown timer
      let countdown = 600 // 10 minutes in seconds
      const interval = setInterval(() => {
        countdown--
        setOtpCountdown(countdown)
        if (countdown <= 0) {
          clearInterval(interval)
          setStep('request')
          setOtpCountdown(0)
        }
      }, 1000)
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="relative w-full py-8 md:py-12">
      {/* Background Glowing Orbs */}
      <div 
        className="absolute -left-12 -top-12 size-64 rounded-full blur-[100px] pointer-events-none opacity-40 animate-pulse"
        style={{
          background: 'radial-gradient(circle, var(--primary) 0%, rgba(157, 78, 221, 0) 70%)',
          animationDuration: '10s'
        }}
      />
      <div 
        className="absolute -right-16 -bottom-16 size-80 rounded-full blur-[120px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--primary-hover) 0%, rgba(181, 23, 158, 0) 70%)',
          animation: 'floatOrbReset 14s ease-in-out infinite'
        }}
      />

      <section 
        className="mx-auto flex min-h-[500px] w-full max-w-[960px] items-center justify-center rounded-[40px] px-6 py-10 lg:min-h-[600px] lg:px-16" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(20, 12, 38, 0.85) 0%, rgba(12, 8, 24, 0.9) 100%)', 
          backdropFilter: 'blur(30px)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <form onSubmit={step === 'request' ? handleRequestOtp : handleResetPassword} className="w-full max-w-[650px]">
          {/* Top Logo */}
          <div className="mb-10 flex flex-col items-center justify-center text-center">
            <img
              src="/loginlogo.png"
              alt="Nova Bank"
              className="w-full max-w-[160px] drop-shadow-[0_10px_20px_rgba(157,78,221,0.2)]"
            />
            <h1 className="mt-6 text-[2.25rem] font-black tracking-tight text-white uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Reset Password
            </h1>
            <p className="mt-2 text-sm font-medium text-white/50 tracking-wider">
              {step === 'request' ? 'Enter your email to receive an OTP' : 'Verify your OTP and set a new password'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div 
              className="mb-6 rounded-2xl p-4 text-sm font-semibold border text-center transition-all duration-300 animate-fadeIn" 
              style={{ 
                background: 'rgba(239, 68, 68, 0.08)', 
                borderColor: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              className="mb-6 rounded-2xl p-4 text-sm font-semibold border text-center transition-all duration-300 animate-fadeIn" 
              style={{ 
                background: 'rgba(0, 240, 255, 0.08)', 
                borderColor: 'rgba(0, 240, 255, 0.2)',
                color: '#a5f3fc',
                boxShadow: '0 4px 15px rgba(0, 240, 255, 0.1)'
              }}
            >
              {success}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Email - Always visible */}
            <div className="grid items-center gap-2 md:grid-cols-[160px_1fr]">
              <label 
                className="text-base font-bold tracking-wider text-white/70 uppercase md:text-right md:pr-6" 
                htmlFor="reset-email"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={step === 'reset'}
                className="h-[56px] rounded-full px-6 text-base font-medium outline-none transition-all duration-300 border border-white/85 text-white disabled:opacity-50"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)', 
                  background: 'rgba(255,255,255,0.04)',
                }}
              />
            </div>

            {/* OTP - Only visible in reset step */}
            {step === 'reset' && (
              <div className="grid items-center gap-2 md:grid-cols-[160px_1fr]">
                <label
                  className="text-base font-bold tracking-wider text-white/70 uppercase md:text-right md:pr-6"
                  htmlFor="reset-otp"
                >
                  OTP Code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  placeholder="Enter 6-digit OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="h-[56px] rounded-full px-6 text-base font-medium outline-none transition-all duration-300 border border-white/85 text-white text-center tracking-widest"
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                />
                {otpCountdown > 0 && (
                  <p className="text-xs text-white/50 md:col-span-2 md:text-right md:pr-6 mt-2">
                    OTP expires in: <span className="text-white/70 font-semibold">{formatTime(otpCountdown)}</span>
                  </p>
                )}
              </div>
            )}

            {/* New Password - Only visible in reset step */}
            {step === 'reset' && (
              <div className="grid items-center gap-2 md:grid-cols-[160px_1fr]">
                <label
                  className="text-base font-bold tracking-wider text-white/70 uppercase md:text-right md:pr-6"
                  htmlFor="reset-password"
                >
                  New Password
                </label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose new password"
                  className="h-[56px] rounded-full px-6 text-base font-medium outline-none transition-all duration-300 border border-white/85 text-white"
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Interactive Styling for Inputs */}
          <style dangerouslySetInnerHTML={{ __html: `
            input[id^="reset-"]:focus {
              border-color: var(--primary) !important;
              background: rgba(25, 16, 44, 0.8) !important;
              box-shadow: 0 0 20px -5px rgba(157, 78, 221, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
            }
          ` }} />

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col items-center gap-5">
            {step === 'request' ? (
              <>
                <AuthButton type="submit" disabled={loading} className="w-full max-w-[280px]">
                  {loading ? 'SENDING OTP...' : 'REQUEST OTP'}
                </AuthButton>
              </>
            ) : (
              <>
                <AuthButton type="submit" disabled={loading} className="w-full max-w-[280px]">
                  {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                </AuthButton>
                <button
                  type="button"
                  onClick={() => {
                    setStep('request')
                    setOtp('')
                    setPassword('')
                    setSuccess('')
                  }}
                  className="text-sm font-bold tracking-wide transition-all duration-200 hover:text-white"
                  style={{ color: '#d8b4fe' }}
                >
                  Back to Request OTP
                </button>
              </>
            )}

            <Link
              href="/login"
              className="text-sm font-bold tracking-wide transition-all duration-200 hover:text-white"
              style={{ color: '#d8b4fe' }}
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </section>

      {/* Embedded Animations and Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatOrbReset {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }
      ` }} />
    </div>
  )
}

