import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const formBody = new URLSearchParams();
    formBody.append('username', email.trim()); // OAuth2 expects 'username'
    formBody.append('password', password.trim());

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tenant_token', data.access_token);
        localStorage.setItem('tenant_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        navigate('/dashboard');
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error trying to login");
    }
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 73px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--bg-color)',
      padding: '2rem'
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p className="text-muted">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', fontSize: '0.85rem' }}>{errorMsg}</div>}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                required
                className="input" 
                placeholder="you@example.com"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                required
                className="input" 
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-orange" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}>
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <button className="btn btn-outline" style={{ width: '100%', padding: '0.85rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
