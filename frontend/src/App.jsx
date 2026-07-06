import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Target,
  Moon,
  Sun,
  Filter,
  Search,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : `http://${window.location.hostname}:5001/api`);

const CATEGORIES = [
  'Food',
  'Rent',
  'Salary',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Transport',
  'Other'
];

const CATEGORY_COLORS = {
  Food: '#f59e0b', // Amber
  Rent: '#3b82f6', // Blue
  Salary: '#10b981', // Emerald
  Entertainment: '#ec4899', // Pink
  Utilities: '#6366f1', // Indigo
  Shopping: '#a855f7', // Purple
  Transport: '#06b6d4', // Cyan
  Other: '#6b7280' // Gray
};

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    categoryExpenses: [],
    budgetProgress: [],
    timeline: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  // Filters and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Form states
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    limit: ''
  });

  // Load state and styles
  useEffect(() => {
    fetchData();
    
    // Set default theme class
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [transRes, budgetsRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/transactions`),
        fetch(`${API_URL}/budgets`),
        fetch(`${API_URL}/summary`)
      ]);

      if (!transRes.ok || !budgetsRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const transData = await transRes.json();
      const budgetsData = await budgetsRes.json();
      const summaryData = await summaryRes.json();

      setTransactions(transData);
      setBudgets(budgetsData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the finance server. Make sure the backend container is running.');
    } finally {
      setLoading(false);
    }
  };

  // Add Transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });

      if (!response.ok) throw new Error('Failed to add transaction');
      
      // Reset Form (keep date and type)
      setNewTransaction({
        ...newTransaction,
        description: '',
        amount: '',
        notes: ''
      });

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete transaction');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Set Budget Goal
  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.limit) return;

    try {
      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget)
      });

      if (!response.ok) throw new Error('Failed to save budget');
      
      setNewBudget({
        category: 'Food',
        limit: ''
      });

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Budget Goal
  const handleDeleteBudget = async (id) => {
    try {
      const response = await fetch(`${API_URL}/budgets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete budget');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Add Mock Data for Testing
  const handleAddMockData = async () => {
    try {
      setLoading(true);
      
      // Create some budgets
      const sampleBudgets = [
        { category: 'Food', limit: 600 },
        { category: 'Rent', limit: 1200 },
        { category: 'Utilities', limit: 250 },
        { category: 'Entertainment', limit: 300 }
      ];

      // Create transactions
      const sampleTransactions = [
        { description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], notes: 'Salary deposit' },
        { description: 'Apartment Rent', amount: 1200, type: 'expense', category: 'Rent', date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Grocery Store', amount: 154.30, type: 'expense', category: 'Food', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Electricity Bill', amount: 112.50, type: 'expense', category: 'Utilities', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Freelance Design', amount: 450, type: 'income', category: 'Salary', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Cinema & Dinner', amount: 85, type: 'expense', category: 'Entertainment', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Supermarket', amount: 210.40, type: 'expense', category: 'Food', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Gym Membership', amount: 60, type: 'expense', category: 'Entertainment', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Internet Service', amount: 79.90, type: 'expense', category: 'Utilities', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { description: 'Restaurant Pizza', amount: 45.00, type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0] }
      ];

      // Post Budgets
      await Promise.all(
        sampleBudgets.map(b =>
          fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(b)
          })
        )
      );

      // Post Transactions
      await Promise.all(
        sampleTransactions.map(t =>
          fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t)
          })
        )
      );

      fetchData();
    } catch (err) {
      setError('Failed to insert mock data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort transactions for rendering
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortBy]);

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  // Compute SVG Area Chart paths
  const chartSvgPath = useMemo(() => {
    const data = summary.timeline || [];
    if (data.length < 2) return null;

    const width = 800;
    const height = 200;
    const padding = 20;

    // Find min and max
    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.income, d.expense)),
      100 // default min height scale
    ) * 1.1; // Add 10% spacing at the top

    const xScale = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / maxVal;

    // Construct line paths
    let incomePoints = [];
    let expensePoints = [];

    data.forEach((d, index) => {
      const x = padding + index * xScale;
      const yIncome = height - padding - d.income * yScale;
      const yExpense = height - padding - d.expense * yScale;

      incomePoints.push(`${x},${yIncome}`);
      expensePoints.push(`${x},${yExpense}`);
    });

    const incomeLine = `M ${incomePoints.join(' L ')}`;
    const expenseLine = `M ${expensePoints.join(' L ')}`;

    // Areas
    const incomeArea = `${incomeLine} L ${padding + (data.length - 1) * xScale},${height - padding} L ${padding},${height - padding} Z`;
    const expenseArea = `${expenseLine} L ${padding + (data.length - 1) * xScale},${height - padding} L ${padding},${height - padding} Z`;

    return { incomeLine, expenseLine, incomeArea, expenseArea, maxVal, xScale, yScale, width, height, padding };
  }, [summary.timeline]);

  // Compute SVG Doughnut Segment Angles
  const doughnutSegments = useMemo(() => {
    const expenses = summary.categoryExpenses || [];
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    if (total === 0) return [];

    let currentPercentage = 0;
    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.16

    return expenses.map((item) => {
      const percentage = (item.amount / total) * 100;
      const strokeLength = (item.amount / total) * circumference;
      const strokeOffset = circumference - (currentPercentage / 100) * circumference;
      
      currentPercentage += percentage;

      return {
        category: item.category,
        amount: item.amount,
        percentage: Math.round(percentage),
        color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other,
        strokeDash: `${strokeLength} ${circumference - strokeLength}`,
        strokeOffset: strokeOffset
      };
    });
  }, [summary.categoryExpenses]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <h1>
            <Sparkles className="icon-glow" style={{ color: 'var(--accent-primary)' }} />
            Financely
          </h1>
          <p>Seu assistente financeiro pessoal de alta performance</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleAddMockData}
            style={{ width: 'auto', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            title="Importa dados de teste para visualizar o painel"
          >
            <RefreshCw size={14} />
            Gerar Dados de Teste
          </button>
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {error && (
        <div className="card fade-in" style={{ borderColor: 'var(--color-danger)', backgroundColor: 'var(--color-danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-danger)' }}>
            <AlertCircle />
            <div>
              <strong style={{ display: 'block' }}>Erro de Conexão</strong>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards Grid */}
      <section className="summary-grid">
        <div className="card summary-card balance fade-in">
          <div className="summary-card-header">
            <span className="summary-card-title">Saldo Geral</span>
            <div className="summary-card-icon">
              <DollarSign size={18} />
            </div>
          </div>
          <h2 className="summary-card-value" style={{ color: summary.balance >= 0 ? 'var(--text-primary)' : 'var(--color-danger)' }}>
            {formatCurrency(summary.balance)}
          </h2>
          <div className="summary-card-footer">
            <Info size={12} />
            <span>Patrimônio líquido consolidado</span>
          </div>
        </div>

        <div className="card summary-card income fade-in">
          <div className="summary-card-header">
            <span className="summary-card-title">Entradas</span>
            <div className="summary-card-icon">
              <TrendingUp size={18} />
            </div>
          </div>
          <h2 className="summary-card-value" style={{ color: 'var(--color-success)' }}>
            {formatCurrency(summary.totalIncome)}
          </h2>
          <div className="summary-card-footer">
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>+100%</span>
            <span>Total acumulado</span>
          </div>
        </div>

        <div className="card summary-card expense fade-in">
          <div className="summary-card-header">
            <span className="summary-card-title">Saídas</span>
            <div className="summary-card-icon">
              <TrendingDown size={18} />
            </div>
          </div>
          <h2 className="summary-card-value" style={{ color: 'var(--color-danger)' }}>
            {formatCurrency(summary.totalExpenses)}
          </h2>
          <div className="summary-card-footer">
            <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>-100%</span>
            <span>Total debitado</span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Section */}
      <main className="main-dashboard-grid">
        {/* SVG Charts Card */}
        <div className="card fade-in">
          <h2 className="card-title">
            <TrendingUp size={20} />
            Fluxo de Caixa (Últimos 30 dias)
          </h2>
          {loading ? (
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw className="animate-spin" />
            </div>
          ) : chartSvgPath ? (
            <div className="chart-container">
              <svg className="svg-chart" viewBox={`0 0 ${chartSvgPath.width} ${chartSvgPath.height}`}>
                <defs>
                  <linearGradient id="income-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="expense-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-danger)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-danger)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={chartSvgPath.padding} y1={chartSvgPath.padding} x2={chartSvgPath.width - chartSvgPath.padding} y2={chartSvgPath.padding} className="chart-grid-line" />
                <line x1={chartSvgPath.padding} y1={chartSvgPath.height / 2} x2={chartSvgPath.width - chartSvgPath.padding} y2={chartSvgPath.height / 2} className="chart-grid-line" />
                <line x1={chartSvgPath.padding} y1={chartSvgPath.height - chartSvgPath.padding} x2={chartSvgPath.width - chartSvgPath.padding} y2={chartSvgPath.height - chartSvgPath.padding} className="chart-grid-line" />

                {/* Y Axis Max Label */}
                <text x={chartSvgPath.padding + 5} y={chartSvgPath.padding + 12} fill="var(--text-muted)" fontSize="9" fontWeight="bold">
                  {formatCurrency(chartSvgPath.maxVal)}
                </text>

                {/* Area Paths */}
                <path d={chartSvgPath.incomeArea} className="chart-area-income" />
                <path d={chartSvgPath.expenseArea} className="chart-area-expense" />

                {/* Line Paths */}
                <path d={chartSvgPath.incomeLine} className="chart-line-income" />
                <path d={chartSvgPath.expenseLine} className="chart-line-expense" />

                {/* Chart Dots & Interaction */}
                {summary.timeline.map((d, index) => {
                  const x = chartSvgPath.padding + index * chartSvgPath.xScale;
                  const yIncome = chartSvgPath.height - chartSvgPath.padding - d.income * chartSvgPath.yScale;
                  const yExpense = chartSvgPath.height - chartSvgPath.padding - d.expense * chartSvgPath.yScale;

                  return (
                    <g key={index}>
                      {d.income > 0 && (
                        <circle cx={x} cy={yIncome} r="4" fill="var(--color-success)" stroke="var(--bg-card)" strokeWidth="1.5" className="chart-dot">
                          <title>{`${d.date}: +${formatCurrency(d.income)}`}</title>
                        </circle>
                      )}
                      {d.expense > 0 && (
                        <circle cx={x} cy={yExpense} r="4" fill="var(--color-danger)" stroke="var(--bg-card)" strokeWidth="1.5" className="chart-dot">
                          <title>{`${d.date}: -${formatCurrency(d.expense)}`}</title>
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div style={{ height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <span>Sem dados suficientes no período. Adicione transações para ver o gráfico.</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
              Entradas
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
              Saídas
            </span>
          </div>
        </div>

        {/* Budgets Progress and Setting Card */}
        <div className="card fade-in">
          <h2 className="card-title">
            <Target size={20} />
            Metas de Orçamento
          </h2>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <RefreshCw className="animate-spin" />
            </div>
          ) : summary.budgetProgress.length > 0 ? (
            <div className="budget-list">
              {summary.budgetProgress.map((budget) => {
                let statusClass = 'safe';
                if (budget.percentage >= 90) statusClass = 'danger';
                else if (budget.percentage >= 70) statusClass = 'warning';

                return (
                  <div className="budget-progress-container" key={budget.id}>
                    <div className="budget-progress-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CATEGORY_COLORS[budget.category] || '#6b7280' }}></span>
                        <strong>{budget.category}</strong>
                      </span>
                      <span style={{ color: budget.spent > budget.limit ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)} ({budget.percentage}%)
                      </span>
                    </div>
                    <div className="budget-progress-bar-bg">
                      <div 
                        className={`budget-progress-bar-fill ${statusClass}`}
                        style={{ width: `${budget.percentage}%` }}
                      ></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      <span>
                        {budget.spent > budget.limit 
                          ? `Excedeu por ${formatCurrency(budget.spent - budget.limit)}!` 
                          : `Restante: ${formatCurrency(budget.limit - budget.spent)}`}
                      </span>
                      <button 
                        onClick={() => handleDeleteBudget(budget.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Remover orçamento"
                      >
                        <Trash2 size={10} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
              Nenhuma meta definida. Configure abaixo.
            </div>
          )}

          {/* Budget Setting Form */}
          <form onSubmit={handleSetBudget} style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Configurar Limite</h3>
            <div className="form-row" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
              <div className="form-group">
                <select
                  className="form-select"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type="number"
                  placeholder="Limite (USD)"
                  className="form-input"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem' }}>
              <Plus size={16} /> Definir Meta
            </button>
          </form>
        </div>
      </main>

      {/* Second Section: Analytics Breakdown and Add/List Transactions */}
      <section className="transactions-grid">
        {/* Left Side: Transactions List */}
        <div className="card fade-in">
          <h2 className="card-title">
            <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
            Transações Recentes
          </h2>

          {/* Search and Filters */}
          <div className="filters-container">
            <div className="search-input-wrapper">
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar transações..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="form-select filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tipos (Todos)</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>

            <select
              className="form-select filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Categorias (Todas)</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className="form-select filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Mais recente</option>
              <option value="date-asc">Mais antiga</option>
              <option value="amount-desc">Maior valor</option>
              <option value="amount-asc">Menor valor</option>
            </select>
          </div>

          {/* Transactions Table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <RefreshCw className="animate-spin" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="transaction-list-wrapper">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th style={{ textAlign: 'center' }}>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t._id} className="transaction-row">
                      <td>
                        <span className={`type-indicator ${t.type}`}>
                          {t.type === 'income' ? '+' : '-'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>{t.description}</strong>
                          {t.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{t.notes}</div>}
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">
                          <span style={{ 
                            display: 'inline-block', 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            marginRight: '6px', 
                            backgroundColor: CATEGORY_COLORS[t.category] || '#6b7280' 
                          }}></span>
                          {t.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={12} />
                          {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </td>
                      <td>
                        <span className={`amount-display ${t.type}`}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-icon-delete"
                          onClick={() => handleDeleteTransaction(t._id)}
                          title="Excluir Transação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Search size={48} />
              <p>Nenhuma transação encontrada correspondente aos filtros.</p>
            </div>
          )}
        </div>

        {/* Right Side: Add Transaction Form and Category breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Add Transaction Form */}
          <div className="card fade-in">
            <h2 className="card-title">
              <Plus size={20} />
              Nova Transação
            </h2>
            <form onSubmit={handleAddTransaction}>
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel, Supermercado, Job"
                  className="form-input"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="form-input"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    className="form-select"
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  >
                    <option value="expense">Saída</option>
                    <option value="income">Entrada</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    className="form-select"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notas (Opcional)</label>
                <textarea
                  placeholder="Adicione observações..."
                  rows="2"
                  className="form-input"
                  style={{ resize: 'none' }}
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                <Plus size={18} /> Adicionar Transação
              </button>
            </form>
          </div>

          {/* Category Breakdown (Doughnut Chart) */}
          <div className="card fade-in">
            <h2 className="card-title">
              <Tag size={20} />
              Despesas por Categoria
            </h2>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <RefreshCw className="animate-spin" />
              </div>
            ) : doughnutSegments.length > 0 ? (
              <div className="doughnut-container">
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Layered circles for doughnut chart */}
                  {doughnutSegments.map((segment, index) => (
                    <circle
                      key={index}
                      cx="60"
                      cy="60"
                      r="50"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="12"
                      strokeDasharray={segment.strokeDash}
                      strokeDashoffset={segment.strokeOffset}
                      strokeLinecap="round"
                    >
                      <title>{`${segment.category}: ${formatCurrency(segment.amount)} (${segment.percentage}%)`}</title>
                    </circle>
                  ))}
                  {/* Inner text */}
                  <circle cx="60" cy="60" r="42" fill="var(--bg-card)" />
                </svg>

                <div className="doughnut-legends">
                  {doughnutSegments.map((segment, index) => (
                    <div className="doughnut-legend-item" key={index}>
                      <span className="legend-color-dot" style={{ backgroundColor: segment.color }}></span>
                      <span>
                        <strong>{segment.category}</strong>: {formatCurrency(segment.amount)} ({segment.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
                Nenhuma despesa para exibir.
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
