import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('Pune');
  const [maxPrice, setMaxPrice] = useState(30000);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}&city=${city}&maxPrice=${maxPrice}`);
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section className="container flex items-center justify-between" style={{ padding: '6rem 1.5rem', gap: '4rem' }}>
        
        {/* Left Column */}
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Find Your Perfect <br />
            <span className="text-orange">PG Match</span>
          </h1>
          
          <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '4rem', maxWidth: '480px' }}>
            Enter your location and let our intelligent matching system connect you with PGs tailored to your budget, amenities, and lifestyle.
          </p>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <div style={{ width: '24px', height: '3px', background: 'var(--primary-color)', marginBottom: '0.5rem' }}></div>
              <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Verified PGs</p>
            </div>
            <div>
              <div style={{ width: '24px', height: '3px', background: 'var(--primary-color)', marginBottom: '0.5rem' }}></div>
              <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Top Cities</p>
            </div>
            <div>
              <div style={{ width: '24px', height: '3px', background: 'var(--primary-color)', marginBottom: '0.5rem' }}></div>
              <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Happy Tenants</p>
            </div>
          </div>
        </div>

        {/* Right Column - Card */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Search size={18} className="text-primary" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)' }}>Quick Search</h3>
            </div>
            
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Instantly find available rooms in your desired area
            </p>

            <form onSubmit={handleSearch} className="flex-col gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Location / Area
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="E.g. Hinjewadi, Kothrud..."
                    style={{ paddingLeft: '2.5rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  City
                </label>
                <select 
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <label>Max Budget</label>
                  <span className="text-primary" style={{ fontWeight: 700 }}>₹{maxPrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="3000" 
                  max="30000" 
                  step="500" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="premium-slider"
                  style={{ 
                    background: `linear-gradient(to right, var(--primary-color) ${(maxPrice - 3000) / (30000 - 3000) * 100}%, #e2e8f0 ${(maxPrice - 3000) / (30000 - 3000) * 100}%)`, 
                    height: '6px',
                    borderRadius: '3px',
                    marginBottom: '0.5rem'
                  }}
                />
              </div>

              <button type="submit" className="btn btn-orange" style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}>
                Search Now
              </button>
            </form>
          </div>
        </div>

      </section>

      {/* Secondary Search Section (like image) */}
      <section className="container" style={{ marginTop: '2rem' }}>
        <div className="card flex-col items-center justify-center" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
           <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              <Search size={24} className="text-blue" />
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>Find Your Next Stay</h2>
           </div>
           <p className="text-muted" style={{ fontSize: '0.95rem' }}>
              Set your preferences and discover properties that match your lifestyle
           </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
