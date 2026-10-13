import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('tenant_user'));

  useEffect(() => {
    const handleAuthChange = () => setIsAuthenticated(!!localStorage.getItem('tenant_user'));
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);
  return (
    <nav style={{
      background: 'var(--surface-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container flex items-center justify-between">
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>
          TheTenant
        </Link>
        
        <div className="flex items-center gap-2">
          <Link to="/" className="btn btn-outline">
            Home
          </Link>
          <Link to="/search" className="btn btn-outline">
            Browse PGs
          </Link>
          
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-orange" style={{ marginLeft: '1rem' }}>
              My Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-2" style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/signup" className="btn btn-orange">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
