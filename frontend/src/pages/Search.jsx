import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, IndianRupee, Navigation, Heart, Search as SearchIcon, 
  Filter, X, SlidersHorizontal, Check, ArrowUpDown, Sparkles, 
  Building2, ShieldCheck, Wifi, Coffee, Wind, Zap, RotateCcw,
  Grid3X3, Map
} from 'lucide-react';

const resolveImg = (url) => {
  if (!url) return null;
  if (url.startsWith('/static/')) return `http://localhost:8000${url}`;
  return url;
};

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: Wifi, keywords: ['wi-fi', 'wifi', 'internet'] },
  { id: 'food', label: 'Food Included', icon: Coffee, keywords: ['food', 'meal', 'meals', 'mess', 'breakfast'] },
  { id: 'ac', label: 'AC Rooms', icon: Wind, keywords: ['ac', 'air condition'] },
  { id: 'backup', label: 'Power Backup', icon: Zap, keywords: ['backup', 'power'] },
  { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles, keywords: ['housekeeping', 'cleaning'] },
  { id: 'cctv', label: 'CCTV / Security', icon: ShieldCheck, keywords: ['cctv', 'security', 'safe'] }
];

const GENDER_OPTIONS = [
  { id: 'all', label: 'All Types' },
  { id: 'boys', label: 'Boys PG' },
  { id: 'girls', label: 'Girls PG' },
  { id: 'coliving', label: 'Co-Living' }
];

const PRICE_PRESETS = [
  { id: 'all', label: 'All Budgets', max: 35000 },
  { id: 'under8k', label: 'Under ₹8k', max: 8000 },
  { id: '8k-12k', label: '₹8k - ₹12k', min: 8000, max: 12000 },
  { id: 'above12k', label: 'Above ₹12k', min: 12000, max: 35000 }
];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'deposit-asc', label: 'Deposit: Low to High' },
  { id: 'name-asc', label: 'Name: A to Z' }
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query parameters initialization
  const initialCity = searchParams.get('city') || 'All Cities';
  const initialQuery = searchParams.get('q') || '';
  const initialMaxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice'), 10) : 30000;
  const initialSort = searchParams.get('sort') || 'recommended';
  const initialType = searchParams.get('type') || 'all';

  // Filter & Search states
  const [allPgs, setAllPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [selectedPreset, setSelectedPreset] = useState('all');
  const [selectedType, setSelectedType] = useState(initialType);
  const [maxDeposit, setMaxDeposit] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState(initialSort);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state with URL params if they change
  useEffect(() => {
    const cityParam = searchParams.get('city');
    const qParam = searchParams.get('q');
    const maxPriceParam = searchParams.get('maxPrice');
    
    if (cityParam && cityParam !== selectedCity) setSelectedCity(cityParam);
    if (qParam !== null && qParam !== searchQuery) setSearchQuery(qParam);
    if (maxPriceParam && parseInt(maxPriceParam, 10) !== maxPrice) {
      setMaxPrice(parseInt(maxPriceParam, 10));
    }
  }, [searchParams]);

  // Fetch PGs and saved status
  useEffect(() => {
    fetch('http://localhost:8000/pgs/')
      .then(res => res.json())
      .then(data => {
        setAllPgs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch PGs:", err);
        setLoading(false);
      });

    const token = localStorage.getItem('tenant_token');
    if (token) {
      fetch('http://localhost:8000/tenant/saved', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data)) {
            setSavedIds(data.map(p => p.id));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Update URL search parameters smoothly
  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v && v !== 'All Cities' && v !== 'all' && v !== 30000 && v !== '') {
        updated.set(k, v);
      } else {
        updated.delete(k);
      }
    });
    setSearchParams(updated, { replace: true });
  };

  // Toggle saved property
  const handleToggleSave = async (e, pgId) => {
    e.stopPropagation();
    const token = localStorage.getItem('tenant_token');
    if (!token) {
      alert("Please login first to save properties!");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/tenant/saved/${pgId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.is_saved) {
          setSavedIds(prev => [...prev, pgId]);
        } else {
          setSavedIds(prev => prev.filter(id => id !== pgId));
        }
      }
    } catch (err) {
      console.error("Failed to save property", err);
    }
  };

  // Extract unique cities from data
  const availableCities = useMemo(() => {
    const set = new Set(allPgs.map(p => p.city).filter(Boolean));
    ['Pune', 'Bangalore', 'Mumbai', 'Delhi'].forEach(c => set.add(c));
    return ['All Cities', ...Array.from(set)];
  }, [allPgs]);

  // Amenity toggle handler
  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) ? prev.filter(id => id !== amenityId) : [...prev, amenityId]
    );
  };

  // Price preset change
  const handlePresetChange = (preset) => {
    setSelectedPreset(preset.id);
    if (preset.id === 'all') {
      setMaxPrice(30000);
      updateUrlParams({ maxPrice: '' });
    } else if (preset.id === 'under8k') {
      setMaxPrice(8000);
      updateUrlParams({ maxPrice: 8000 });
    } else if (preset.id === '8k-12k') {
      setMaxPrice(12000);
      updateUrlParams({ maxPrice: 12000 });
    } else if (preset.id === 'above12k') {
      setMaxPrice(35000);
      updateUrlParams({ maxPrice: 35000 });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All Cities');
    setMaxPrice(30000);
    setSelectedPreset('all');
    setSelectedType('all');
    setMaxDeposit('all');
    setSelectedAmenities([]);
    setSortBy('recommended');
    setSearchParams({}, { replace: true });
  };

  // Helper to determine PG gender/type badge
  const getPgTypeBadge = (pg) => {
    const text = `${pg.name} ${pg.description}`.toLowerCase();
    if (text.includes('girl') || text.includes('female') || text.includes('women')) {
      return { label: 'Girls PG', color: '#db2777', bg: '#fdf2f8' };
    }
    if (text.includes('boy') || text.includes('male') || text.includes('men')) {
      return { label: 'Boys PG', color: '#2563eb', bg: '#eff6ff' };
    }
    if (text.includes('co-living') || text.includes('coliving') || text.includes('studio')) {
      return { label: 'Co-Living', color: '#059669', bg: '#ecfdf5' };
    }
    return { label: 'Unisex / All', color: '#475569', bg: '#f1f5f9' };
  };

  // Helper to get present amenities for a PG
  const getPgAmenities = (pg) => {
    const text = (pg.description || '').toLowerCase();
    return AMENITY_OPTIONS.filter(opt => {
      if (opt.id === 'ac') {
        return /\bac\b/i.test(text) || text.includes('air condition');
      }
      return opt.keywords.some(k => text.includes(k));
    });
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCity !== 'All Cities') count++;
    if (maxPrice < 30000 || selectedPreset !== 'all') count++;
    if (selectedType !== 'all') count++;
    if (maxDeposit !== 'all') count++;
    count += selectedAmenities.length;
    return count;
  }, [searchQuery, selectedCity, maxPrice, selectedPreset, selectedType, maxDeposit, selectedAmenities]);

  // Main Filtering and Sorting
  const filteredPgs = useMemo(() => {
    let result = allPgs.filter(pg => {
      const text = `${pg.name} ${pg.location} ${pg.city} ${pg.description}`.toLowerCase();

      // Search query filter
      if (searchQuery.trim()) {
        const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
        const matchesAllWords = queryWords.every(word => text.includes(word));
        if (!matchesAllWords) return false;
      }

      // City filter
      if (selectedCity !== 'All Cities') {
        if (!pg.city || pg.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // Price preset & max price filter
      if (selectedPreset === 'under8k' && pg.rent > 8000) return false;
      if (selectedPreset === '8k-12k' && (pg.rent < 8000 || pg.rent > 12000)) return false;
      if (selectedPreset === 'above12k' && pg.rent < 12000) return false;
      if (selectedPreset === 'all' && pg.rent > maxPrice) return false;

      // Deposit filter
      if (maxDeposit !== 'all' && pg.deposit > maxDeposit) return false;

      // Type filter
      if (selectedType === 'boys') {
        if (!(text.includes('boy') || text.includes('male') || text.includes('men'))) return false;
      } else if (selectedType === 'girls') {
        if (!(text.includes('girl') || text.includes('female') || text.includes('women'))) return false;
      } else if (selectedType === 'coliving') {
        if (!(text.includes('co-living') || text.includes('coliving') || text.includes('studio'))) return false;
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(amenityId => {
          const opt = AMENITY_OPTIONS.find(a => a.id === amenityId);
          if (!opt) return true;
          if (amenityId === 'ac') {
            return /\bac\b/i.test(text) || text.includes('air condition');
          }
          return opt.keywords.some(k => text.includes(k));
        });
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Sort result
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.rent - b.rent);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.rent - a.rent);
    } else if (sortBy === 'deposit-asc') {
      result.sort((a, b) => a.deposit - b.deposit);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [allPgs, searchQuery, selectedCity, maxPrice, selectedPreset, maxDeposit, selectedType, selectedAmenities, sortBy]);

  // Group properties by locality for Map / Locality View
  const localitySummary = useMemo(() => {
    const map = {};
    filteredPgs.forEach(pg => {
      const locKey = `${pg.location}, ${pg.city}`;
      if (!map[locKey]) {
        map[locKey] = {
          location: pg.location,
          city: pg.city,
          count: 0,
          minRent: pg.rent,
          maxRent: pg.rent,
          pgs: []
        };
      }
      map[locKey].count += 1;
      map[locKey].minRent = Math.min(map[locKey].minRent, pg.rent);
      map[locKey].maxRent = Math.max(map[locKey].maxRent, pg.rent);
      map[locKey].pgs.push(pg);
    });
    return Object.values(map);
  }, [filteredPgs]);

  // Render filter controls content (shared by desktop sidebar & mobile drawer)
  const renderFilterControls = () => (
    <div>
      {/* Header with Active Count & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={18} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-dark)' }}>Filters</h2>
          {activeFilterCount > 0 && (
            <span style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              fontSize: '0.75rem', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '12px',
              fontWeight: 700
            }}>
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button 
            onClick={handleResetFilters}
            style={{ 
              fontSize: '0.85rem', 
              color: 'var(--accent-color)', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* 1. City Filter */}
      <div className="filter-group">
        <div className="filter-title">
          <span>Target City</span>
          <MapPin size={15} />
        </div>
        <select 
          className="input"
          value={selectedCity}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedCity(val);
            updateUrlParams({ city: val });
          }}
          style={{ cursor: 'pointer', padding: '0.6rem 0.75rem', fontSize: '0.9rem' }}
        >
          {availableCities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 2. Budget / Monthly Rent */}
      <div className="filter-group">
        <div className="filter-title">
          <span>Monthly Rent</span>
          <IndianRupee size={15} />
        </div>
        
        {/* Quick Budget Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {PRICE_PRESETS.map(preset => (
            <button
              key={preset.id}
              className={`filter-pill ${selectedPreset === preset.id ? 'active' : ''}`}
              onClick={() => handlePresetChange(preset)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Price Slider */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <span className="text-muted">Max Budget:</span>
          <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
            ₹{maxPrice.toLocaleString()} /mo
          </span>
        </div>
        <input 
          type="range"
          min="5000"
          max="35000"
          step="500"
          value={maxPrice}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setMaxPrice(val);
            setSelectedPreset('all');
            updateUrlParams({ maxPrice: val });
          }}
          className="premium-slider"
          style={{ 
            background: `linear-gradient(to right, var(--primary-color) ${(maxPrice - 5000) / (35000 - 5000) * 100}%, #e2e8f0 ${(maxPrice - 5000) / (35000 - 5000) * 100}%)`, 
            height: '6px',
            borderRadius: '3px'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
          <span>₹5,000</span>
          <span>₹35,000+</span>
        </div>
      </div>

      {/* 3. Gender / Tenant Type */}
      <div className="filter-group">
        <div className="filter-title">
          <span>Gender / PG Type</span>
          <Building2 size={15} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {GENDER_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`filter-pill ${selectedType === opt.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedType(opt.id);
                updateUrlParams({ type: opt.id });
              }}
            >
              {selectedType === opt.id && <Check size={14} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Amenities Checklist */}
      <div className="filter-group">
        <div className="filter-title">
          <span>Amenities</span>
          <Sparkles size={15} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {AMENITY_OPTIONS.map(amenity => {
            const Icon = amenity.icon;
            const isSelected = selectedAmenities.includes(amenity.id);
            return (
              <label
                key={amenity.id}
                onClick={() => handleAmenityToggle(amenity.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Icon size={16} color={isSelected ? 'var(--primary-color)' : '#64748b'} />
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? 'var(--primary-color)' : 'var(--text-dark)'
                  }}>
                    {amenity.label}
                  </span>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `1.5px solid ${isSelected ? 'var(--primary-color)' : '#cbd5e1'}`,
                  backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Max Security Deposit */}
      <div className="filter-group">
        <div className="filter-title">
          <span>Security Deposit</span>
          <IndianRupee size={15} />
        </div>
        <select
          className="input"
          value={maxDeposit}
          onChange={(e) => setMaxDeposit(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
          style={{ cursor: 'pointer', padding: '0.6rem 0.75rem', fontSize: '0.9rem' }}
        >
          <option value="all">Any Deposit Amount</option>
          <option value="10000">Up to ₹10,000</option>
          <option value="15000">Up to ₹15,000</option>
          <option value="20000">Up to ₹20,000</option>
          <option value="25000">Up to ₹25,000</option>
        </select>
      </div>

      {/* Reset Button on bottom */}
      <button
        onClick={handleResetFilters}
        className="btn btn-outline"
        style={{
          width: '100%',
          marginTop: '1rem',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <RotateCcw size={14} /> Clear All Filters
      </button>
    </div>
  );

  return (
    <div style={{ padding: '2rem 0 4rem 0', backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 73px)' }}>
      <div className="container">
        
        {/* Top Header & Search Bar Banner */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                Browse Available PGs {selectedCity !== 'All Cities' && <span className="text-orange">in {selectedCity}</span>}
              </h1>
              <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                Explore verified accommodations tailored to your budget, sharing preferences, and lifestyle.
              </p>
            </div>

            {/* View Mode & Mobile Filter Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Mobile Filter Toggle (only visible on mobile screens) */}
              <button 
                className="btn btn-orange filter-mobile-toggle"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              {/* Grid / Locality View Toggle */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: 'var(--surface-color)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                padding: '3px'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: viewMode === 'grid' ? 'var(--primary-color)' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Grid3X3 size={15} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: viewMode === 'map' ? 'var(--primary-color)' : 'transparent',
                    color: viewMode === 'map' ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Map size={15} /> Locality View
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Search Keyword Input */}
              <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                <SearchIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  className="input"
                  placeholder="Search by PG name, locality (e.g. Hinjewadi, Kothrud), or keywords..."
                  style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    updateUrlParams({ q: val });
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      updateUrlParams({ q: '' });
                    }}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '190px' }}>
                <ArrowUpDown size={16} color="var(--text-secondary)" />
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateUrlParams({ sort: e.target.value });
                  }}
                  style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Active Filter Chips / Tags */}
            {activeFilterCount > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                flexWrap: 'wrap', 
                marginTop: '0.85rem', 
                paddingTop: '0.75rem', 
                borderTop: '1px solid var(--border-color)' 
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Active Filters ({activeFilterCount}):
                </span>

                {searchQuery.trim() && (
                  <span className="filter-tag">
                    Keyword: "{searchQuery}"
                    <button onClick={() => { setSearchQuery(''); updateUrlParams({ q: '' }); }}><X size={12} /></button>
                  </span>
                )}

                {selectedCity !== 'All Cities' && (
                  <span className="filter-tag">
                    City: {selectedCity}
                    <button onClick={() => { setSelectedCity('All Cities'); updateUrlParams({ city: '' }); }}><X size={12} /></button>
                  </span>
                )}

                {(maxPrice < 30000 || selectedPreset !== 'all') && (
                  <span className="filter-tag">
                    Max: ₹{maxPrice.toLocaleString()}
                    <button onClick={() => { setMaxPrice(30000); setSelectedPreset('all'); updateUrlParams({ maxPrice: '' }); }}><X size={12} /></button>
                  </span>
                )}

                {selectedType !== 'all' && (
                  <span className="filter-tag">
                    Type: {GENDER_OPTIONS.find(o => o.id === selectedType)?.label}
                    <button onClick={() => { setSelectedType('all'); updateUrlParams({ type: '' }); }}><X size={12} /></button>
                  </span>
                )}

                {maxDeposit !== 'all' && (
                  <span className="filter-tag">
                    Deposit ≤ ₹{maxDeposit.toLocaleString()}
                    <button onClick={() => setMaxDeposit('all')}><X size={12} /></button>
                  </span>
                )}

                {selectedAmenities.map(amenityId => {
                  const opt = AMENITY_OPTIONS.find(a => a.id === amenityId);
                  return (
                    <span key={amenityId} className="filter-tag">
                      {opt?.label}
                      <button onClick={() => handleAmenityToggle(amenityId)}><X size={12} /></button>
                    </span>
                  );
                })}

                <button 
                  onClick={handleResetFilters}
                  style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600, marginLeft: 'auto' }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Drawer / Modal */}
        {mobileFiltersOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end'
          }} onClick={() => setMobileFiltersOpen(false)}>
            <div 
              style={{
                width: '85%',
                maxWidth: '360px',
                height: '100%',
                backgroundColor: 'var(--surface-color)',
                padding: '1.5rem',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Filter Properties</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{ padding: '0.4rem', borderRadius: '50%', background: '#f1f5f9' }}
                >
                  <X size={18} />
                </button>
              </div>

              {renderFilterControls()}

              <button
                className="btn btn-orange"
                onClick={() => setMobileFiltersOpen(false)}
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}
              >
                Apply Filters ({filteredPgs.length} properties)
              </button>
            </div>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="browse-layout">
          
          {/* Desktop Filter Sidebar */}
          <aside className="filter-sidebar-desktop" style={{ position: 'sticky', top: '90px' }}>
            <div className="filter-card">
              {renderFilterControls()}
            </div>
          </aside>

          {/* Right Main Content */}
          <main>
            {/* Results Counter & Sort Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                Showing <strong style={{ color: 'var(--text-dark)' }}>{filteredPgs.length}</strong> {filteredPgs.length === 1 ? 'property' : 'properties'}
                {allPgs.length > 0 && filteredPgs.length !== allPgs.length && ` (filtered from ${allPgs.length} total)`}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="text-muted" style={{ marginTop: '1rem', fontSize: '1.05rem' }}>Loading properties...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPgs.length === 0 && (
              <div className="card flex-col items-center justify-center" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <MapPin size={32} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>No Matching PGs Found</h3>
                <p className="text-muted" style={{ maxWidth: '450px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  We couldn't find any properties matching your current filters in <strong>{selectedCity}</strong>. Try relaxing your budget, clearing selected amenities, or switching city.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-orange" onClick={handleResetFilters}>
                    <RotateCcw size={15} style={{ marginRight: '0.4rem' }} /> Clear All Filters
                  </button>
                  {selectedCity !== 'All Cities' && (
                    <button className="btn btn-outline" style={{ border: '1px solid var(--border-color)' }} onClick={() => setSelectedCity('All Cities')}>
                      View All Cities
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* View Mode 1: Locality Explorer / Map Mode */}
            {!loading && viewMode === 'map' && filteredPgs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Map size={24} color="#93c5fd" />
                    <h2 style={{ fontSize: '1.4rem', color: 'white', margin: 0 }}>Locality & Area Explorer</h2>
                  </div>
                  <p style={{ color: '#bfdbfe', fontSize: '0.9rem', maxWidth: '600px', margin: 0 }}>
                    Select an area to view available PGs, compare average rents, and find the best hub for your daily commute.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {localitySummary.map((loc, idx) => (
                    <div 
                      key={idx}
                      className="card"
                      style={{ padding: '1.25rem', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: '#eff6ff', color: 'var(--primary-color)', borderRadius: '1rem' }}>
                          {loc.city}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {loc.count} {loc.count === 1 ? 'PG' : 'PGs'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                        {loc.location}
                      </h3>
                      <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                        Rent from <strong>₹{loc.minRent.toLocaleString()}</strong> to <strong>₹{loc.maxRent.toLocaleString()}</strong>/mo
                      </p>
                      <button
                        className="btn btn-outline"
                        style={{ width: '100%', fontSize: '0.85rem', border: '1px solid var(--border-color)', padding: '0.45rem' }}
                        onClick={() => {
                          setSearchQuery(loc.location);
                          setViewMode('grid');
                        }}
                      >
                        Filter {loc.location} PGs
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Mode 2: Standard PG Grid */}
            {!loading && viewMode === 'grid' && filteredPgs.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {filteredPgs.map((pg) => {
                  const typeBadge = getPgTypeBadge(pg);
                  const pgAmenities = getPgAmenities(pg);
                  const isSaved = savedIds.includes(pg.id);

                  return (
                    <div 
                      key={pg.id} 
                      className="card" 
                      onClick={() => navigate(`/pg/${pg.id}`)}
                      style={{ 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        transition: 'transform 0.15s ease, box-shadow 0.2s ease', 
                        cursor: 'pointer' 
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      {/* Property Image & Wishlist Button */}
                      <div style={{ position: 'relative' }}>
                        {pg.image_url ? (
                          <div style={{ 
                            height: '190px', 
                            backgroundImage: `url(${resolveImg(pg.image_url)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }} />
                        ) : (
                          <div style={{ 
                            height: '190px', 
                            backgroundColor: '#e2e8f0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#94a3b8'
                          }}>
                            <span>No Image Provided</span>
                          </div>
                        )}

                        {/* Gender / Accommodation Badge */}
                        <div style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          left: '12px',
                          display: 'flex',
                          gap: '0.35rem'
                        }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            padding: '0.25rem 0.65rem', 
                            backgroundColor: typeBadge.bg, 
                            color: typeBadge.color, 
                            borderRadius: '1rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {typeBadge.label}
                          </span>
                        </div>

                        {/* Save / Wishlist Button */}
                        <button
                          onClick={(e) => handleToggleSave(e, pg.id)}
                          title={isSaved ? "Remove from saved" : "Save for later"}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            transition: 'transform 0.15s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Heart 
                            size={18} 
                            fill={isSaved ? "#ef4444" : "none"} 
                            color={isSaved ? "#ef4444" : "#64748b"} 
                          />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        
                        {/* Price & Verified Row */}
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', backgroundColor: '#eff6ff', color: 'var(--primary-color)', borderRadius: '1rem' }}>
                            <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
                            Verified
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-dark)' }}>
                            ₹{pg.rent.toLocaleString()}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
                          </span>
                        </div>

                        {/* PG Name */}
                        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                          {pg.name}
                        </h3>

                        {/* Locality & City */}
                        <div className="flex items-center gap-1 text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                          <MapPin size={14} color="#f97316" /> {pg.location}, {pg.city}
                        </div>

                        {/* Description Preview */}
                        <p className="text-muted" style={{ 
                          fontSize: '0.875rem', 
                          marginBottom: '1rem', 
                          lineHeight: 1.5,
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden' 
                        }}>
                          {pg.description}
                        </p>

                        {/* Amenities Chips Preview */}
                        {pgAmenities.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                            {pgAmenities.slice(0, 3).map(a => {
                              const Icon = a.icon;
                              return (
                                <span 
                                  key={a.id}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    color: 'var(--text-secondary)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                >
                                  <Icon size={12} color="var(--primary-color)" /> {a.label}
                                </span>
                              );
                            })}
                            {pgAmenities.length > 3 && (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>
                                +{pgAmenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer: Deposit & Action Button */}
                        <div 
                          style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: 'auto' }} 
                          className="flex justify-between items-center"
                        >
                          <div className="text-muted" style={{ fontSize: '0.825rem' }}>
                            Deposit: <strong>₹{pg.deposit.toLocaleString()}</strong>
                          </div>
                          <button 
                            className="btn btn-outline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pg/${pg.id}`);
                            }}
                            style={{ 
                              padding: '0.35rem 0.75rem', 
                              fontSize: '0.85rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px'
                            }}
                          >
                            View Details
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};

export default Search;

