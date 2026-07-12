import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import './index.css';

export default function App() {
  const [tickets, setTickets] = useState([
    {
      id: 'mock-1',
      type: 'Flight',
      date: '2024-10-24',
      time: '08:30',
      title: 'Flight GA481',
      location: 'JFK to LAX',
      imageUri: 'https://amazonaws.com'
    },
    {
      id: 'mock-2',
      type: 'Hotel',
      date: '2026-10-12',
      time: '14:00',
      title: 'Kyoto Grand Luxe Resort',
      location: 'Shimogyo-ku, Kyoto City',
      imageUri: 'https://amazonaws.com'
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [longPressedId, setLongPressedId] = useState(null);
  
  const fileInputRef = useRef(null);
  const pressTimer = useRef(null);
  const isLongPressActive = useRef(false);

  const handlePressStart = (id) => {
    if (longPressedId) return;
    
    pressTimer.current = setTimeout(() => {
      setLongPressedId(id);
      isLongPressActive.current = true;
    }, 700); 
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleCardClick = (item, e) => {
    e.stopPropagation();
    
    if (isLongPressActive.current) {
      isLongPressActive.current = false;
      return;
    }

    if (longPressedId) {
      setLongPressedId(null);
    } else {
      setActivePreviewImage(item.imageUri);
    }
  };

  const handleDeleteTicket = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Remove this ticket item record from your chronological timeline?")) {
      setTickets(tickets.filter(item => item.id !== id));
    }
    setLongPressedId(null);
  };

  const triggerFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTicketProcess = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    try {
      const localImageSrc = URL.createObjectURL(file);
      
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const upperText = text.toUpperCase().replace(/\s+/g, ' ');

      let detectedType = 'Activity';
      if (upperText.includes('BOARDING') || upperText.includes('FLIGHT') || upperText.includes('AIRWAYS')) {
        detectedType = 'Flight';
      } else if (upperText.includes('HOTEL') || upperText.includes('STAY') || upperText.includes('RESORT') || upperText.includes('ROOM')) {
        detectedType = 'Hotel';
      } else if (upperText.includes('TRAIN') || upperText.includes('BUS') || upperText.includes('TRANSIT')) {
        detectedType = 'Transit';
      }

      let detectedDate = new Date().toISOString().split('T')[0];
      const monthMap = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
      const txtDate = upperText.match(/(\d{1,2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*(\d{4})/);
      
      if (txtDate) {
        const day = txtDate[1].padStart(2, '0');
        const month = monthMap[txtDate[2]];
        const year = txtDate[3];
        detectedDate = `${year}-${month}-${day}`;
      }

      const clockMatch = upperText.match(/\b(\d{2}):(\d{2})\b/);
      const detectedTime = clockMatch ? `${clockMatch[1]}:${clockMatch[2]}` : '12:00';

      let autoTitle = 'Scanned Itinerary Document';
      let autoLocation = 'Processed Destination Address';

      if (detectedType === 'Flight') {
        const flightNumMatch = upperText.match(/FLIGHT\s*([A-Z0-9]{2,5})\b/) || upperText.match(/\b([A-Z]{2}\s?\d{3,4})\b/i);
        autoTitle = flightNumMatch ? `Flight ${flightNumMatch[1].replace(/\s+/g, '')}` : 'Flight Travel Node';
        
        const route = upperText.match(/\b([A-Z]{3})\s*[\/|-]\s*([A-Z]{3})\b/);
        autoLocation = route ? `${route[1]} to ${route[2]}` : 'Airport Terminal Routing';
      } else if (detectedType === 'Hotel') {
        const hotelMatch = text.match(/(?:Hotel|Resort|Stay|Inn)\s+([A-Za-z0-9\s]{3,20})/i) || text.match(/([A-Za-z0-9\s]{3,20})\s+(?:Hotel|Resort|Stay|Inn)/i);
        autoTitle = hotelMatch ? hotelMatch[1].trim() : 'Kyoto Hotel Stay';
        
        const addressMatch = text.match(/(?:at|address|location):\s*([A-Za-z0-9\s,]{4,25})/i);
        autoLocation = addressMatch ? addressMatch[1].trim() : 'Shimogyo-ku, Kyoto City';
      }

      const newTicketNode = {
        id: Date.now().toString(),
        type: detectedType,
        date: detectedDate,
        time: detectedTime,
        title: autoTitle,
        location: autoLocation,
        imageUri: localImageSrc
      };

      setTickets(prev => [...prev, newTicketNode].sort((a, b) => new Date(a.date) - new Date(b.date)));

    } catch (err) {
      console.error(err);
      alert('Error parsing document attributes.');
    } finally {
      setScanning(false);
    }
  };

  // Human-written client filter pipeline matching variables against your array logs
  const filteredTickets = tickets.filter((item) => {
    const cleanQuery = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.type.toLowerCase().includes(cleanQuery) ||
      item.location.toLowerCase().includes(cleanQuery) ||
      item.date.includes(cleanQuery)
    );
  });

  return (
    <div className="app-container" onClick={() => setLongPressedId(null)}>
      <header className="main-header" onClick={(e) => e.stopPropagation()}>
        <h1>TravelRoom Workspace</h1>
      </header>

      <main className="content-viewport">
        <section className="page-header" onClick={(e) => e.stopPropagation()}>
          <h2>Intelligent Itinerary Streams</h2>
          <p>Manage your itinerary files locally. Hold down any bar card to reveal its delete controls.</p>
        </section>

        {/* Unified Inline Filter Search Input Block */}
        <div className="search-bar-container" onClick={(e) => e.stopPropagation()}>
          <input 
            type="text" 
            placeholder="Search tickets by title, destination, category, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="timeline-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {scanning && (
          <div className="loading-bar-toast">
            🧠 AI Scanner reading ticket text...
          </div>
        )}

        {/* Conditional Timeline Stack Display Frame */}
        <div className="ticket-bar-stack">
          {filteredTickets.length === 0 ? (
            <div className="empty-search-alert">
              🔍 No travel tickets match "{searchQuery}" inside your timeline track.
            </div>
          ) : (
            filteredTickets.map((item) => (
              <div 
                key={item.id} 
                className="ticket-rectangular-bar"
                onMouseDown={() => handlePressStart(item.id)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={() => handlePressStart(item.id)}
                onTouchEnd={handlePressEnd}
                onClick={(e) => handleCardClick(item, e)}
              >
                <div className="bar-indicator-node" data-type={item.type}></div>
                
                <div className="bar-core-info">
                  <span className="bar-category-tag">{item.type.toUpperCase()} TICKET • {item.title}</span>
                  <h3 className="bar-summary-text">📍 {item.location}</h3>
                </div>

                <div className="bar-timestamp-box">
                  <span className="bar-date-label">🗓️ {item.date}</span>
                  <span className="bar-time-label">⏰ {item.time}</span>
                </div>

                <div className="bar-action-hint">
                  {longPressedId === item.id ? (
                    <button className="inline-delete-action-btn" onClick={(e) => handleDeleteTicket(item.id, e)}>
                      Delete Ticket 🗑️
                    </button>
                  ) : (
                    <span>View Receipt 📄</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*,application/pdf" 
          onChange={handleTicketProcess} 
          style={{ display: 'none' }} 
        />

        <button 
          className="floating-plus-btn" 
          onClick={(e) => {
            e.stopPropagation();
            triggerFileSelection();
          }}
          disabled={scanning}
        >
          +
        </button>
      </main>

      {activePreviewImage && (
        <div className="modal-overlay-backdrop" onClick={() => setActivePreviewImage(null)}>
          <div className="modal-content-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-corner-btn" onClick={() => setActivePreviewImage(null)}>×</button>
            <div className="modal-image-frame">
              <img src={activePreviewImage} alt="Uploaded reference ticket asset" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
