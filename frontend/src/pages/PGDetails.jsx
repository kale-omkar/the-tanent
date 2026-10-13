import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, CheckCircle2, ShieldCheck, User, Zap, Wifi, Coffee, Wind, Heart } from 'lucide-react';

const resolveImg = (url) => {
  if (!url) return null;
  if (url.startsWith('/static/')) return `http://localhost:8000${url}`;
  return url;
};

const PGDetails = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState(null); // null | { has_requested, status, request_id }
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/pgs/${id}`)
      .then(res => res.json())
      .then(data => {
        setPg(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch PG:", err);
        setLoading(false);
      });

    const token = localStorage.getItem('tenant_token');
    if (token) {
      fetch(`http://localhost:8000/tenant/saved/${id}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && typeof data.is_saved === 'boolean') {
            setIsSaved(data.is_saved);
          }
        })
        .catch(() => {});

      fetch(`http://localhost:8000/tenant/join/${id}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setJoinStatus(data);
        })
        .catch(() => {});
    }
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Loading property details...</div>;
  if (!pg) return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Property not found.</div>;

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: 'calc(100vh - 73px)', paddingBottom: '4rem' }}>
      {/* Image Gallery / Cover */}
      {pg.image_url ? (
        <div style={{ 
          height: '400px', 
          width: '100%', 
          backgroundImage: `url(${resolveImg(pg.image_url)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)'
        }} />
      ) : (
        <div style={{ backgroundColor: '#e2e8f0', height: '350px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          <h2>Property Image Gallery</h2>
        </div>
      )}

      <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
        <div className="flex" style={{ gap: '2rem', alignItems: 'flex-start' }}>
          
          {/* Main Content */}
          <div className="card" style={{ flex: 1, padding: '2.5rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.3rem 0.8rem', backgroundColor: '#eff6ff', color: 'var(--primary-color)', borderRadius: '1rem' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Verified Property
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.3rem 0.8rem', backgroundColor: '#f1f5f9', color: 'var(--text-secondary)', borderRadius: '1rem' }}>
                Boys & Girls
              </span>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{pg.name}</h1>
            <p className="text-muted flex items-center gap-2" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
              <MapPin size={18} /> {pg.location}, {pg.city}
            </p>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>About this Property</h3>
            <p className="text-muted" style={{ marginBottom: '2.5rem', lineHeight: 1.8 }}>
              {pg.description}
            </p>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Amenities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
              <div className="flex items-center gap-2 text-muted"><Wifi size={18} className="text-blue" /> High-Speed WiFi</div>
              <div className="flex items-center gap-2 text-muted"><Coffee size={18} className="text-orange" /> Food Included</div>
              <div className="flex items-center gap-2 text-muted"><Wind size={18} className="text-blue" /> Air Conditioning</div>
              <div className="flex items-center gap-2 text-muted"><Zap size={18} className="text-orange" /> Power Backup</div>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Location</h3>
            <div style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <iframe 
                title="Property Location"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.location + ', ' + pg.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                style={{ border: 0 }}
              ></iframe>
            </div>
          </div>

          {/* Sidebar Pricing/Action */}
          <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Monthly Rent from</p>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
                ₹{pg.rent} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ mo</span>
              </h2>

              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <span className="text-muted">Security Deposit</span>
                <span style={{ fontWeight: 600 }}>₹{pg.deposit}</span>
              </div>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                <span className="text-muted">Notice Period</span>
                <span style={{ fontWeight: 600 }}>30 Days</span>
              </div>

              {/* ----- Join Request Button ----- */}
              {(() => {
                const currentUser = (() => { try { const s = localStorage.getItem('tenant_user'); return s && s !== 'true' ? JSON.parse(s) : null; } catch { return null; } })();
                const isOwner = currentUser?.role === 'owner';
                const isLoggedIn = !!localStorage.getItem('tenant_token');

                if (isOwner) return null; // Owners don't join PGs

                if (!isLoggedIn) {
                  return (
                    <button
                      className="btn btn-orange"
                      style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginBottom: '0.5rem' }}
                      onClick={() => window.location.href = '/login'}
                    >
                      Login to Request Join
                    </button>
                  );
                }

                if (joinStatus?.has_requested) {
                  const s = joinStatus.status?.toLowerCase();
                  const statusColors = {
                    approved: { bg: '#dcfce7', color: '#166534', border: '#16a34a' },
                    rejected: { bg: '#fee2e2', color: '#991b1b', border: '#dc2626' },
                    pending:  { bg: '#fef9c3', color: '#a16207', border: '#eab308' },
                  };
                  const sc = statusColors[s] || statusColors.pending;
                  return (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ width: '100%', padding: '0.85rem 1rem', backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                        {s === 'approved' && '✅ Request Approved!'}
                        {s === 'pending'  && '⏳ Request Pending Review'}
                        {s === 'rejected' && '❌ Request Rejected'}
                      </div>
                      {s === 'pending' && (
                        <button
                          disabled={joinLoading}
                          className="btn btn-outline"
                          style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={async () => {
                            if (!confirm('Cancel your join request?')) return;
                            setJoinLoading(true);
                            try {
                              const token = localStorage.getItem('tenant_token');
                              const res = await fetch(`http://localhost:8000/tenant/join/${joinStatus.request_id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (res.ok) {
                                setJoinStatus({ has_requested: false, status: null, request_id: null });
                              } else {
                                const d = await res.json();
                                alert(d.detail || 'Failed to cancel.');
                              }
                            } catch { alert('Network error.'); }
                            finally { setJoinLoading(false); }
                          }}
                        >
                          {joinLoading ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}
                      {s === 'rejected' && (
                        <button
                          disabled={joinLoading}
                          className="btn btn-orange"
                          style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                          onClick={async () => {
                            setJoinLoading(true);
                            try {
                              const token = localStorage.getItem('tenant_token');
                              const res = await fetch('http://localhost:8000/tenant/join', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ pg_id: parseInt(id) })
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setJoinStatus({ has_requested: true, status: data.status, request_id: data.request_id });
                              } else {
                                alert(data.detail || 'Failed to send request.');
                              }
                            } catch { alert('Network error.'); }
                            finally { setJoinLoading(false); }
                          }}
                        >
                          {joinLoading ? 'Sending...' : 'Request Again'}
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    disabled={joinLoading}
                    onClick={async () => {
                      setJoinLoading(true);
                      try {
                        const token = localStorage.getItem('tenant_token');
                        const res = await fetch('http://localhost:8000/tenant/join', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ pg_id: parseInt(id) })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setJoinStatus({ has_requested: true, status: data.status, request_id: data.request_id });
                        } else {
                          alert(data.detail || 'Failed to send request.');
                        }
                      } catch { alert('Network error.'); }
                      finally { setJoinLoading(false); }
                    }}
                    className="btn btn-orange"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', textAlign: 'center', marginBottom: '0.5rem' }}
                  >
                    {joinLoading ? 'Sending Request...' : 'Request to Join'}
                  </button>
                );
              })()}
              
              <button 
                onClick={async () => {
                  const token = localStorage.getItem('tenant_token');
                  if (!token) { 
                    alert("Please login first to save properties!"); 
                    return; 
                  }
                  setSaveLoading(true);
                  try {
                    const res = await fetch(`http://localhost:8000/tenant/saved/${id}`, { 
                      method: 'POST', 
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setIsSaved(data.is_saved);
                      if (data.is_saved) {
                        alert("Saved to your wishlist! View it in your Dashboard.");
                      } else {
                        alert("Removed from saved properties.");
                      }
                    } else {
                      alert(data.detail || "Failed to update saved status.");
                    }
                  } catch (e) {
                    alert("Network error. Please try again.");
                  } finally {
                    setSaveLoading(false);
                  }
                }} 
                disabled={saveLoading}
                className="btn btn-outline" 
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  fontSize: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  borderColor: isSaved ? '#ef4444' : undefined,
                  color: isSaved ? '#ef4444' : undefined,
                  backgroundColor: isSaved ? '#fef2f2' : undefined,
                  transition: 'all 0.2s ease'
                }}
              >
                <Heart size={18} fill={isSaved ? "#ef4444" : "none"} color={isSaved ? "#ef4444" : "currentColor"} />
                {saveLoading ? "Updating..." : isSaved ? "Saved in Wishlist" : "Save for Later"}
              </button>
              
              <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                You won't be charged yet
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
               <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Property Manager</h4>
               <div className="flex items-center gap-3">
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#64748b" />
                 </div>
                 <div>
                   <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Verified Owner</p>
                   <p className="text-muted" style={{ fontSize: '0.85rem' }}>Responds within 1 hour</p>
                 </div>
               </div>
            </div>
          </div>
          
        </div>

        {/* REVIEWS SECTION */}
        <div className="card" style={{ marginTop: '2rem', padding: '2.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Tenant Reviews</h3>
            <button className="btn btn-outline" onClick={() => {
                 const token = localStorage.getItem('tenant_token');
                 if (!token) { alert("Please login first!"); return; }
                 setShowReviewModal(true);
            }}>Leave a Review</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {(!pg.reviews || pg.reviews.length === 0) ? <p className="text-muted">No reviews yet. Be the first to review!</p> : pg.reviews.map(rev => (
               <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                 <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                   <span style={{ fontWeight: 600 }}>{rev.user_name}</span>
                   <span style={{ color: '#eab308' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</span>
                 </div>
                 <p className="text-muted">{rev.comment}</p>
               </div>
             ))}
          </div>
        </div>

      </div>

      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Write a Review</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rating (1-5)</label>
              <select className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Comment</label>
              <textarea className="form-input" style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Tell us about your experience..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="btn btn-orange" onClick={async () => {
                 const token = localStorage.getItem('tenant_token');
                 if (reviewForm.rating && reviewForm.comment) {
                   const res = await fetch(`http://localhost:8000/pgs/${id}/reviews`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                     body: JSON.stringify({ rating: reviewForm.rating, comment: reviewForm.comment })
                   });
                   if (res.ok) { setShowReviewModal(false); window.location.reload(); }
                 }
              }}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PGDetails;
