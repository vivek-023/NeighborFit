import React, { useState, useEffect } from 'react';

// Helper function to get initials from name
const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

// Helper function to get initials color
const getInitialsColor = (name) => {
  const colors = [
    '#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2', 
    '#303f9f', '#c2185b', '#5d4037', '#455a64', '#ff6f00'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

function App() {
  // All hooks at the top
  const [role, setRole] = useState(null); // 'visitor' or 'moderator'
  const [modLoggedIn, setModLoggedIn] = useState(false);
  const [modUsername, setModUsername] = useState('');
  const [modPassword, setModPassword] = useState('');
  const [modError, setModError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [authToken, setAuthToken] = useState(null);
  const [registerMode, setRegisterMode] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reviewInput, setReviewInput] = useState('');
  const [reviewList, setReviewList] = useState([]);
  const [states, setStates] = useState([]);
  const [refreshingStates, setRefreshingStates] = useState(false);
  const [imageCache, setImageCache] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  // Moderator dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedModCity, setSelectedModCity] = useState(null);
  const [selectedModLocation, setSelectedModLocation] = useState(null);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showEditCityModal, setShowEditCityModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityImageUrl, setNewCityImageUrl] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationImageUrl, setNewLocationImageUrl] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editCityImageUrl, setEditCityImageUrl] = useState('');
  const [editLocationName, setEditLocationName] = useState('');
  const [editLocationImageUrl, setEditLocationImageUrl] = useState('');
  const [editReviewText, setEditReviewText] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [modActionMessage, setModActionMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [modView, setModView] = useState('dashboard'); // 'dashboard', 'cities', 'locations', 'reviews'

  // Function to fetch image for a city or location
  const fetchImage = async (name, type = 'city') => {
    const cacheKey = `${type}_${name}`;
    
    // Check if already cached
    if (imageCache[cacheKey]) {
      return imageCache[cacheKey];
    }
    
    // Check if already loading
    if (loadingImages[cacheKey]) {
      return null;
    }
    
    setLoadingImages(prev => ({ ...prev, [cacheKey]: true }));
    
    try {
      const res = await fetch(`/api/fetch-image/${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.image_url;
        setImageCache(prev => ({ ...prev, [cacheKey]: imageUrl }));
        return imageUrl;
      }
    } catch (err) {
      console.error('Error fetching image:', err);
    } finally {
      setLoadingImages(prev => ({ ...prev, [cacheKey]: false }));
    }
    
    return null;
  };

  // Function to refresh states data
  const refreshStates = async () => {
    setRefreshingStates(true);
    try {
      const res = await fetch('/states');
      const data = await res.json();
      setStates(data);
    } catch (err) {
      console.error('Error fetching states:', err);
      setStates([]);
    } finally {
      setRefreshingStates(false);
    }
  };

  // Fetch states from backend once
  useEffect(() => {
    refreshStates();
  }, []);

  // ImageDisplay component
  const ImageDisplay = ({ name, imageUrl, type = 'city', size = 180 }) => {
    const [currentImage, setCurrentImage] = useState(imageUrl);
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(!imageUrl);
    
    useEffect(() => {
      if (imageUrl) {
        setCurrentImage(imageUrl);
        setImageError(false);
        setIsLoading(false);
      } else {
        // Try to fetch image if not provided
        fetchImage(name, type).then(url => {
          if (url) {
            setCurrentImage(url);
            setIsLoading(false);
          } else {
            setImageError(true);
            setIsLoading(false);
          }
        });
      }
    }, [name, imageUrl, type]);

    if (isLoading) {
  return (
        <div style={{
          width: '100%',
          height: size,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#666'
        }}>
          ⏳
        </div>
      );
    }

    if (imageError || !currentImage) {
      // Show initials as fallback
      return (
        <div style={{
          width: '100%',
          height: size,
          background: `linear-gradient(135deg, ${getInitialsColor(name)} 0%, ${getInitialsColor(name)}dd 100%)`,
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.3,
          color: 'white',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {getInitials(name)}
        </div>
      );
    }

    return (
      <img
        src={currentImage}
        alt={name}
        style={{
          width: '100%',
          height: size,
          objectFit: 'cover',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
        onError={() => {
          setImageError(true);
          setCurrentImage(null);
        }}
      />
    );
  };

  // Fetch dashboard data for moderator
  useEffect(() => {
    if (modLoggedIn) {
      fetch('/admin/dashboard')
        .then(res => res.json())
        .then(data => setDashboardData(data));
    }
  }, [modLoggedIn]);

  // Fetch reviews from backend when a location is selected
  useEffect(() => {
    if (selectedLocation && selectedCity && selectedState) {
      const fetchReviews = async () => {
        const res = await fetch(`/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(selectedCity.name)}/locations/${encodeURIComponent(selectedLocation.name)}/reviews`);
        const data = await res.json();
        setReviewList(data);
      };
      fetchReviews();
    }
  }, [selectedLocation, selectedCity, selectedState]);

  // Dummy moderator credentials for now
  const MOD_CREDENTIALS = { username: 'MODERATOR1', password: '12345678' };

  // Moderator login logic
  const handleModLogin = (e) => {
    e.preventDefault();
    if (
      modUsername === MOD_CREDENTIALS.username &&
      modPassword === MOD_CREDENTIALS.password
    ) {
      setModLoggedIn(true);
      setModError('');
    } else {
      setModError('Invalid moderator credentials');
    }
  };

  // Moderator dashboard functions
  const refreshDashboardData = async () => {
    const res = await fetch('/admin/dashboard');
    const data = await res.json();
    setDashboardData(data);
  };

  const handleAddCity = async () => {
    if (!newCityName.trim() || !selectedState) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: modUsername, 
          name: newCityName,
          image_url: newCityImageUrl.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('City added successfully!');
        setNewCityName('');
        setNewCityImageUrl('');
        setShowAddCityModal(false);
        refreshDashboardData();
        refreshStates(); // Refresh states for visitors
      } else {
        setModActionMessage(data.error || 'Failed to add city');
      }
    } catch (err) {
      setModActionMessage('Failed to add city');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  const handleEditCity = async () => {
    if (!editCityName.trim()) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(selectedModCity.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: modUsername, name: editCityName, image_url: editCityImageUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('City updated successfully!');
        setEditCityName('');
        setEditCityImageUrl('');
        setShowEditCityModal(false);
        setSelectedModCity(null);
        refreshDashboardData();
        refreshStates();
      } else {
        setModActionMessage(data.error || 'Failed to update city');
      }
    } catch (err) {
      setModActionMessage('Failed to update city');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  const handleDeleteCity = async (cityName) => {
    if (!window.confirm(`Are you sure you want to delete ${cityName}? This will also delete all its locations and reviews.`)) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(cityName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: modUsername })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('City deleted successfully!');
        refreshDashboardData();
        refreshStates(); // Refresh states for visitors
      } else {
        setModActionMessage(data.error || 'Failed to delete city');
      }
    } catch (err) {
      setModActionMessage('Failed to delete city');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(selectedModCity.name)}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: modUsername, 
          name: newLocationName,
          image_url: newLocationImageUrl.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('Location added successfully!');
        setNewLocationName('');
        setNewLocationImageUrl('');
        setShowAddLocationModal(false);
        refreshDashboardData();
      } else {
        setModActionMessage(data.error || 'Failed to add location');
      }
    } catch (err) {
      setModActionMessage('Failed to add location');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  const handleEditLocation = async () => {
    if (!editLocationName.trim()) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(selectedModCity.name)}/locations/${encodeURIComponent(selectedModLocation.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: modUsername, name: editLocationName, image_url: editLocationImageUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('Location updated successfully!');
        setEditLocationName('');
        setEditLocationImageUrl('');
        setShowEditLocationModal(false);
        setSelectedModLocation(null);
        refreshDashboardData();
      } else {
        setModActionMessage(data.error || 'Failed to update location');
      }
    } catch (err) {
      setModActionMessage('Failed to update location');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  const handleDeleteLocation = async (locationName) => {
    if (!window.confirm(`Are you sure you want to delete ${locationName}? This will also delete all its reviews.`)) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(selectedModCity.name)}/locations/${encodeURIComponent(locationName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: modUsername })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('Location deleted successfully!');
        refreshDashboardData();
      } else {
        setModActionMessage(data.error || 'Failed to delete location');
      }
    } catch (err) {
      setModActionMessage('Failed to delete location');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  const handleEditReview = async () => {
    if (!editReviewText.trim()) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(selectedModCity.name)}/locations/${encodeURIComponent(selectedModLocation.name)}/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: modUsername, text: editReviewText })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('Review updated successfully!');
        setEditReviewText('');
        setShowEditReviewModal(false);
        setSelectedReview(null);
        refreshDashboardData();
      } else {
        setModActionMessage(data.error || 'Failed to update review');
      }
    } catch (err) {
      setModActionMessage('Failed to update review');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/admin/states/${encodeURIComponent(selectedState.name)}/cities/${encodeURIComponent(selectedModCity.name)}/locations/${encodeURIComponent(selectedModLocation.name)}/reviews/${review.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: modUsername })
      });
      const data = await res.json();
      if (res.ok) {
        setModActionMessage('Review deleted successfully!');
        refreshDashboardData();
      } else {
        setModActionMessage(data.error || 'Failed to delete review');
      }
    } catch (err) {
      setModActionMessage('Failed to delete review');
    }
    setTimeout(() => setModActionMessage(''), 3000);
  };

  // 1. Role selection screen
  if (!role) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,60,0.08)', padding: '3rem 2.5rem', minWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
          <h1 style={{ color: '#2d3a4a', fontWeight: 800, fontSize: '2.5rem', marginBottom: 0, letterSpacing: 1 }}>NeighborFit</h1>
          <p style={{ color: '#6b7683', fontSize: '1.1rem', margin: 0, textAlign: 'center', maxWidth: 320 }}>Discover and review the best places in India. Choose your role to get started.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <button onClick={() => setRole('visitor')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '1rem 2rem', fontSize: '1.15rem', background: 'linear-gradient(90deg, #e3eafc 0%, #cfd9df 100%)', color: '#2d3a4a', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px rgba(60,60,60,0.06)', transition: 'all 0.2s', outline: 'none',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #dbeafe 0%, #e0eafc 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #e3eafc 0%, #cfd9df 100%)'}
            >
              <span role="img" aria-label="Visitor" style={{ fontSize: '1.5rem' }}>🧑‍🤝‍🧑</span>
              Continue as Visitor
            </button>
            <button onClick={() => setRole('moderator')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '1rem 2rem', fontSize: '1.15rem', background: 'linear-gradient(90deg, #fbeee6 0%, #f5d6c6 100%)', color: '#7b3f00', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px rgba(60,60,60,0.06)', transition: 'all 0.2s', outline: 'none',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ffe0b2 0%, #fbeee6 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #fbeee6 0%, #f5d6c6 100%)'}
            >
              <span role="img" aria-label="Moderator" style={{ fontSize: '1.5rem' }}>🛡️</span>
              Moderator Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Moderator login screen
  if (role === 'moderator' && !modLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
        <form onSubmit={handleModLogin} style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', minWidth: '320px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#d32f2f', letterSpacing: 1 }}>Moderator Login</h2>
          <input type="text" placeholder="Username" value={modUsername} onChange={e => setModUsername(e.target.value)} style={{ marginBottom: '1rem', padding: '0.75rem', fontSize: '1rem', borderRadius: 6, border: '1px solid #ccc' }} required />
          <input type="password" placeholder="Password" value={modPassword} onChange={e => setModPassword(e.target.value)} style={{ marginBottom: '2rem', padding: '0.75rem', fontSize: '1rem', borderRadius: 6, border: '1px solid #ccc' }} required />
          {modError && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{modError}</div>}
          <button type="submit" style={{ padding: '0.9rem', fontSize: '1.1rem', background: 'linear-gradient(90deg, #d32f2f 0%, #ff7961 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: 1, boxShadow: '0 2px 8px rgba(211, 47, 47, 0.08)' }}>Log In</button>
          <button type="button" onClick={() => setRole(null)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}>Back</button>
        </form>
      </div>
    );
  }

  // 3. Moderator dashboard
  if (role === 'moderator' && modLoggedIn) {
    // Dashboard view
    if (modView === 'dashboard') {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', fontFamily: 'sans-serif' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <h1 style={{ color: 'white', margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Moderator Dashboard</h1>
            <button onClick={() => { setModLoggedIn(false); setRole(null); setModView('dashboard'); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 'bold', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>Log Out</button>
          </div>
          {/* Action Message */}
          {modActionMessage && (
            <div style={{ 
              background: modActionMessage.includes('successfully') ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)', 
              color: 'white', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '2rem', 
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              {modActionMessage}
            </div>
          )}
          {/* Dashboard Stats */}
          {dashboardData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{dashboardData.total_cities}</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Total Cities</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{dashboardData.total_locations}</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Total Locations</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{dashboardData.total_reviews}</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Total Reviews</p>
              </div>
            </div>
          )}
          {/* States Management */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'white', margin: 0 }}>States Management</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>States are fixed and cannot be modified</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {dashboardData?.states.map((state) => (
                <div key={state.name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'white', margin: 0 }}>{state.name}</h3>
                    <button onClick={() => { setSelectedState(state); setModView('cities'); }} style={{ background: 'rgba(33, 150, 243, 0.8)', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>Manage Cities</button>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1rem 0' }}>{state.cities.length} cities</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {state.cities.slice(0, 3).map(city => (
                      <span key={city.name} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                        {city.name}
                      </span>
                    ))}
                    {state.cities.length > 3 && (
                      <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                        +{state.cities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    // Cities management view
    if (modView === 'cities' && selectedState) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ color: 'white', margin: 0 }}>Cities in {selectedState.name}</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowAddCityModal(true)} style={{ background: 'rgba(76, 175, 80, 0.8)', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Add City</button>
              <button onClick={() => { setSelectedState(null); setModView('dashboard'); }} style={{ background: 'rgba(158, 158, 158, 0.8)', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
            </div>
          </div>
          {/* Add City Modal */}
          {showAddCityModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', minWidth: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Add New City to {selectedState.name}</h3>
                <input
                  type="text"
                  placeholder="City name"
                  value={newCityName}
                  onChange={e => setNewCityName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: 6, border: '1px solid #ccc' }}
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={newCityImageUrl}
                  onChange={e => setNewCityImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 6, border: '1px solid #ccc' }}
                />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowAddCityModal(false); setNewCityName(''); setNewCityImageUrl(''); }} style={{ padding: '0.75rem 1.5rem', background: '#ccc', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleAddCity} style={{ padding: '0.75rem 1.5rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add City</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {selectedState.cities.map((city) => (
              <div key={city.name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'white', margin: 0 }}>{city.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setSelectedModCity(city); setEditCityName(city.name); setShowEditCityModal(true); }} style={{ background: 'rgba(255, 193, 7, 0.8)', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDeleteCity(city.name)} style={{ background: 'rgba(244, 67, 54, 0.8)', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1rem 0' }}>{city.locations.length} locations</p>
                <button onClick={() => { setSelectedModCity(city); setModView('locations'); }} style={{ background: 'rgba(33, 150, 243, 0.8)', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>Manage Locations</button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Locations management view
    if (modView === 'locations' && selectedModCity) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ color: 'white', margin: 0 }}>Locations in {selectedModCity.name} ({selectedState.name})</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowAddLocationModal(true)} style={{ background: 'rgba(76, 175, 80, 0.8)', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Location</button>
              <button onClick={() => { setSelectedModCity(null); setModView('cities'); }} style={{ background: 'rgba(158, 158, 158, 0.8)', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
            </div>
          </div>
          {/* Add Location Modal */}
          {showAddLocationModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', minWidth: '400px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Add New Location to {selectedModCity.name} ({selectedState.name})</h3>
                <input
                  type="text"
                  placeholder="Location name"
                  value={newLocationName}
                  onChange={e => setNewLocationName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: 6, border: '1px solid #ccc' }}
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={newLocationImageUrl}
                  onChange={e => setNewLocationImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 6, border: '1px solid #ccc' }}
                />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowAddLocationModal(false); setNewLocationName(''); setNewLocationImageUrl(''); }} style={{ padding: '0.75rem 1.5rem', background: '#ccc', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleAddLocation} style={{ padding: '0.75rem 1.5rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add Location</button>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {selectedModCity.locations.map((location) => (
              <div key={location.name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'white', margin: 0 }}>{location.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setSelectedModLocation(location); setEditLocationName(location.name); setShowEditLocationModal(true); }} style={{ background: 'rgba(255, 193, 7, 0.8)', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDeleteLocation(location.name)} style={{ background: 'rgba(244, 67, 54, 0.8)', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 1rem 0' }}>{location.reviews.length} reviews</p>
                <button onClick={() => { setSelectedModLocation(location); setModView('reviews'); }} style={{ background: 'rgba(33, 150, 243, 0.8)', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>Manage Reviews</button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Reviews management view
    if (modView === 'reviews' && selectedModLocation) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ color: 'white', margin: 0 }}>Reviews in {selectedModLocation.name} ({selectedModCity.name}, {selectedState.name})</h2>
            <button onClick={() => { setSelectedModLocation(null); setModView('locations'); }} style={{ background: 'rgba(158, 158, 158, 0.8)', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedModLocation.reviews.map((review) => (
              <div key={review.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>@{review.user}</p>
                    <p style={{ color: 'white', margin: 0 }}>{review.text}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { setSelectedReview(review); setEditReviewText(review.text); setShowEditReviewModal(true); }} style={{ background: 'rgba(255, 193, 7, 0.8)', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDeleteReview(review)} style={{ background: 'rgba(244, 67, 54, 0.8)', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{review.likes} 👍 &nbsp; {review.dislikes} 👎</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  // Add review: send to backend and refresh list
  const handleAddReview = async () => {
    if (!reviewInput.trim()) return;
    const state = selectedState.name;
    const city = selectedCity.name;
    const location = selectedLocation.name;
    await fetch(`/states/${encodeURIComponent(state)}/cities/${encodeURIComponent(city)}/locations/${encodeURIComponent(location)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username, text: reviewInput })
    });
    setReviewInput('');
    // Refresh reviews
    const res = await fetch(`/states/${encodeURIComponent(state)}/cities/${encodeURIComponent(city)}/locations/${encodeURIComponent(location)}/reviews`);
    const data = await res.json();
    setReviewList(data);
  };

  // Like/dislike: send to backend and refresh list
  const handleLike = async (idx, review) => {
    if (!username) return;
    const state = selectedState.name;
    const city = selectedCity.name;
    const location = selectedLocation.name;
    await fetch(`/states/${encodeURIComponent(state)}/cities/${encodeURIComponent(city)}/locations/${encodeURIComponent(location)}/reviews/${review.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username })
    });
    // Refresh reviews
    const res = await fetch(`/states/${encodeURIComponent(state)}/cities/${encodeURIComponent(city)}/locations/${encodeURIComponent(location)}/reviews`);
    const data = await res.json();
    setReviewList(data);
  };

  const handleDislike = async (idx, review) => {
    if (!username) return;
    const state = selectedState.name;
    const city = selectedCity.name;
    const location = selectedLocation.name;
    await fetch(`/states/${encodeURIComponent(state)}/cities/${encodeURIComponent(city)}/locations/${encodeURIComponent(location)}/reviews/${review.id}/dislike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username })
    });
    // Refresh reviews
    const res = await fetch(`/states/${encodeURIComponent(state)}/cities/${encodeURIComponent(city)}/locations/${encodeURIComponent(location)}/reviews`);
    const data = await res.json();
    setReviewList(data);
  };

  // Registration logic
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerUsername, password: registerPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || 'Registration failed');
        return;
      }
      setRegisterMode(false);
      setUsername(registerUsername);
      setPassword(registerPassword);
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterError('');
      alert('Registration successful! Please log in.');
    } catch (err) {
      setRegisterError('Registration failed');
    }
  };

  // Login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Login failed');
        return;
      }
      setAuthToken(data.token);
      setLoggedIn(true);
      setLoginError('');
    } catch (err) {
      setLoginError('Login failed');
    }
  };

  // Registration form
  if (registerMode) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
      }}>
        <form onSubmit={handleRegister} style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '400px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#1976d2', letterSpacing: 1, fontSize: '2rem', marginBottom: '0.5rem' }}>Join NeighborFit</h2>
            <p style={{ color: '#666', fontSize: '1rem' }}>Create your account to start exploring</p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={registerUsername}
              onChange={e => setRegisterUsername(e.target.value)}
              style={{ 
                width: '100%',
                padding: '1rem', 
                fontSize: '1rem', 
                borderRadius: '12px', 
                border: '2px solid #e0e0e0',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              required
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={registerPassword}
              onChange={e => setRegisterPassword(e.target.value)}
              style={{ 
                width: '100%',
                padding: '1rem', 
                fontSize: '1rem', 
                borderRadius: '12px', 
                border: '2px solid #e0e0e0',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              required
            />
          </div>
          
          {registerError && (
            <div style={{ 
              color: '#d32f2f', 
              marginBottom: '1.5rem', 
              textAlign: 'center',
              padding: '0.75rem',
              background: 'rgba(211, 47, 47, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(211, 47, 47, 0.2)'
            }}>
              {registerError}
            </div>
          )}
          
          <button type="submit" style={{
            padding: '1rem',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: 1,
            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s ease',
            marginBottom: '1rem'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Create Account
          </button>
          
          <button type="button" onClick={() => setRegisterMode(false)} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#1976d2', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontSize: '1rem',
            padding: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            ← Back to Login
          </button>
          
          <button type="button" onClick={() => { setRegisterMode(false); setRole(null); }} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#666', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontSize: '0.9rem',
            padding: '0.5rem'
          }}>
            ← Back to Role Selection
          </button>
        </form>
      </div>
    );
  }

  // Login Page
  if (!loggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
      }}>
        <form onSubmit={handleLogin} style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '400px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: '#1976d2', letterSpacing: 1, fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p style={{ color: '#666', fontSize: '1rem' }}>Sign in to continue exploring</p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ 
                width: '100%',
                padding: '1rem', 
                fontSize: '1rem', 
                borderRadius: '12px', 
                border: '2px solid #e0e0e0',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              required
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ 
                width: '100%',
                padding: '1rem', 
                fontSize: '1rem', 
                borderRadius: '12px', 
                border: '2px solid #e0e0e0',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              required
            />
          </div>
          
          {loginError && (
            <div style={{ 
              color: '#d32f2f', 
              marginBottom: '1.5rem', 
              textAlign: 'center',
              padding: '0.75rem',
              background: 'rgba(211, 47, 47, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(211, 47, 47, 0.2)'
            }}>
              {loginError}
            </div>
          )}
          
          <button type="submit" style={{
            padding: '1rem',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            letterSpacing: 1,
            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s ease',
            marginBottom: '1rem'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Sign In
          </button>
          
          <button type="button" onClick={() => setRegisterMode(true)} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#1976d2', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontSize: '1rem',
            padding: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            Don't have an account? Create one
          </button>
          
          <button type="button" onClick={() => setRole(null)} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#666', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontSize: '0.9rem',
            padding: '0.5rem'
          }}>
            ← Back to Role Selection
          </button>
        </form>
      </div>
    );
  }

  // Review Page (Location)
  if (selectedLocation) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        fontFamily: 'sans-serif',
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <button onClick={() => setSelectedLocation(null)} style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ← Back to {selectedCity.name} ({selectedState.name})
          </button>
          <h2 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: '2rem',
            fontWeight: '700',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {selectedLocation.name}
          </h2>
          <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
        </div>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {/* Add Review Section */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Share Your Experience</h3>
            <textarea
              value={reviewInput}
              onChange={e => setReviewInput(e.target.value)}
              placeholder="Tell us about your experience in this location..."
              style={{
                width: '100%',
                minHeight: 100,
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                padding: '1rem',
                fontSize: '1rem',
                marginBottom: '1rem',
                background: 'white',
                color: '#333',
                resize: 'vertical',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleAddReview}
                disabled={!reviewInput.trim()}
                style={{
                  background: reviewInput.trim() ? 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: reviewInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: reviewInput.trim() ? '0 4px 15px rgba(25, 118, 210, 0.3)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (reviewInput.trim()) {
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (reviewInput.trim()) {
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                Post Review
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <h3 style={{ color: '#1976d2', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              Community Reviews ({reviewList.length})
            </h3>
            
            {reviewList.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                padding: '3rem',
                background: 'rgba(0,0,0,0.02)',
                borderRadius: '15px',
                border: '2px dashed #e0e0e0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Be the first one to add a feedback!</h4>
                <p style={{ color: '#666', margin: 0 }}>Share your experience and help others discover this location.</p>
                <div style={{ 
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(25, 118, 210, 0.1)'
                }}>
                  <p style={{ color: '#1976d2', margin: 0, fontSize: '0.9rem' }}>
                    💡 Use the form above to write your first review!
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviewList.map((review, i) => (
                  <div key={review.id} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {review.user[0]?.toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: '#1976d2',
                          marginBottom: '0.5rem',
                          fontSize: '1rem'
                        }}>
                          @{review.user}
                        </div>
                        <div style={{ 
                          color: '#333', 
                          fontSize: '1rem',
                          lineHeight: '1.5',
                          marginBottom: '1rem'
                        }}>
                          {review.text}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem',
                          fontSize: '0.9rem'
                        }}>
                          <button 
                            onClick={() => handleLike(i, review)} 
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#4caf50', 
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(76, 175, 80, 0.1)'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                          >
                            👍 <span style={{ color: '#666' }}>{review.likes}</span>
                          </button>
                          <button 
                            onClick={() => handleDislike(i, review)} 
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#e53935', 
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(229, 57, 53, 0.1)'}
                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                          >
                            👎 <span style={{ color: '#666' }}>{review.dislikes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Locations Page (City)
  if (selectedCity && selectedCity.locations) {
    const filteredLocations = selectedCity.locations.filter(loc =>
      loc.name.toLowerCase().includes(locationSearch.toLowerCase())
    );
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        fontFamily: 'sans-serif',
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <button onClick={() => setSelectedCity(null)} style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ← Back to Cities
          </button>
          <h2 style={{ 
            color: 'white', 
            margin: 0, 
            fontSize: '2rem',
            fontWeight: '700',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {selectedCity.name} - Localities
          </h2>
          <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
        </div>
        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search localities..."
            value={locationSearch}
            onChange={e => setLocationSearch(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '16px',
              border: '1.5px solid #e3eafc',
              fontSize: '1rem',
              outline: 'none',
              background: '#f7fafd',
              color: '#2d3a4a',
              boxShadow: '0 2px 8px rgba(60,60,60,0.04)',
              transition: 'border 0.2s',
              minWidth: 220,
            }}
            onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
            onBlur={e => e.target.style.border = '1.5px solid #e3eafc'}
          />
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {!filteredLocations || filteredLocations.length === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                color: 'white',
                padding: '3rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏘️</div>
                <h3>No Localities Found</h3>
                <p>Try a different search term.</p>
              </div>
            ) : (
              filteredLocations.map((loc) => (
                <div
                  key={loc.name}
                  onClick={() => setSelectedLocation(loc)}
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ marginBottom: '1.5rem' }}>
                    <ImageDisplay 
                      name={loc.name} 
                      imageUrl={loc.image_url} 
                      type="location" 
                      size={80} 
                    />
                  </div>
                  
                  <h3 style={{ 
                    color: '#1976d2', 
                    margin: '0 0 0.5rem 0', 
                    fontWeight: 700, 
                    fontSize: '1.3rem', 
                    textAlign: 'center' 
                  }}>
                    {loc.name}
                  </h3>
                  
                  <p style={{ 
                    color: '#666', 
                    margin: '0 0 1.5rem 0', 
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}>
                    {loc.reviews ? `${loc.reviews.length} reviews` : 'No reviews yet'}
                  </p>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)'
                  }}>
                    View Reviews
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for invalid city selection
  if (selectedCity && !selectedCity.locations) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        fontFamily: 'sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '3rem',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#1976d2', marginBottom: '1rem' }}>City Data Not Available</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Unable to load locations for this city.</p>
          <button 
            onClick={() => setSelectedCity(null)}
            style={{
              background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Back to Cities
          </button>
        </div>
      </div>
    );
  }

  // Cities Page (when a state is selected)
  if (selectedState && !selectedCity) {
    const filteredCities = selectedState.cities.filter(city =>
      city.name.toLowerCase().includes(citySearch.toLowerCase())
    );
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        fontFamily: 'sans-serif',
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <button onClick={() => setSelectedState(null)} style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            marginBottom: '1rem'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            ← Back to States
          </button>
          <h1 style={{ 
            color: 'white', 
            marginBottom: '1rem', 
            letterSpacing: 2, 
            fontWeight: 800,
            fontSize: '3rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            {selectedState.name}
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.2rem', 
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            Explore cities in {selectedState.name}
          </p>
        </div>
        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search cities..."
            value={citySearch}
            onChange={e => setCitySearch(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '16px',
              border: '1.5px solid #e3eafc',
              fontSize: '1rem',
              outline: 'none',
              background: '#f7fafd',
              color: '#2d3a4a',
              boxShadow: '0 2px 8px rgba(60,60,60,0.04)',
              transition: 'border 0.2s',
              minWidth: 220,
            }}
            onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
            onBlur={e => e.target.style.border = '1.5px solid #e3eafc'}
          />
        </div>
        {/* Cities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          {filteredCities.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              color: 'white',
              padding: '3rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏙️</div>
              <h3>No Cities Found</h3>
              <p>Try a different search term.</p>
            </div>
          ) : (
            filteredCities.map((city) => (
              <div
                key={city.name}
                onClick={() => setSelectedCity(city)}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
              >
                <ImageDisplay 
                  name={city.name} 
                  imageUrl={city.image_url} 
                  type="city" 
                  size={180} 
                />
                
                <h2 style={{ 
                  color: '#1976d2', 
                  margin: '0 0 0.5rem 0', 
                  fontWeight: 700, 
                  fontSize: '1.5rem', 
                  textAlign: 'center' 
                }}>
                  {city.name}
                </h2>
                
                <p style={{ 
                  color: '#666', 
                  margin: '0 0 1rem 0', 
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  {city.locations.length} locations to explore
                </p>
                
                <div style={{
                  background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)'
                }}>
                  Explore City
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // States Landing Page
  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Nav Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(60,60,60,0.06)',
        border: '1px solid #e3eafc',
        padding: '1.2rem 2.5rem',
        marginBottom: '3rem',
        minHeight: '72px',
      }}>
        {/* Left: App Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2d3a4a', letterSpacing: 2 }}>NeighborFit</span>
        </div>
        {/* Center: Search, Welcome & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search states..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '16px',
              border: '1.5px solid #e3eafc',
              fontSize: '1rem',
              outline: 'none',
              background: '#f7fafd',
              color: '#2d3a4a',
              boxShadow: '0 2px 8px rgba(60,60,60,0.04)',
              transition: 'border 0.2s',
              minWidth: 180,
              marginRight: '1.2rem',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
            onBlur={e => e.target.style.border = '1.5px solid #e3eafc'}
          />
          <div style={{
            background: 'rgba(60,60,60,0.06)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            color: '#2d3a4a',
            fontSize: '0.95rem',
            fontWeight: 600
          }}>
            👋 Welcome, {username}!
          </div>
          <button
            onClick={refreshStates}
            disabled={refreshingStates}
            style={{
              background: refreshingStates ? 'rgba(158, 158, 158, 0.15)' : 'rgba(76, 175, 80, 0.12)',
              color: '#388e3c',
              border: 'none',
              padding: '0.5rem 1.2rem',
              borderRadius: '20px',
              cursor: refreshingStates ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(60,60,60,0.04)'
            }}
            onMouseOver={(e) => {
              if (!refreshingStates) {
                e.target.style.background = 'rgba(76, 175, 80, 0.18)';
              }
            }}
            onMouseOut={(e) => {
              if (!refreshingStates) {
                e.target.style.background = 'rgba(76, 175, 80, 0.12)';
              }
            }}
          >
            {refreshingStates ? '⏳ Refreshing...' : '🔄 Refresh States'}
          </button>
        </div>
        {/* Right: Logout */}
        <div>
          <button
            onClick={() => { setLoggedIn(false); setUsername(''); setPassword(''); }}
            style={{
              background: 'linear-gradient(90deg, #e3eafc 0%, #cfd9df 100%)',
              color: '#2d3a4a',
              border: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(60,60,60,0.04)',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #dbeafe 0%, #e0eafc 100%)'}
            onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #e3eafc 0%, #cfd9df 100%)'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* States Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2.5rem',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {filteredStates.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            color: '#6b7683',
            padding: '3rem',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '24px',
            boxShadow: '0 4px 24px rgba(60,60,60,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3>No states found.</h3>
            <p>Try a different search term.</p>
          </div>
        ) : (
          filteredStates.map((state) => (
            <div
              key={state.name}
              onClick={() => setSelectedState(state)}
              style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(60,60,60,0.08)',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                border: '1px solid #e3eafc',
                outline: 'none',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(60,60,60,0.12)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(60,60,60,0.08)';
              }}
            >
              <ImageDisplay 
                name={state.name} 
                imageUrl={state.image_url} 
                type="state" 
                size={160} 
              />
              
              <h2 style={{ 
                color: '#1976d2', 
                margin: '1.2rem 0 0.5rem 0', 
                fontWeight: 700, 
                fontSize: '1.35rem', 
                textAlign: 'center' 
              }}>
                {state.name}
              </h2>
              
              <p style={{ 
                color: '#6b7683', 
                margin: '0 0 1rem 0', 
                textAlign: 'center',
                fontSize: '0.98rem',
                fontWeight: 500
              }}>
                {state.cities.length} cities to explore
              </p>
              
              <div style={{
                background: 'linear-gradient(135deg, #e3eafc 0%, #cfd9df 100%)',
                color: '#2d3a4a',
                padding: '0.5rem 1.5rem',
                borderRadius: '25px',
                fontSize: '0.95rem',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(60,60,60,0.04)'
              }}>
                Explore State
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
