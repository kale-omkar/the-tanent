import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Home, MessageSquare, CreditCard, LogOut, Shield, Trash2, CheckCircle } from 'lucide-react';

const API = 'http://localhost:8000';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pgs, setPgs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('tenant_user');
  const currentUser = userStr && userStr !== 'true' ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('tenant_token');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      window.location.href = '/login';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [s, u, p, c, pay] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/users`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/pgs`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/complaints`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/payments`, { headers }).then(r => r.json()),
      ]);
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
      setPgs(Array.isArray(p) ? p : []);
      setComplaints(Array.isArray(c) ? c : []);
      setPayments(Array.isArray(pay) ? pay : []);
    } catch (e) {
      console.error('Admin fetch error', e);
    }
    setLoading(false);
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`${API}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('User deleted.');
    } else {
      const d = await res.json();
      alert(d.detail || 'Failed to delete.');
    }
  };

  const resolveComplaint = async (compId) => {
    const res = await fetch(`${API}/admin/complaints/${compId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    if (res.ok) {
      setComplaints(prev => prev.map(c => c.id === compId ? { ...c, status: 'Resolved' } : c));
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'pgs', label: 'All PGs', icon: Home },
    { id: 'complaints', label: 'All Complaints', icon: MessageSquare },
    { id: 'payments', label: 'All Payments', icon: CreditCard },
  ];

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, color: '#2563eb' },
    { label: 'Tenants', value: stats.total_tenants, color: '#7c3aed' },
    { label: 'PG Owners', value: stats.total_owners, color: '#0891b2' },
    { label: 'PG Listings', value: stats.total_pgs, color: '#059669' },
    { label: 'Total Complaints', value: stats.total_complaints, color: '#dc2626' },
    { label: 'Open Complaints', value: stats.open_complaints, color: '#ea580c' },
    { label: 'Join Requests', value: stats.total_join_requests, color: '#d97706' },
    { label: 'Approved Stays', value: stats.approved_requests, color: '#16a34a' },
    { label: 'Payments Logged', value: stats.total_payments, color: '#0284c7' },
  ] : [];

  const roleBadge = (role) => {
    const map = {
      tenant: { bg: '#eff6ff', color: '#1d4ed8' },
      owner: { bg: '#fef3c7', color: '#92400e' },
      super_admin: { bg: '#fce7f3', color: '#9d174d' },
    };
    const s = map[role] || map.tenant;
    return (
      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: s.bg, color: s.color, textTransform: 'capitalize' }}>
        {role}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg-color)' }}>

      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', padding: '2rem 0', flexShrink: 0, position: 'relative' }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Shield size={22} color="#f97316" />
            <div>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>Super Admin</p>
              <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Platform Control Panel</p>
            </div>
          </div>
        </div>

        <ul style={{ listStyle: 'none' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.85rem 1.5rem',
                    backgroundColor: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
                    color: isActive ? '#f97316' : '#94a3b8',
                    borderRight: isActive ? '3px solid #f97316' : '3px solid transparent',
                    fontWeight: isActive ? 600 : 500, textAlign: 'left', transition: 'all 0.2s',
                    fontSize: '0.95rem',
                  }}
                >
                  <Icon size={17} /> {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, width: '260px', padding: '0 1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#1e293b', borderRadius: '8px', marginBottom: '0.75rem' }}>
            <p style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>{currentUser?.full_name}</p>
            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{currentUser?.email}</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('tenant_token'); localStorage.removeItem('tenant_user'); window.location.href = '/login'; }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#64748b', fontWeight: 500, padding: '0.5rem 0', fontSize: '0.9rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto', maxHeight: 'calc(100vh - 73px)' }}>
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading platform data...</p>}

        {/* ---- OVERVIEW ---- */}
        {!loading && activeTab === 'overview' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Platform Overview</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Live metrics across the entire platform.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {statCards.map(card => (
                <div key={card.label} className="card" style={{ padding: '1.5rem', borderTop: `4px solid ${card.color}` }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                  <p style={{ fontSize: '2.25rem', fontWeight: 700, color: card.color }}>{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- USERS ---- */}
        {!loading && activeTab === 'users' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>All Users</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{users.length} registered accounts</p>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'Name', 'Email', 'Phone', 'Role', 'Action'].map(h => (
                      <th key={h} style={{ padding: '0.9rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{u.id}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{u.full_name}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.phone_number || '—'}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>{roleBadge(u.role)}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        {u.role !== 'super_admin' && (
                          <button
                            onClick={() => deleteUser(u.id, u.full_name)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- PGS ---- */}
        {!loading && activeTab === 'pgs' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>All PG Listings</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{pgs.length} properties listed on the platform</p>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'PG Name', 'City / Area', 'Rent', 'Deposit', 'Owner'].map(h => (
                      <th key={h} style={{ padding: '0.9rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pgs.map(pg => (
                    <tr key={pg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{pg.id}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{pg.name}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{pg.location}, {pg.city}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: '#16a34a' }}>₹{pg.rent}/mo</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>₹{pg.deposit}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>{pg.owner_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{pg.owner_email}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- COMPLAINTS ---- */}
        {!loading && activeTab === 'complaints' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>All Complaints</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{complaints.length} total complaints across all PGs</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.length === 0 ? <p className="text-muted">No complaints found.</p> : complaints.map(c => {
                const isOpen = c.status.toLowerCase() === 'open';
                return (
                  <div key={c.id} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${isOpen ? '#ef4444' : '#16a34a'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                          <h4 style={{ fontSize: '1.05rem' }}>{c.title}</h4>
                          <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: isOpen ? '#fee2e2' : '#dcfce7', color: isOpen ? '#991b1b' : '#166534' }}>{c.status}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>{c.description}</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Tenant: <strong>{c.tenant_name}</strong> &nbsp;|&nbsp; PG: <strong>{c.pg_name}</strong>, {c.pg_city}
                        </p>
                      </div>
                      {isOpen && (
                        <button
                          onClick={() => resolveComplaint(c.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#16a34a', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          <CheckCircle size={14} /> Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- PAYMENTS ---- */}
        {!loading && activeTab === 'payments' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>All Payments</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{payments.length} payment records</p>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'Tenant', 'PG', 'Description', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.9rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{p.id}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{p.tenant_name}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{p.pg_name}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{p.description}</td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#16a34a' }}>₹{p.amount}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{p.method}</td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{p.date}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#166534' }}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

