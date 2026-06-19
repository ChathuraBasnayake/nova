'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import { Bell, Search, Plus, Trash2, Edit2, X } from '@/components/Icons'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface SpendingItem {
  category: string
  amount: number
}

interface TrendItem {
  month: string
  amount: number
}

interface BudgetItem {
  id: number
  category: string
  limit: number
  spent: number
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#ff6b6b',
  Bills: '#4dadf7',
  Shopping: '#ffd43b',
  Entertainment: '#d6336c',
  Transport: '#20c997',
  Others: '#ae3ec9',
}

const CATEGORY_LIST = ['Food', 'Bills', 'Shopping', 'Entertainment', 'Transport', 'Others']

export default function SmartSpendPage() {
  const { user, logout } = useAuth()
  const [spendingSummary, setSpendingSummary] = useState<SpendingItem[]>([])
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [aiInsight, setAiInsight] = useState('Analyzing spending data and generating recommendations...')
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Food')
  const [budgetLimit, setBudgetLimit] = useState('')
  const [modalError, setModalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Active chart tooltip/hover states
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryRes, trendsRes, budgetsRes, insightsRes] = await Promise.all([
        apiClient<{ ok: boolean; data: SpendingItem[] }>('/insights/spending-summary'),
        apiClient<{ ok: boolean; data: TrendItem[] }>('/insights/trends'),
        apiClient<{ ok: boolean; data: BudgetItem[] }>('/insights/budgets'),
        apiClient<{ ok: boolean; summary: string }>('/ai/insights').catch(() => ({ ok: false, summary: '' })),
      ])
      
      if (summaryRes.ok) setSpendingSummary(summaryRes.data)
      if (trendsRes.ok) setTrends(trendsRes.data)
      if (budgetsRes.ok) setBudgets(budgetsRes.data)
      if (insightsRes.ok && insightsRes.summary) {
        setAiInsight(insightsRes.summary)
      } else {
        setAiInsight('Your monthly expenses look stable. Create budget limits to get personalized advice!')
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    const limit = Number(budgetLimit)
    
    if (isNaN(limit) || limit <= 0) {
      setModalError('Please enter a valid positive number.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiClient<{ ok: boolean }>('/budgets', {
        method: 'POST',
        body: JSON.stringify({
          category: selectedCategory,
          monthlyLimit: limit,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setBudgetLimit('')
        fetchData()
      }
    } catch (err: any) {
      setModalError(err?.message || 'Failed to save budget.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBudget = async (id: number) => {
    if (id === 0) return // Cannot delete unsaved placeholder budget
    if (!confirm('Are you sure you want to reset this budget limit?')) return
    
    try {
      const res = await apiClient<{ ok: boolean }>(`/budgets/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Failed to delete budget:', err)
    }
  }

  // Aggregate values
  const totalSpending = spendingSummary.reduce((acc, item) => acc + Number(item.amount), 0)
  
  // Donut chart stroke details
  const radius = 36
  const circ = 2 * Math.PI * radius
  let accumulatedPercent = 0

  // SVG Trend graph details
  const maxTrendVal = trends.length > 0 ? Math.max(...trends.map(t => Number(t.amount)), 1000) * 1.15 : 1000
  const trendPoints = trends.map((t, idx) => {
    const x = 50 + idx * 80
    const y = 170 - (Number(t.amount) / maxTrendVal) * 140
    return { x, y, label: t.month, value: t.amount }
  })
  
  const pathD = trendPoints.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  const fillD = trendPoints.length > 0 
    ? `${pathD} L ${trendPoints[trendPoints.length - 1].x} 170 L ${trendPoints[0].x} 170 Z`
    : ''

  return (
    <main className="smart-spend-layout">
      <Sidebar />

      <section className="content">
        <header className="content-header">
          <h1 className="page-title">Smart Spend</h1>
          <div className="header-actions">
            <Search size={24} />
            <Bell size={24} />
            <button onClick={logout} className="logout-button">
              LOG OUT
            </button>
            <Link href="/profile">
              <img src={user?.avatarUrl || '/person-logo.png'} alt="profile" className="avatar" />
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your financial spending analysis...</p>
          </div>
        ) : (
          <div className="analytics-grid">
            {/* Left side: Charts */}
            <div className="charts-panel">
              {/* Spending Summary Card */}
              <div className="card breakdown-card">
                <h3 className="card-title">Monthly Spending Breakdown</h3>
                {totalSpending === 0 ? (
                  <div className="empty-chart-msg">
                    No debit transactions found in the current month. Perform transfers or payments to view analytics!
                  </div>
                ) : (
                  <div className="donut-section">
                    <div className="donut-chart-container">
                      <svg width="220" height="220" viewBox="0 0 100 100" className="donut-svg">
                        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f1f1" strokeWidth="8" />
                        {spendingSummary.map((item) => {
                          const percent = (Number(item.amount) / totalSpending) * 100
                          const strokeOffset = circ - (percent / 100) * circ
                          const rotation = (accumulatedPercent / 100) * 360 - 90
                          accumulatedPercent += percent

                          return (
                            <circle
                              key={item.category}
                              cx="50"
                              cy="50"
                              r={radius}
                              fill="transparent"
                              stroke={CATEGORY_COLORS[item.category] || '#ae3ec9'}
                              strokeWidth="9"
                              strokeDasharray={circ}
                              strokeDashoffset={strokeOffset}
                              transform={`rotate(${rotation} 50 50)`}
                              className={`donut-segment ${activeCategory === item.category ? 'active' : ''}`}
                              onMouseEnter={() => setActiveCategory(item.category)}
                              onMouseLeave={() => setActiveCategory(null)}
                              style={{ transition: 'stroke-width 0.2s, stroke-dashoffset 0.2s', cursor: 'pointer' }}
                            />
                          )
                        })}
                        {/* Center Text */}
                        <g className="donut-center-text">
                          <text x="50" y="46" textAnchor="middle" className="center-amount">
                            Rs. {totalSpending.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </text>
                          <text x="50" y="62" textAnchor="middle" className="center-label">
                            {activeCategory ? activeCategory : 'Total Spent'}
                          </text>
                          {activeCategory && (
                            <text x="50" y="74" textAnchor="middle" className="center-sublabel">
                              Rs. {spendingSummary.find(s => s.category === activeCategory)?.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </text>
                          )}
                        </g>
                      </svg>
                    </div>

                    <div className="donut-legend">
                      {spendingSummary.map((item) => {
                        const percent = ((Number(item.amount) / totalSpending) * 100).toFixed(1)
                        return (
                          <div 
                            key={item.category} 
                            className={`legend-item ${activeCategory === item.category ? 'highlight' : ''}`}
                            onMouseEnter={() => setActiveCategory(item.category)}
                            onMouseLeave={() => setActiveCategory(null)}
                          >
                            <span className="dot" style={{ backgroundColor: CATEGORY_COLORS[item.category] }}></span>
                            <span className="label">{item.category}</span>
                            <span className="value">Rs. {Number(item.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })} ({percent}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Trends Card */}
              <div className="card trends-card">
                <h3 className="card-title">Spending History (Last 6 Months)</h3>
                {trends.length === 0 ? (
                  <div className="empty-chart-msg">Insufficient trend data.</div>
                ) : (
                  <div className="trends-svg-container">
                    <svg viewBox="0 0 500 200" className="trends-svg">
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9a5c97" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#9a5c97" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Gridlines */}
                      <line x1="50" y1="170" x2="450" y2="170" stroke="#eee" strokeWidth="1" />
                      <line x1="50" y1="100" x2="450" y2="100" stroke="#eee" strokeWidth="1" strokeDasharray="4" />
                      <line x1="50" y1="30" x2="450" y2="30" stroke="#eee" strokeWidth="1" strokeDasharray="4" />
                      
                      {/* Area Fill */}
                      {fillD && <path d={fillD} fill="url(#trendGrad)" />}
                      
                      {/* Trend Line */}
                      {pathD && <path d={pathD} fill="none" stroke="#450043" strokeWidth="3.5" strokeLinecap="round" />}
                      
                      {/* Interaction Nodes */}
                      {trendPoints.map((p) => (
                        <g key={p.label} className="trend-node">
                          <circle cx={p.x} cy={p.y} r="5" fill="#450043" stroke="#fff" strokeWidth="2.5" />
                          <circle cx={p.x} cy={p.y} r="10" fill="transparent" style={{ cursor: 'pointer' }} />
                          <text x={p.x} y={p.y - 12} textAnchor="middle" className="node-tooltip">
                            Rs. {p.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </text>
                          <text x={p.x} y="190" textAnchor="middle" className="node-axis-label">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Budgets */}
            <div className="budgets-panel">
              <div className="card budget-limits-card">
                <div className="budget-header">
                  <h3 className="card-title">Category Budgets</h3>
                  <button onClick={() => setIsModalOpen(true)} className="add-budget-btn">
                    <Plus size={16} /> SET BUDGET
                  </button>
                </div>

                <div className="budgets-list">
                  {budgets.map((b) => {
                    const isExceeded = b.limit > 0 && b.spent > b.limit
                    const isAlertRange = b.limit > 0 && !isExceeded && (b.spent / b.limit) >= 0.8
                    const percent = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0
                    
                    let progressColor = '#4dadf7' // blue
                    if (isExceeded) progressColor = '#ff6b6b' // red
                    else if (isAlertRange) progressColor = '#ffd43b' // yellow

                    return (
                      <div key={b.category} className="budget-item">
                        <div className="budget-item-info">
                          <div>
                            <span className="category-tag" style={{ borderLeftColor: CATEGORY_COLORS[b.category] || '#ae3ec9' }}>
                              {b.category}
                            </span>
                            {isExceeded && <span className="warning-badge">Exceeded!</span>}
                            {isAlertRange && <span className="alert-badge">80% Spent</span>}
                          </div>
                          <div className="budget-controls">
                            {b.id > 0 && (
                              <button onClick={() => handleDeleteBudget(b.id)} className="delete-btn" title="Reset Budget">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="budget-bar-container">
                          <div className="budget-bar-fill" style={{ width: `${percent}%`, backgroundColor: progressColor }} />
                        </div>

                        <div className="budget-amounts">
                          <span>Spent: <strong>Rs. {Number(b.spent).toLocaleString('en-US', { minimumFractionDigits: 0 })}</strong></span>
                          <span>
                            {b.limit > 0 ? (
                              <>Limit: <strong>Rs. {Number(b.limit).toLocaleString('en-US', { minimumFractionDigits: 0 })}</strong></>
                            ) : (
                              <span className="no-limit" onClick={() => {
                                setSelectedCategory(b.category)
                                setIsModalOpen(true)
                              }}>Set monthly limit</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Smart Spend AI Insights */}
              <div className="card ai-insights-card">
                <h3 className="card-title flex items-center gap-2">
                  <span className="sparkle">✨</span> AI Spending Assistant
                </h3>
                <p className="ai-summary-text">
                  {aiInsight}
                </p>
                <div className="ai-footer">
                  <button 
                    className="ask-ai-link" 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-nova-chat'))}
                  >
                    Ask Nova AI advisor for custom tips →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Configure Category Budget</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveBudget} className="modal-form">
              {modalError && <div className="modal-error">{modalError}</div>}
              
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="modal-select"
                >
                  {CATEGORY_LIST.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monthly Limit (Rs.)</label>
                <input 
                  type="text" 
                  value={budgetLimit} 
                  onChange={(e) => setBudgetLimit(e.target.value)} 
                  placeholder="e.g. 15000"
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="cancel-btn"
                  disabled={submitting}
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'SAVING...' : 'SAVE LIMIT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .smart-spend-layout {
          width: 100vw;
          min-height: 100vh;
          background: #f1f1f1;
          display: flex;
          gap: 1.5rem;
          overflow: hidden;
          font-family: var(--font-bai, 'Bai Jamjuree'), system-ui, -apple-system, sans-serif;
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
          margin-bottom: 2rem;
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

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 350px;
          color: #4b5563;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #ddd;
          border-top-color: #9a5c97;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .charts-panel, .budgets-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card {
          background: white;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          color: black;
          border: 1px solid rgba(0,0,0,0.03);
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #450043;
          margin-bottom: 1.25rem;
        }

        .donut-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .donut-chart-container {
          position: relative;
          width: 220px;
          height: 220px;
          flex-shrink: 0;
        }

        .donut-svg {
          transform: rotate(-90deg);
        }

        .donut-center-text {
          transform: rotate(90deg);
          transform-origin: 50px 50px;
        }

        .center-amount {
          font-size: 10px;
          font-weight: 800;
          fill: #450043;
        }

        .center-label {
          font-size: 7px;
          fill: #777;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .center-sublabel {
          font-size: 6px;
          fill: #20c997;
          font-weight: 700;
        }

        .donut-segment {
          transition: stroke-width 0.3s;
        }

        .donut-segment:hover, .donut-segment.active {
          stroke-width: 12;
        }

        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          min-width: 180px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          padding: 6px 8px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .legend-item.highlight {
          background-color: #f7f3f7;
        }

        .legend-item .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-item .label {
          font-weight: 600;
          color: #4b5563;
        }

        .legend-item .value {
          margin-left: auto;
          color: #777;
        }

        .empty-chart-msg {
          text-align: center;
          color: #777;
          padding: 3rem 1rem;
          font-weight: 500;
        }

        /* Trends SVGs */
        .trends-svg-container {
          width: 100%;
          height: 200px;
        }

        .trends-svg {
          width: 100%;
          height: 100%;
        }

        .trend-node text.node-tooltip {
          display: none;
          font-size: 9px;
          font-weight: 700;
          fill: #450043;
        }

        .trend-node:hover text.node-tooltip {
          display: block;
        }

        .trend-node:hover circle {
          r: 7;
        }

        .node-axis-label {
          font-size: 10px;
          font-weight: 600;
          fill: #6b7280;
        }

        /* Budget Limits */
        .budget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .add-budget-btn {
          background: #9a5c97;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 6px rgba(154, 92, 151, 0.2);
          transition: all 0.2s;
        }

        .add-budget-btn:hover {
          background: #450043;
          transform: translateY(-1px);
        }

        .budgets-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .budget-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .budget-item-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-tag {
          font-weight: 700;
          font-size: 0.9rem;
          border-left: 4px solid;
          padding-left: 8px;
        }

        .warning-badge {
          background-color: #ffe3e3;
          color: #ff6b6b;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: 8px;
        }

        .alert-badge {
          background-color: #fff9db;
          color: #ffd43b;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: 8px;
        }

        .budget-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .delete-btn {
          background: transparent;
          border: none;
          color: #adb5bd;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          color: #e03131;
          background: #fff5f5;
        }

        .budget-bar-container {
          width: 100%;
          height: 8px;
          background-color: #f1f3f5;
          border-radius: 4px;
          overflow: hidden;
        }

        .budget-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease-out;
        }

        .budget-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #4b5563;
        }

        .no-limit {
          color: #9a5c97;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
        }

        .no-limit:hover {
          color: #450043;
        }

        /* AI insights card */
        .ai-insights-card {
          background: linear-gradient(135deg, #450043, #9a5c97);
          color: white !important;
        }

        .ai-insights-card .card-title {
          color: white;
        }

        .ai-summary-text {
          font-size: 0.9rem;
          line-height: 1.6;
          opacity: 0.95;
          margin-bottom: 1rem;
        }

        .ask-ai-link {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .ask-ai-link:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 18px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          color: black;
          overflow: hidden;
        }

        .modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f3f5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #450043;
        }

        .close-modal-btn {
          background: transparent;
          border: none;
          color: #868e96;
          cursor: pointer;
        }

        .close-modal-btn:hover {
          color: #212529;
        }

        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .modal-error {
          background-color: #fff5f5;
          color: #c92a2a;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #495057;
        }

        .modal-select, .modal-input {
          height: 48px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          padding: 0 12px;
          font-size: 0.95rem;
          outline: none;
        }

        .modal-select:focus, .modal-input:focus {
          border-color: #9a5c97;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 1rem;
        }

        .cancel-btn {
          height: 48px;
          border: none;
          background: #f1f3f5;
          color: #495057;
          padding: 0 20px;
          border-radius: 24px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-btn:hover {
          background: #e9ecef;
        }

        .submit-btn {
          height: 48px;
          border: none;
          background: #9a5c97;
          color: white;
          padding: 0 24px;
          border-radius: 24px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(154, 92, 151, 0.2);
        }

        .submit-btn:hover {
          background: #450043;
        }

        @media (max-width: 1024px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .smart-spend-layout {
            flex-direction: column;
            gap: 0;
          }
          .content {
            padding: 1rem;
          }
          .donut-section {
            justify-content: center;
          }
        }
      `}</style>
    </main>
  )
}
