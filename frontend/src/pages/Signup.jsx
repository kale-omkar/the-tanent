import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('tenant');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const res = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.name,
          password: formData.password,
          phone_number: formData.phone,
          role: role
        })
      });
      
      if (res.ok) {
        // Automatically redirect to login page after successful signup
        navigate('/login');
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error trying to sign up");
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
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create an Account</h1>
          <p className="text-muted">Join The Tenant to find or manage your PG</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setRole('tenant')}
            style={{
              flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid',
              borderColor: role === 'tenant' ? 'var(--primary-color)' : 'var(--border-color)',
              backgroundColor: role === 'tenant' ? '#eff6ff' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <User size={24} color={role === 'tenant' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 600, color: role === 'tenant' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>I am a Tenant</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setRole('owner')}
            style={{
              flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid',
              borderColor: role === 'owner' ? 'var(--primary-color)' : 'var(--border-color)',
              backgroundColor: role === 'owner' ? '#eff6ff' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Building size={24} color={role === 'owner' ? 'var(--primary-color)' : 'var(--text-secondary)'} />
            <span style={{ fontWeight: 600, color: role === 'owner' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>I am a PG Owner</span>
          </button>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {errorMsg && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', fontSize: '0.85rem' }}>{errorMsg}</div>}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                required
                className="input" 
                placeholder="John Doe"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                required
                className="input" 
                placeholder="+91 9876543210"
                style={{ paddingLeft: '1rem' }}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                required
                className="input" 
                placeholder="Create a strong password"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-orange" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', fontSize: '1rem' }}>
            Create Account <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
