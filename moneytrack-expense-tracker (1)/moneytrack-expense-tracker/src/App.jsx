import { useEffect, useMemo, useState } from 'react';

const seed = [
  { id: 1, title: 'Groceries', category: 'Food', amount: 42.50, date: '2026-11-21', type: 'expense' },
  { id: 2, title: 'Bus fare', category: 'Transport', amount: 8.00, date: '2026-11-20', type: 'expense' },
  { id: 3, title: 'Part-time work', category: 'Salary', amount: 320.00, date: '2026-11-18', type: 'income' },
  { id: 4, title: 'Notebook', category: 'Education', amount: 12.75, date: '2026-11-16', type: 'expense' },
];

const currency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const categories = ['Food', 'Transport', 'Shopping', 'Education', 'Bills', 'Entertainment', 'Health', 'Salary', 'Other'];

function App() {
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('moneytrack-transactions')) || seed; }
    catch { return seed; }
  });
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), type: 'expense' });

  useEffect(() => localStorage.setItem('moneytrack-transactions', JSON.stringify(transactions)), [transactions]);

  const totals = useMemo(() => transactions.reduce((a, t) => {
    a[t.type] += Number(t.amount); return a;
  }, { income: 0, expense: 0 }), [transactions]);
  const balance = totals.income - totals.expense;

  const visible = useMemo(() => transactions
    .filter(t => filter === 'All' || t.type === filter.toLowerCase())
    .filter(t => `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [transactions, filter, query]);

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const maxExpense = Math.max(1, ...categories.map(c => transactions.filter(t => t.type === 'expense' && t.category === c).reduce((s, t) => s + Number(t.amount), 0)));
  const categoryTotals = categories.map(category => ({
    category,
    total: transactions.filter(t => t.type === 'expense' && t.category === category).reduce((s, t) => s + Number(t.amount), 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);

  function addTransaction(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setTransactions(prev => [{ ...form, id: Date.now(), title: form.title.trim(), amount }, ...prev]);
    setForm({ title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), type: 'expense' });
    setShowForm(false);
  }

  function removeTransaction(id) {
    if (window.confirm('Delete this transaction?')) setTransactions(prev => prev.filter(t => t.id !== id));
  }

  function exportCSV() {
    const rows = [['Title', 'Category', 'Type', 'Amount', 'Date'], ...transactions.map(t => [t.title, t.category, t.type, t.amount, t.date])];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'moneytrack-transactions.csv'; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">M</div><span>moneytrack</span></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav-item active"><span>▦</span> Overview</button>
      <button className="nav-item" onClick={() => setShowForm(true)}><span>＋</span> Add transaction</button>
      <div className="sidebar-bottom">
        <div className="profile-avatar">MT</div><div><strong>My account</strong><small>Personal workspace</small></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><div className="eyebrow">YOUR FINANCES</div><h1>Overview</h1></div>
        <div className="top-actions"><span className="date-pill">◷ &nbsp;{monthLabel}</span><button className="primary-btn" onClick={() => setShowForm(true)}>＋ Add transaction</button></div>
      </header>

      <section className="welcome">
        <div><p className="welcome-kicker">MONEYTrack / PERSONAL FINANCE</p><h2>Know where your money goes.</h2><p>Track your income, expenses, and spending habits in one simple place.</p></div>
        <div className="welcome-art"><div className="art-circle">↗</div><div className="art-card"><span>AVAILABLE BALANCE</span><strong>{currency(balance)}</strong><small>Updated just now</small></div></div>
      </section>

      <section className="stats-grid">
        <article className="stat-card"><div className="stat-top"><span>Total balance</span><span className="stat-icon purple">◈</span></div><strong>{currency(balance)}</strong><small className="muted">Income minus expenses</small></article>
        <article className="stat-card"><div className="stat-top"><span>Total income</span><span className="stat-icon green">↙</span></div><strong>{currency(totals.income)}</strong><small className="positive">Money received</small></article>
        <article className="stat-card"><div className="stat-top"><span>Total expenses</span><span className="stat-icon orange">↗</span></div><strong>{currency(totals.expense)}</strong><small className="muted">Money spent</small></article>
      </section>

      <section className="content-grid">
        <article className="panel transactions-panel">
          <div className="panel-heading"><div><h3>Recent transactions</h3><p>Your latest money activity</p></div><button className="text-btn" onClick={exportCSV}>↓ Export CSV</button></div>
          <div className="filters"><div className="search-box"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search transactions..." /></div><div className="filter-tabs">{['All', 'Income', 'Expense'].map(f => <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div></div>
          <div className="transaction-list">
            {visible.length === 0 ? <div className="empty-state"><div>◌</div><strong>No transactions found</strong><span>Try another search or add a transaction.</span></div> : visible.map(t => <div className="transaction-row" key={t.id}>
              <div className={`category-icon ${t.category.toLowerCase()}`}>{t.category === 'Food' ? '🍽' : t.category === 'Transport' ? '↗' : t.category === 'Education' ? '▤' : t.type === 'income' ? '＋' : '◈'}</div>
              <div className="transaction-info"><strong>{t.title}</strong><small>{t.category} · {new Date(t.date + 'T12:00:00').toLocaleDateString()}</small></div>
              <strong className={t.type === 'income' ? 'amount-in' : 'amount-out'}>{t.type === 'income' ? '+' : '−'}{currency(Number(t.amount))}</strong>
              <button className="delete-btn" title="Delete transaction" onClick={() => removeTransaction(t.id)}>×</button>
            </div>)}
          </div>
        </article>

        <article className="panel spending-panel">
          <div className="panel-heading"><div><h3>Spending by category</h3><p>Where your expenses go</p></div><span className="mini-icon">◔</span></div>
          {categoryTotals.length === 0 ? <div className="empty-chart">Add an expense to see your spending breakdown.</div> : <div className="category-bars">{categoryTotals.map(item => <div className="bar-item" key={item.category}><div className="bar-label"><span>{item.category}</span><strong>{currency(item.total)}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(5, item.total / maxExpense * 100)}%` }} /></div></div>)}</div>}
          <div className="spending-footer"><span>All-time expenses</span><strong>{currency(totals.expense)}</strong></div>
        </article>
      </section>
      <footer>© 2026 MoneyTrack <span>Simple habits. Clear finances.</span></footer>
    </main>

    {showForm && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}><form className="modal" onSubmit={addTransaction}>
      <div className="modal-heading"><div><span className="eyebrow">MONEY ACTIVITY</span><h2>Add transaction</h2></div><button type="button" className="close-btn" onClick={() => setShowForm(false)}>×</button></div>
      <label>Transaction type<div className="type-toggle"><button type="button" className={form.type === 'expense' ? 'chosen expense-choice' : ''} onClick={() => setForm({ ...form, type: 'expense' })}>Expense</button><button type="button" className={form.type === 'income' ? 'chosen income-choice' : ''} onClick={() => setForm({ ...form, type: 'income' })}>Income</button></div></label>
      <label>Description<input required maxLength="60" placeholder="e.g. Lunch with friends" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <div className="form-row"><label>Amount<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></label><label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label></div>
      <label>Date<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
      <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-btn" type="submit">Save transaction</button></div>
    </form></div>}
  </div>;
}

export default App;
