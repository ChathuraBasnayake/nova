'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '../../components/sidebar'
import { ChevronRight, Search } from '../../components/Icons'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import NotificationCenter from '@/components/notification-center'

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

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [activeAccount, setActiveAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const [payees, setPayees] = useState<any[]>([])

  // Fetch accounts & payees on mount
  useEffect(() => {
    async function fetchAccountsAndPayees() {
      try {
        const [accountsRes, payeesRes] = await Promise.all([
          apiClient<{ ok: boolean; data: Account[] }>('/accounts'),
          apiClient<{ ok: boolean; data: any[] }>('/payees').catch(() => ({ ok: false, data: [] })),
        ])

        if (accountsRes.ok && accountsRes.data && accountsRes.data.length > 0) {
          setAccounts(accountsRes.data)
          setActiveAccount(accountsRes.data[0])
        }
        if (payeesRes.ok && payeesRes.data) {
          setPayees(payeesRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoadingAccounts(false)
      }
    }
    fetchAccountsAndPayees()
  }, [])

  // Fetch transactions for the active account
  useEffect(() => {
    if (!activeAccount) return
    const accNum = activeAccount.accountNumber
    async function fetchTransactions() {
      setLoadingTransactions(true)
      try {
        const res = await apiClient<{ ok: boolean; data: Transaction[] }>(
          `/transactions?account=${accNum}`
        )
        if (res.ok && res.data) {
          setTransactions(res.data.slice(0, 5)) // Limit to top 5 recent
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
      } finally {
        setLoadingTransactions(false)
      }
    }
    fetchTransactions()
  }, [activeAccount])


  // Cycle to next account on card click
  const handleNextAccount = () => {
    if (accounts.length <= 1 || !activeAccount) return
    const currentIndex = accounts.findIndex(acc => acc.id === activeAccount.id)
    const nextIndex = (currentIndex + 1) % accounts.length
    setActiveAccount(accounts[nextIndex])
  }

  return (
    <main className="dashboard">
      <Sidebar />

      <section className="content">
        {/* Header */}
        <header className="content-header">
          <h1 className="page-title">Dashboard</h1>
          <div className="header-actions">
            <Search size={24} />
            <NotificationCenter />
            <button onClick={logout} className="logout-button">
              LOG OUT
            </button>
            <Link href="/profile">
              <img src={user?.avatarUrl || '/person-logo.png'} alt="profile" className="avatar" />
            </Link>
          </div>
        </header>

        {/* Top Section */}
        <div className="top-section">
          {/* Welcome/Balance Card */}
          <div className="welcome-card">
            <h2 className="welcome-title">Welcome back, {user?.fullName || 'User'}!</h2>
            
            {loadingAccounts ? (
              <div className="balance-card-loading">Loading accounts...</div>
            ) : activeAccount ? (
              <div className="balance-card" onClick={handleNextAccount} style={{ cursor: 'pointer' }}>
                <p className="balance-label">{activeAccount.accountName}</p>
                <p className="balance-amount">
                  Rs. {Number(activeAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <ChevronRight className="balance-chevron" size={30} />
              </div>
            ) : (
              <div className="balance-card-empty">No active bank accounts found.</div>
            )}

            <div className="carousel-dots">
              {accounts.map((acc, idx) => (
                <span
                  key={acc.id}
                  onClick={() => setActiveAccount(acc)}
                  className={`dot ${activeAccount && activeAccount.id === acc.id ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
            <img
              src="/dashboard-logo.png"
              alt="woman"
              className="welcome-image"
            />
          </div>

          {/* Payees Card */}
          <div className="payees-card">
            <h3 className="payees-title">Saved Payees</h3>
            <div className="payees-list">
              {payees.length > 0 ? (
                payees.slice(0, 3).map((p, idx) => {
                  const parts = p.name.split(' ')
                  const firstName = parts[0] || 'Payee'
                  const lastName = parts.slice(1).join(' ') || ''
                  return (
                    <div key={p.id || idx} className="payee-item">
                      <img src="/person-logo.png" alt="user" className="avatar" />
                      <div className="payee-info">
                        <p>{firstName}</p>
                        <p>{lastName}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <>
                  <div className="payee-item">
                    <img src="/person-logo.png" alt="user" className="avatar" />
                    <div className="payee-info">
                      <p>Dilara</p>
                      <p>Perera</p>
                    </div>
                  </div>
                  <div className="payee-item">
                    <img src="/person-logo.png" alt="user" className="avatar" />
                    <div className="payee-info">
                      <p>Kasun</p>
                      <p>Wickramanayake</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="view-all">
              View all
              <ChevronRight size={15} />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="transactions-section">
          <h2 className="transactions-title">
            Recent Transactions {activeAccount ? `(${activeAccount.accountNumber})` : ''}
          </h2>
          <div className="transactions-card">
            {loadingTransactions ? (
              <div className="tx-status-msg">Loading transactions...</div>
            ) : transactions.length > 0 ? (
              transactions.map((t) => {
                const isDebit = activeAccount && t.fromAccount === activeAccount.accountNumber
                const prefix = isDebit ? '-' : '+'
                const amountClass = isDebit ? 'transaction-amount debit' : 'transaction-amount credit'
                const dateStr = new Date(t.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                return (
                  <div key={t.id} className="transaction-item">
                    <img src="/person-logo.png" alt="user" className="avatar" />
                    <span className="transaction-date">{dateStr}</span>
                    <span className="transaction-account">
                      {isDebit ? `To: ${t.toAccount}` : `From: ${t.fromAccount}`}
                    </span>
                    <span className={amountClass}>
                      {prefix}Rs. {Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="transaction-status">{t.status}</span>
                  </div>
                )
              })
            ) : (
              <div className="tx-status-msg">No transactions found for this account.</div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .dashboard {
          width: 100vw;
          min-height: 100vh;
          background: #f1f1f1;
          display: flex;
          gap: 1.5rem;
          overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .content {
          flex: 1;
          padding: 1.5rem 1.25rem;
          overflow-y: auto;
          min-width: 0;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: black;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .logout-button {
          background: #450043;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .logout-button:hover {
          background: #60005d;
        }

        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
        }

        .top-section {
          margin-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .welcome-card {
          width: 640px;
          max-width: 100%;
          height: 230px;
          background: #e7e1e8;
          border-radius: 18px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .welcome-title {
          font-size: 18px;
          padding: 0.75rem 1rem 0;
          color: black;
        }

        .balance-card {
          position: absolute;
          left: 5rem;
          top: 60px;
          width: 380px;
          max-width: calc(100% - 2rem);
          height: 120px;
          background: black;
          border-radius: 14px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 1rem;
          user-select: none;
        }

        .balance-card-loading,
        .balance-card-empty {
          position: absolute;
          left: 5rem;
          top: 60px;
          width: 380px;
          max-width: calc(100% - 2rem);
          height: 120px;
          background: #d1c8d3;
          border-radius: 14px;
          color: #450043;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 600;
        }

        .balance-label {
          font-size: 21px;
        }

        .balance-amount {
          color: #a7d93a;
          font-size: 20px;
          margin-top: 0.25rem;
        }

        .balance-chevron {
          position: absolute;
          right: 1rem;
        }

        .carousel-dots {
          position: absolute;
          bottom: 1.25rem;
          left: 160px;
          display: flex;
          gap: 0.5rem;
        }

        .dot {
          width: 6px;
          height: 3px;
          background: #9ca3af;
          border-radius: 2px;
          transition: all 0.2s;
        }
        .dot.active {
          width: 50px;
          background: #6060d5;
        }

        .welcome-image {
          position: absolute;
          right: 0;
          bottom: 0;
          height: 250px;
          object-fit: cover;
        }

        .payees-card {
          width: 270px;
          height: 230px;
          background: white;
          border-radius: 18px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          color: black;
          flex: 1;
          min-width: 200px;
        }

        .payees-title {
          font-weight: 600;
          text-align: center;
          font-size: 1rem;
        }

        .payees-list {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .payee-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .payee-info {
          font-size: 13px;
          line-height: 1.3;
        }
        .payee-info p:first-child {
          font-weight: 500;
        }
        .payee-info p:last-child {
          color: #4b5563;
        }

        .view-all {
          text-align: right;
          margin-top: 1rem;
          font-size: 13px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
        }

        .transactions-section {
          margin-top: 0.75rem;
          color: black;
        }

        .transactions-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .transactions-card {
          background: white;
          border-radius: 22px;
          box-shadow: 18px 18px 12px rgba(0, 0, 0, 0.15);
          padding: 1.25rem;
          width: 1000px;
          min-height: 180px;
          max-width: 100%;
          overflow-x: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .transaction-date,
        .transaction-account,
        .transaction-amount {
          font-size: 0.95rem;
        }

        .transaction-amount.debit {
          color: #e11d48;
          font-weight: 600;
        }

        .transaction-amount.credit {
          color: #16a34a;
          font-weight: 600;
        }

        .transaction-status {
          background: #d5f1cb;
          padding: 0.25rem 1.5rem;
          border-radius: 4px;
          color: black;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .tx-status-msg {
          color: #4b5563;
          font-weight: 500;
          text-align: center;
          padding: 2rem 0;
        }

        @media (max-width: 1024px) {
          .welcome-card {
            width: 100%;
          }
          .transactions-card {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            flex-direction: column;
            gap: 0;
          }

          .content {
            padding: 1rem;
          }

          .page-title {
            font-size: 22px;
          }

          .top-section {
            flex-direction: column;
            align-items: stretch;
          }

          .welcome-card {
            height: 220px;
          }
          .balance-card {
            width: calc(100% - 2rem);
            left: 1rem;
            top: 50px;
            height: 100px;
          }
          .balance-label {
            font-size: 18px;
          }
          .balance-amount {
            font-size: 18px;
          }
          .welcome-image {
            height: 160px;
          }
          .carousel-dots {
            left: 1.5rem;
            bottom: 0.75rem;
          }

          .payees-card {
            width: 100%;
            height: auto;
            min-height: 200px;
          }

          .transactions-card {
            padding: 1rem;
          }

          .transaction-item {
            flex-wrap: wrap;
            gap: 0.5rem;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 0.75rem;
          }
          .transaction-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .transaction-status {
            padding: 0.15rem 1rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .header-actions {
            gap: 0.75rem;
          }
          .avatar {
            width: 35px;
            height: 35px;
          }
          .page-title {
            font-size: 20px;
          }
          .balance-label {
            font-size: 16px;
          }
          .balance-amount {
            font-size: 16px;
          }
          .welcome-card {
            height: 200px;
          }
          .welcome-image {
            height: 130px;
          }
          .transaction-date,
          .transaction-account,
          .transaction-amount {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </main>
  )
}
