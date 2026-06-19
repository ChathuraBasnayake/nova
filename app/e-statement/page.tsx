'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import NotificationCenter from '@/components/notification-center'
import Sidebar from '@/components/sidebar'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface Account {
  id: number
  userId: number
  accountNumber: string
  accountName: string
  balance: number
}

interface Transaction {
  id: number
  fromAccount: string
  toAccount: string
  amount: number
  description: string
  status: string
  createdAt: string
}

interface StatementRow extends Transaction {
  runningBalance: number
  isDebit: boolean // is outflow
}

export default function EStatementPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<StatementRow[]>([])
  const [summary, setSummary] = useState({
    openingBalance: 0,
    totalCredits: 0,
    totalDebits: 0,
    closingBalance: 0
  })
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  // Fetch accounts on mount
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await apiClient<{ ok: boolean; data: Account[] }>(
          '/accounts'
        )
        if (res.ok && res.data && res.data.length > 0) {
          setAccounts(res.data)
          setSelectedAccount(res.data[0])
        }
      } catch (err) {
        console.error('Failed to load accounts:', err)
      } finally {
        setLoadingAccounts(false)
      }
    }
    fetchAccounts()
  }, [])

  // Fetch transactions and calculate summary on account change
  useEffect(() => {
    if (!selectedAccount) return
    const accNum = selectedAccount.accountNumber
    const bal = Number(selectedAccount.balance)

    async function fetchStatement() {
      setLoadingTransactions(true)
      try {
        const res = await apiClient<{ ok: boolean; data: Transaction[] }>(
          `/transactions?account=${accNum}`
        )

        if (res.ok && res.data) {
          const rawTx = [...res.data].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )

          let totalCredits = 0
          let totalDebits = 0
          const closingBalance = bal

          // Calculate running balance and totals
          // First, calculate opening balance

          // closingBalance = openingBalance + totalCredits - totalDebits
          // => openingBalance = closingBalance - totalCredits + totalDebits
          rawTx.forEach((tx) => {
            const amount = Number(tx.amount)
            if (tx.toAccount === accNum) {
              totalCredits += amount
            } else {
              totalDebits += amount
            }
          })

          const openingBalance = closingBalance - totalCredits + totalDebits

          let currentRunning = openingBalance
          const rowsWithRunningBalance: StatementRow[] = rawTx.map((tx) => {
            const amount = Number(tx.amount)
            const isOutflow = tx.fromAccount === accNum
            if (isOutflow) {
              currentRunning -= amount
            } else {
              currentRunning += amount
            }
            return {
              ...tx,
              runningBalance: currentRunning,
              isDebit: isOutflow
            }
          })

          // Reverse to show newest transactions first in the table
          setTransactions(rowsWithRunningBalance.reverse())
          setSummary({
            openingBalance,
            totalCredits,
            totalDebits,
            closingBalance
          })
        }
      } catch (err) {
        console.error('Failed to fetch statement transactions:', err)
      } finally {
        setLoadingTransactions(false)
      }
    }

    fetchStatement()
  }, [selectedAccount])

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = accounts.find(
      (acc) => acc.accountNumber === e.target.value
    )
    setSelectedAccount(selected || null)
  }

  // Format date range for statement
  const getStatementPeriod = () => {
    if (transactions.length === 0) return 'N/A'
    const dates = transactions.map((t) => new Date(t.createdAt).getTime())
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))
    return `${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const handleDownloadPdf = async () => {
    if (!selectedAccount) return
    try {
      const token = localStorage.getItem('session_token')
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(
        `${apiBase}/statements/pdf?account=${selectedAccount.accountNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (!res.ok) throw new Error('Failed to download statement')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `statement-${selectedAccount.accountNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading statement:', err)
      alert('Failed to download statement PDF.')
    }
  }

  return (
    <div className="min-h-screen bg-bg-light font-geist p-0">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-12">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">E-Statement</h2>
            <div className="flex items-center gap-3">
              <button className="topbar-icon" aria-label="search">
                <img src="/search.png" alt="search" />
              </button>
              <NotificationCenter />
              <Link
                href="/profile"
                className="size-12 overflow-hidden rounded-full border-2 border-gray-200 block"
              >
                <img
                  src={user?.avatarUrl || '/person-logo.png'}
                  alt="avatar"
                  className="size-full bg-white object-cover"
                />
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] px-10 py-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] mb-6" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--foreground)' }}>
            <div className="grid items-center gap-6 text-xl md:grid-cols-[auto_1fr]">
              <label htmlFor="statement-account-select">
                Select Bank Account:
              </label>
              {loadingAccounts ? (
                <div className="text-sm text-gray-500">Loading accounts...</div>
              ) : accounts.length > 0 ? (
                <select
                  id="statement-account-select"
                  value={selectedAccount?.accountNumber || ''}
                  onChange={handleAccountChange}
                  className="min-w-0 border-0 border-b border-white/20 bg-transparent px-2 py-1 text-xl outline-none" style={{ color: 'var(--foreground)' }}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountName} ({acc.accountNumber})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-red-600">
                  No bank accounts registered.
                </div>
              )}
            </div>
          </div>

          <section
            aria-label="Bank statement preview"
            className="mt-6 min-h-[560px] px-7 py-9 rounded-[32px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground)' }}
          >
            <div className="max-w-full">
              <div className="flex justify-between items-center mb-6">
                <img
                  src="/loginlogo.png"
                  alt="Nova Bank"
                  className="size-[86px] rounded-full object-cover bg-white"
                />
                <button
                  onClick={handleDownloadPdf}
                  className="bg-[#450043] hover:bg-[#5f005c] text-white font-semibold py-3 px-6 rounded-2xl shadow-md transition-all active:scale-95"
                >
                  Download PDF
                </button>
              </div>

              <div className="mt-5 text-sm leading-tight">
                <h2 className="font-bold text-lg mb-2">Bank Statement</h2>
                <dl className="grid grid-cols-[150px_1fr] gap-y-1">
                  <dt className="font-semibold text-gray-700">
                    Account Holder:
                  </dt>
                  <dd>{user?.fullName || 'N/A'}</dd>

                  <dt className="font-semibold text-gray-700">
                    Account Number:
                  </dt>
                  <dd>{selectedAccount?.accountNumber || 'N/A'}</dd>

                  <dt className="font-semibold text-gray-700">
                    Statement Period:
                  </dt>
                  <dd>{getStatementPeriod()}</dd>

                  <dt className="font-semibold text-gray-700">Branch:</dt>
                  <dd>Colombo Head Office</dd>
                </dl>
              </div>

              <div className="mt-9 text-sm">
                <h3 className="font-bold text-base mb-4">Account Summary</h3>
                <table className="w-full table-fixed border-collapse text-left bg-white rounded-xl shadow p-4">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-3 font-semibold text-gray-700">
                        Opening Balance
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        Total Credits
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        Total Debits
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        Closing Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3">
                        Rs.{' '}
                        {Number(summary.openingBalance).toLocaleString(
                          'en-US',
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="p-3 text-green-600 font-semibold">
                        +Rs.{' '}
                        {Number(summary.totalCredits).toLocaleString('en-US', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td className="p-3 text-red-600 font-semibold">
                        -Rs.{' '}
                        {Number(summary.totalDebits).toLocaleString('en-US', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td className="p-3 font-bold">
                        Rs.{' '}
                        {Number(summary.closingBalance).toLocaleString(
                          'en-US',
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-10 border-t border-black pt-9">
                <h3 className="text-sm font-bold text-base mb-4">
                  Transaction Details
                </h3>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm bg-white rounded-xl shadow overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="w-[15%] p-3 font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="w-[25%] p-3 font-semibold text-gray-700">
                          Description
                        </th>
                        <th className="w-[15%] p-3 font-semibold text-gray-700">
                          Reference ID
                        </th>
                        <th className="w-[15%] p-3 font-semibold text-gray-700">
                          Debit(+)
                        </th>
                        <th className="w-[15%] p-3 font-semibold text-gray-700">
                          Credit(-)
                        </th>
                        <th className="w-[15%] p-3 font-semibold text-gray-700">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingTransactions ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-6 text-center text-gray-500 font-semibold"
                          >
                            Loading transactions...
                          </td>
                        </tr>
                      ) : transactions.length > 0 ? (
                        transactions.map((t) => {
                          const dateStr = new Date(
                            t.createdAt
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                          return (
                            <tr
                              key={t.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="p-3 text-gray-600">{dateStr}</td>
                              <td className="p-3 font-medium">
                                {t.description || 'Transfer'}
                              </td>
                              <td className="p-3 text-gray-500">{t.id}</td>
                              <td className="p-3 text-green-600 font-semibold">
                                {!t.isDebit
                                  ? `+Rs. ${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                  : '-'}
                              </td>
                              <td className="p-3 text-red-600 font-semibold">
                                {t.isDebit
                                  ? `-Rs. ${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                  : '-'}
                              </td>
                              <td className="p-3 font-bold">
                                Rs.{' '}
                                {Number(t.runningBalance).toLocaleString(
                                  'en-US',
                                  { minimumFractionDigits: 2 }
                                )}
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-6 text-center text-gray-500 font-semibold"
                          >
                            No transaction history.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
