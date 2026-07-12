import React from 'react';

export default function EmptyState({ message }) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">🧳</div>
      <h3>No Active Itineraries Found</h3>
      <p>{message || "Your travel timeline is currently clear."}</p>
    </div>
  );
}
