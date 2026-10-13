import { useState, useEffect } from 'react';
import { LayoutDashboard, Home, MessageSquare, CreditCard, FileText, User, Bell, LogOut, MapPin, CheckCircle2, Clock, AlertCircle, Heart, PlusCircle, Check, X } from 'lucide-react';

const resolveImg = (url) => {
  if (!url) return null;
  if (url.startsWith('/static/')) return `http://localhost:8000${url}`;
  return url;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Tenant State
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeStay, setActiveStay] = useState(null);
  
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });
  const [paymentForm, setPaymentForm] = useState({ method: 'UPI' });
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '' });
  const [propertyForm, setPropertyForm] = useState({ name: '', city: 'Pune', location: '', rent: 8000, deposit: 15000, description: '' });
  const [propertyImageFile, setPropertyImageFile] = useState(null);
  
  // Owner State
  const [ownerPgs, setOwnerPgs] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [ownerComplaints, setOwnerComplaints] = useState([]);
  
  const userStr = localStorage.getItem('tenant_user');
  const currentUser = userStr && userStr !== 'true' ? JSON.parse(userStr) : null;
  const isOwner = currentUser?.role === 'owner';

  const fetchDashboardData = () => {
    const token = localStorage.getItem('tenant_token');
    if (!token) return;
    
    if (isOwner) {
       fetch('http://localhost:8000/owner/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : null)
       .then(data => {
          if (data) {
             setOwnerPgs(data.pgs || []);
             setOwnerRequests(data.requests || []);
          }
       });
       
       fetch('http://localhost:8000/owner/complaints', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : [])
       .then(data => setOwnerComplaints(Array.isArray(data) ? data : []));
       
       fetch('http://localhost:8000/tenant/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : [])
       .then(data => setNotifications(Array.isArray(data) ? data : []));
       
    } else {
       fetch('http://localhost:8000/tenant/join-requests', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : [])
       .then(data => setRequests(Array.isArray(data) ? data : []));
       
       fetch('http://localhost:8000/tenant/complaints', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : [])
       .then(data => setComplaints(Array.isArray(data) ? data : []));
       
       fetch('http://localhost:8000/tenant/payments', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : [])
       .then(data => setPayments(Array.isArray(data) ? data : []));
       
       fetch('http://localhost:8000/tenant/saved', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : [])
       .then(data => setSavedProperties(Array.isArray(data) ? data : []));
       
       fetch('http://localhost:8000/tenant/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : [])
       .then(data => setNotifications(Array.isArray(data) ? data : []));
       
       fetch('http://localhost:8000/tenant/active-stay', { headers: { 'Authorization': `Bearer ${token}` } })
       .then(r => r.ok ? r.json() : null)
       .then(data => setActiveStay(data));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const navItems = isOwner ? [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'properties', label: 'My Properties', icon: Home },
    { id: 'applications', label: 'Join Requests', icon: FileText },
    { id: 'complaints', label: 'Tenant Complaints', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saved', label: 'Saved PGs', icon: Heart },
    { id: 'requests', label: 'My Requests', icon: FileText },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const handlePayRent = () => {
     if (!activeStay) return alert("You don't have an active stay yet.");
     setModalState({ isOpen: true, type: 'PAYMENT' });
  };
  
  const submitPayment = async () => {
     const token = localStorage.getItem('tenant_token');
     try {
       const res = await fetch('http://localhost:8000/tenant/payments', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ pg_id: activeStay.id, amount: activeStay.rent, method: paymentForm.method })
       });
       if (res.ok) {
         setModalState({ isOpen: false, type: '' });
         fetchDashboardData();
       }
     } catch (e) {
       alert("Error processing payment.");
     }
  };

  const handleRemoveSaved = async (pgId) => {
    const token = localStorage.getItem('tenant_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/tenant/saved/${pgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedProperties(prev => prev.filter(item => item.id !== pgId));
      }
    } catch (e) {
      console.error("Failed to remove saved property", e);
    }
  };

  const handleOwnerRequest = async (reqId, status) => {
     const token = localStorage.getItem('tenant_token');
     try {
       const res = await fetch(`http://localhost:8000/owner/join-requests/${reqId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ status })
       });
       if (res.ok) {
         alert(`Request ${status}`);
         fetchDashboardData();
       }
     } catch (e) {
       alert("Error updating request.");
     }
  };

  const handleOwnerComplaint = async (compId, status) => {
     const token = localStorage.getItem('tenant_token');
     try {
       const res = await fetch(`http://localhost:8000/owner/complaints/${compId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ status })
       });
       if (res.ok) {
         alert(`Complaint marked as ${status}`);
         fetchDashboardData();
       }
     } catch (e) {}
  };

  const handleAddProperty = () => {
     setModalState({ isOpen: true, type: 'PROPERTY' });
  };
  
  const submitProperty = async () => {
     const token = localStorage.getItem('tenant_token');
     if (propertyForm.name && propertyForm.city && propertyForm.location) {
       try {
         const res = await fetch('http://localhost:8000/owner/properties', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ 
             name: propertyForm.name, city: propertyForm.city, location: propertyForm.location, 
             rent: parseFloat(propertyForm.rent), deposit: parseFloat(propertyForm.deposit), description: propertyForm.description || "A great place to stay"
           })
         });
         if (res.ok) {
           // If an image was selected, upload it after getting the new PG id
           if (propertyImageFile) {
             const allPgs = await fetch('http://localhost:8000/owner/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
             const newPg = allPgs.pgs && allPgs.pgs[allPgs.pgs.length - 1];
             if (newPg) {
               const fd = new FormData();
               fd.append('file', propertyImageFile);
               await fetch(`http://localhost:8000/owner/properties/${newPg.id}/upload-image`, {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${token}` },
                 body: fd
               });
             }
           }
           setModalState({ isOpen: false, type: '' });
           setPropertyForm({ name: '', city: 'Pune', location: '', rent: 8000, deposit: 15000, description: '' });
           setPropertyImageFile(null);
           fetchDashboardData();
         } else {
           const err = await res.json();
           alert("Failed: " + (err.detail || "Unknown error"));
         }
       } catch (e) {
         alert("Error adding property.");
       }
     }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)', backgroundColor: 'var(--bg-color)' }}>
      
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', padding: '2rem 0' }}>
        <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            {isOwner ? 'Owner Menu' : 'Tenant Menu'}
          </p>
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
                    width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 2rem',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                    borderRight: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                    fontWeight: isActive ? 600 : 500, transition: 'all 0.2s ease', textAlign: 'left'
                  }}
                >
                  <Icon size={18} /> {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        
        <div style={{ position: 'absolute', bottom: '2rem', left: 0, width: '280px' }}>
          <button 
            onClick={() => {
              localStorage.removeItem('tenant_token');
              localStorage.removeItem('tenant_user');
              window.dispatchEvent(new Event('auth-change'));
              window.location.href = '/login';
            }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 2rem', color: 'var(--text-secondary)', fontWeight: 500 }}
          >
             <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '3rem', maxHeight: 'calc(100vh - 73px)', overflowY: 'auto' }}>
        
        {/* ---------------- TENANT DASHBOARD ---------------- */}
        {!isOwner && activeTab === 'dashboard' && (
           <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
               Welcome back{currentUser ? `, ${currentUser.full_name.split(' ')[0]}` : ''}!
             </h1>
             <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Here is what's happening with your stay today.</p>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
               <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                 <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Next Rent Due</p>
                 <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>{activeStay ? `₹${activeStay.rent}` : '₹0'}</h2>
                 {activeStay ? (
                   <button onClick={handlePayRent} className="btn btn-orange" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>Pay Now</button>
                 ) : (
                   <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>No active stay</p>
                 )}
               </div>
               <div className="card" style={{ padding: '1.5rem' }}>
                 <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Requests</p>
                 <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>{requests.length}</h2>
               </div>
               <div className="card" style={{ padding: '1.5rem' }}>
                 <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Open Complaints</p>
                 <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>{complaints.length}</h2>
               </div>
             </div>
           </div>
        )}

        {!isOwner && activeTab === 'saved' && (
           <div className="animate-fade-in">
             <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <div>
                 <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Saved Properties</h1>
                 <p className="text-muted">Properties you've shortlisted for later review.</p>
               </div>
               <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                 {savedProperties.length} {savedProperties.length === 1 ? 'Property' : 'Properties'}
               </span>
             </div>

             {savedProperties.length === 0 ? (
               <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                 <Heart size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                 <h3 style={{ marginBottom: '0.5rem' }}>No Saved Properties Yet</h3>
                 <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                   Browse available PGs and click "Save for Later" to build your wishlist.
                 </p>
                 <button className="btn btn-orange" onClick={() => window.location.href = '/search'}>
                   Explore Properties
                 </button>
               </div>
             ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {savedProperties.map(pg => (
                    <div key={pg.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      {pg.image_url ? (
                        <div style={{
                          height: '180px',
                          backgroundImage: `url(${resolveImg(pg.image_url)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative'
                        }}>
                          <button
                            onClick={() => handleRemoveSaved(pg.id)}
                            title="Remove from saved"
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            <Heart size={16} fill="#ef4444" color="#ef4444" />
                          </button>
                        </div>
                      ) : (
                        <div style={{ height: '160px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', position: 'relative' }}>
                          <span>No Image</span>
                          <button
                            onClick={() => handleRemoveSaved(pg.id)}
                            title="Remove from saved"
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              backgroundColor: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            <Heart size={16} fill="#ef4444" color="#ef4444" />
                          </button>
                        </div>
                      )}
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }}/>
                            {pg.location ? `${pg.location}, ` : ''}{pg.city}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-dark)' }}>
                            ₹{pg.rent}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{pg.name}</h3>
                        {pg.description && (
                          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {pg.description}
                          </p>
                        )}
                        <div className="flex gap-2" style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                          <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }} onClick={() => window.location.href=`/pg/${pg.id}`}>
                            View Details
                          </button>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fca5a5' }}
                            onClick={() => handleRemoveSaved(pg.id)}
                            title="Remove"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             )}
           </div>
        )}

        {/* ---------------- OWNER DASHBOARD ---------------- */}
        {isOwner && activeTab === 'dashboard' && (
           <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
               Owner Portal
             </h1>
             <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Manage your properties and tenants.</p>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
               <div className="card" style={{ padding: '1.5rem' }}>
                 <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>My Properties</p>
                 <h2 style={{ fontSize: '2.5rem', color: 'var(--text-dark)' }}>{ownerPgs.length}</h2>
               </div>
               <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
                 <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Applications</p>
                 <h2 style={{ fontSize: '2.5rem', color: 'var(--text-dark)' }}>{ownerRequests.filter(r => r.status.toLowerCase() === 'pending').length}</h2>
               </div>
             </div>
           </div>
        )}

        {isOwner && activeTab === 'properties' && (
           <div className="animate-fade-in">
             <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <h1 style={{ fontSize: '2rem' }}>My Properties</h1>
               <button className="btn btn-orange flex items-center gap-2" onClick={handleAddProperty}><PlusCircle size={16}/> Add Property</button>
             </div>
             <div style={{ display: 'grid', gap: '1.5rem' }}>
               {ownerPgs.map(pg => (
                 <div key={pg.id} className="card flex justify-between items-center" style={{ padding: '1.5rem' }}>
                   <div>
                     <h3 style={{ fontSize: '1.25rem' }}>{pg.name}</h3>
                     <p className="text-muted">Rent: ₹{pg.rent}</p>
                   </div>
                   <button className="btn btn-outline" onClick={() => window.location.href=`/pg/${pg.id}`}>View Listing</button>
                 </div>
               ))}
             </div>
           </div>
        )}

        {isOwner && activeTab === 'applications' && (
           <div className="animate-fade-in">
             <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <div>
                 <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Join Requests</h1>
                 <p className="text-muted">Review and manage tenant applications for your properties.</p>
               </div>
               <div className="flex gap-2">
                 <span style={{ padding: '0.4rem 1rem', backgroundColor: '#fef9c3', color: '#a16207', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>
                   ⏳ {ownerRequests.filter(r => r.status.toLowerCase() === 'pending').length} Pending
                 </span>
                 <span style={{ padding: '0.4rem 1rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700 }}>
                   ✅ {ownerRequests.filter(r => r.status.toLowerCase() === 'approved').length} Approved
                 </span>
               </div>
             </div>

             <div style={{ display: 'grid', gap: '1rem' }}>
               {ownerRequests.length === 0 ? (
                 <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                   <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                   <h3 style={{ marginBottom: '0.5rem' }}>No Join Requests Yet</h3>
                   <p className="text-muted">Tenants who request to join your properties will appear here.</p>
                 </div>
               ) : ownerRequests.map(req => {
                 const s = req.status?.toLowerCase();
                 const borderColors = { approved: '#16a34a', rejected: '#dc2626', pending: '#eab308' };
                 const badgeStyles = {
                   approved: { bg: '#dcfce7', color: '#166534' },
                   rejected: { bg: '#fee2e2', color: '#991b1b' },
                   pending:  { bg: '#fef9c3', color: '#a16207' },
                 };
                 const bs = badgeStyles[s] || badgeStyles.pending;
                 return (
                   <div key={req.id} className="card flex justify-between items-center" style={{ padding: '1.5rem', borderLeft: `4px solid ${borderColors[s] || '#eab308'}`, gap: '1.5rem' }}>
                     <div style={{ flex: 1 }}>
                       <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
                         <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           <User size={18} color="#64748b" />
                         </div>
                         <div>
                           <h4 style={{ fontSize: '1.1rem', marginBottom: '0' }}>{req.tenant_name}</h4>
                         </div>
                       </div>
                       <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                         Requesting to join <strong>{req.pg_name}</strong>
                       </p>
                     </div>
                     <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                       <span style={{ padding: '0.3rem 0.85rem', backgroundColor: bs.bg, color: bs.color, borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                         {s === 'approved' && '✅ '}{s === 'pending' && '⏳ '}{s === 'rejected' && '❌ '}
                         {req.status}
                       </span>
                       {s === 'pending' && (
                         <div className="flex gap-2">
                           <button
                             className="btn"
                             style={{ backgroundColor: '#16a34a', color: 'white', padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                             onClick={() => handleOwnerRequest(req.id, 'Approved')}
                           >
                             <Check size={14}/> Approve
                           </button>
                           <button
                             className="btn"
                             style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                             onClick={() => handleOwnerRequest(req.id, 'Rejected')}
                           >
                             <X size={14}/> Reject
                           </button>
                         </div>
                       )}
                       {s === 'approved' && (
                         <button
                           className="btn btn-outline"
                           style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5' }}
                           onClick={() => handleOwnerRequest(req.id, 'Rejected')}
                         >
                           Revoke
                         </button>
                       )}
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
        )}


        {isOwner && activeTab === 'complaints' && (
           <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Tenant Complaints</h1>
             <div style={{ display: 'grid', gap: '1rem' }}>
               {ownerComplaints.length === 0 ? <p className="text-muted">No tenant complaints.</p> : ownerComplaints.map(c => (
                 <div key={c.id} className="card" style={{ padding: '1.5rem', borderLeft: c.status.toLowerCase() === 'open' ? '4px solid #ef4444' : '4px solid #16a34a' }}>
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{c.title}</h4>
                       <p className="text-muted" style={{ marginBottom: '1rem' }}>{c.description}</p>
                       <p className="text-muted" style={{ fontSize: '0.85rem' }}>Tenant: <strong>{c.tenant_name}</strong> &nbsp;|&nbsp; PG: <strong>{c.pg_name}</strong></p>
                     </div>
                     <div className="flex flex-col gap-2">
                       <span style={{ padding: '0.3rem 0.8rem', backgroundColor: c.status.toLowerCase() === 'open' ? '#fee2e2' : '#dcfce7', color: c.status.toLowerCase() === 'open' ? '#991b1b' : '#166534', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                         {c.status}
                       </span>
                       {c.status.toLowerCase() === 'open' && (
                         <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem' }} onClick={() => handleOwnerComplaint(c.id, 'Resolved')}>Mark Resolved</button>
                       )}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* ---------------- SHARED TABS ---------------- */}
        {activeTab === 'notifications' && (
           <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Notifications</h1>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {notifications.length === 0 ? <p className="text-muted">No recent notifications.</p> : notifications.map(notif => (
                 <div key={notif.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', backgroundColor: notif.is_read ? 'white' : '#f8fafc' }}>
                   <Bell size={24} className="text-blue" style={{ marginTop: '0.2rem' }} />
                   <div>
                     <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{notif.message}</h4>
                     <p className="text-muted" style={{ fontSize: '0.8rem' }}>{notif.created_at}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}
        
        {activeTab === 'requests' && !isOwner && (
           <div className="animate-fade-in">
             <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <div>
                 <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Requests</h1>
                 <p className="text-muted">Track your join requests to PG properties.</p>
               </div>
               <button className="btn btn-orange" style={{ fontSize: '0.9rem' }} onClick={() => window.location.href = '/search'}>
                 Find More PGs
               </button>
             </div>

             {requests.length === 0 ? (
               <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                 <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                 <h3 style={{ marginBottom: '0.5rem' }}>No Requests Yet</h3>
                 <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                   Browse PGs and send a join request to get started.
                 </p>
                 <button className="btn btn-orange" onClick={() => window.location.href = '/search'}>
                   Explore Properties
                 </button>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {requests.map(req => {
                   const s = req.status?.toLowerCase();
                   const borderColors = { approved: '#16a34a', rejected: '#dc2626', pending: '#eab308' };
                   const badgeStyles = {
                     approved: { bg: '#dcfce7', color: '#166534' },
                     rejected: { bg: '#fee2e2', color: '#991b1b' },
                     pending:  { bg: '#fef9c3', color: '#a16207' },
                   };
                   const bs = badgeStyles[s] || badgeStyles.pending;
                   return (
                     <div key={req.id} className="card" style={{ overflow: 'hidden', borderLeft: `4px solid ${borderColors[s] || '#eab308'}` }}>
                       <div className="flex" style={{ gap: '0' }}>
                         {req.pg_image_url && (
                           <div style={{
                             width: '130px',
                             minHeight: '110px',
                             backgroundImage: `url(${req.pg_image_url})`,
                             backgroundSize: 'cover',
                             backgroundPosition: 'center',
                             flexShrink: 0
                           }} />
                         )}
                         <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                           <div>
                             <h4 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{req.pg_name}</h4>
                             <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                               <MapPin size={13} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-2px' }} />
                               {req.pg_location ? `${req.pg_location}, ` : ''}{req.pg_city}
                             </p>
                             {req.pg_rent && (
                               <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>₹{req.pg_rent}/mo</p>
                             )}
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0 }}>
                             <span style={{ padding: '0.3rem 0.85rem', backgroundColor: bs.bg, color: bs.color, borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                               {s === 'approved' && '✅ '}{s === 'pending' && '⏳ '}{s === 'rejected' && '❌ '}
                               {req.status}
                             </span>
                             <div className="flex gap-2">
                               <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => window.location.href = `/pg/${req.pg_id}`}>
                                 View PG
                               </button>
                               {s === 'pending' && (
                                 <button
                                   className="btn btn-outline"
                                   style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                   onClick={async () => {
                                     if (!confirm('Cancel your join request?')) return;
                                     const token = localStorage.getItem('tenant_token');
                                     try {
                                       const res = await fetch(`http://localhost:8000/tenant/join/${req.id}`, {
                                         method: 'DELETE',
                                         headers: { 'Authorization': `Bearer ${token}` }
                                       });
                                       if (res.ok) {
                                         setRequests(prev => prev.filter(r => r.id !== req.id));
                                       } else {
                                         const d = await res.json();
                                         alert(d.detail || 'Failed to cancel.');
                                       }
                                     } catch { alert('Network error.'); }
                                   }}
                                 >
                                   Cancel
                                 </button>
                               )}
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
        )}

        {activeTab === 'complaints' && !isOwner && (
           <div className="animate-fade-in">
             <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <h1 style={{ fontSize: '2rem' }}>Complaints</h1>
               <button className="btn btn-orange" onClick={() => {
                 if (!activeStay) return alert("You don't have an active stay to file a complaint for.");
                 setModalState({ isOpen: true, type: 'COMPLAINT' });
               }}>+ Raise Complaint</button>
             </div>
             <div className="card" style={{ overflow: 'hidden' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                   <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                     <th style={{ padding: '1rem', fontWeight: 600 }}>ID</th>
                     <th style={{ padding: '1rem', fontWeight: 600 }}>Issue</th>
                     <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {complaints.map(c => (
                     <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                       <td style={{ padding: '1rem' }}>#{c.id}</td>
                       <td style={{ padding: '1rem' }}>{c.title}</td>
                       <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{c.status}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'payments' && !isOwner && (
           <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Payment History</h1>
             <div className="card" style={{ overflow: 'hidden' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                   <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                     <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                     <th style={{ padding: '1rem', fontWeight: 600 }}>Desc</th>
                     <th style={{ padding: '1rem', fontWeight: 600 }}>Amount</th>
                     <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {payments.map(p => (
                     <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                       <td style={{ padding: '1rem' }}>{p.date}</td>
                       <td style={{ padding: '1rem' }}>{p.description} via {p.method}</td>
                       <td style={{ padding: '1rem', fontWeight: 600 }}>₹{p.amount}</td>
                       <td style={{ padding: '1rem', color: '#166534', fontWeight: 600 }}>{p.status}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'profile' && (
           <div className="animate-fade-in">
             <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>My Profile</h1>
             <div className="card" style={{ padding: '2.5rem' }}>
               <h2 style={{ fontSize: '1.5rem', textTransform: 'capitalize', marginBottom: '1rem' }}>{currentUser ? currentUser.full_name : 'User'}</h2>
               <p className="text-muted">Email: {currentUser ? currentUser.email : 'Unknown'}</p>
               <p className="text-muted">Role: <span style={{ textTransform: 'capitalize' }}>{currentUser ? currentUser.role : 'Tenant'}</span></p>
             </div>
           </div>
        )}

      </div>

      {modalState.isOpen && modalState.type === 'PAYMENT' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Pay Rent</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Payment Method</label>
              <select className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={paymentForm.method} onChange={(e) => setPaymentForm({ method: e.target.value })}>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setModalState({ isOpen: false, type: '' })}>Cancel</button>
              <button className="btn btn-orange" onClick={submitPayment}>Pay ₹{activeStay?.rent}</button>
            </div>
          </div>
        </div>
      )}

      {modalState.isOpen && modalState.type === 'COMPLAINT' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Raise a Complaint</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Issue Title</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} placeholder="e.g. AC not cooling" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
              <textarea className="form-input" style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} placeholder="Describe the issue in detail..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setModalState({ isOpen: false, type: '' })}>Cancel</button>
              <button className="btn btn-orange" onClick={async () => {
                const token = localStorage.getItem('tenant_token');
                if (complaintForm.title && complaintForm.description) {
                   try {
                     const res = await fetch('http://localhost:8000/tenant/complaints', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                       body: JSON.stringify({ pg_id: activeStay.id, title: complaintForm.title, description: complaintForm.description })
                     });
                     if (res.ok) { 
                        setModalState({ isOpen: false, type: '' });
                        setComplaintForm({ title: '', description: '' });
                        fetchDashboardData(); 
                     }
                   } catch (err) {}
                }
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {modalState.isOpen && modalState.type === 'PROPERTY' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add New Property</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Property Name</label>
                <input type="text" className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={propertyForm.name} onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City</label>
                <input type="text" className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={propertyForm.city} onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location (Area)</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={propertyForm.location} onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Monthly Rent (₹)</label>
                <input type="number" className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={propertyForm.rent} onChange={(e) => setPropertyForm({ ...propertyForm, rent: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deposit (₹)</label>
                <input type="number" className="form-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={propertyForm.deposit} onChange={(e) => setPropertyForm({ ...propertyForm, deposit: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
              <textarea className="form-input" style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} value={propertyForm.description} onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Property Photo <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(optional)</span></label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPropertyImageFile(e.target.files[0] || null)}
                style={{ display: 'block', width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}
              />
              {propertyImageFile && (
                <p style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Selected: {propertyImageFile.name}
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline" onClick={() => setModalState({ isOpen: false, type: '' })}>Cancel</button>
              <button className="btn btn-orange" onClick={submitProperty}>Add Property</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
