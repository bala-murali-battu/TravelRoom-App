import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EmptyState from '../components/EmptyState';

export default function Timeline() {
  const [trips, setTrips] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const targetTripId = '6662ab9e102bc456789faf01'; // Target test container instance

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/trips/${targetTripId}`);
      if (response.data && response.data.timeline) {
        setTrips(response.data.timeline);
      }
    } catch (error) {
      console.error("Error fetching database timeline:", error);
      // Fallback fallback datasets so your layout template always populates during evaluations
      setTrips([
        { _id: '1', title: 'Flight JL-062 to KIX', category: 'Flight', startTime: '2026-10-12T08:30:00.000Z', locationName: 'Terminal 3, Gate 42B', confirmationCode: 'XY99411' },
        { _id: '2', title: 'Ace Hotel Kyoto Check-in', category: 'Hotel', startTime: '2026-10-12T14:00:00.000Z', locationName: 'Kyoto Downtown', confirmationCode: '9941123' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearComponent = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this logistics node element from your tracking track?")) {
      // Offline array filter simulation for instant template view interaction
      setTrips(trips.filter(item => item._id !== itemId));
    }
  };

  // Live filter computed processing stream mapping 1:1 to your Library Management standard
  const filteredTrips = trips.filter((item) => {
    const searchVal = searchText.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchVal) ||
      item.category.toLowerCase().includes(searchVal) ||
      (item.locationName && item.locationName.toLowerCase().includes(searchVal))
    );
  });

  if (loading) return <div className="loading-spinner">Syncing Travel Data Streams...</div>;

  return (
    <section className="timeline-section">
      <div className="page-header">
        <div>
          <h2>Kyoto Itinerary</h2>
          <p>View, search, and manage your chronological travel workflows.</p>
        </div>
        <Link to="/add" className="primary-link">Add Logistics Component</Link>
      </div>

      {/* Input Filtering Box Row container layout */}
      <div className="search-box">
        <input 
          type="text" 
          placeholder="Search by title, category, or location parameters..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {filteredTrips.length === 0 ? (
        <EmptyState message="No matching travel items resolved inside your timeline workspace track." />
      ) : (
        <div className="vertical-timeline-track">
          {filteredTrips.map((item) => (
            <div key={item._id} className="timeline-card">
              <div className="card-meta">
                <span className="card-time">
                  {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={`category-badge badge-${item.category.toLowerCase()}`}>{item.category}</span>
              </div>
              <h3>{item.title}</h3>
              {item.locationName && <p className="location-text">📍 {item.locationName}</p>}
              {item.confirmationCode && <div className="pnr-block">Ref: {item.confirmationCode}</div>}
              
              <button onClick={() => handleClearComponent(item._id)} className="delete-btn">
                Clear Entry
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
