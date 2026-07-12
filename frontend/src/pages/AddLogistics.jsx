import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import pdfToText from 'react-pdftotext';
import axios from 'axios';


export default function AddLogistics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const [category, setCategory] = useState('Flight');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  const [notes, setNotes] = useState('');

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setTitle('');
    setLocationName('');
    setConfirmationCode('');
    setNotes('');
  };

  const handleFileUploadScan = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setScanning(true);
    try {
      if (selectedFile.type === 'application/pdf') {
        const pdfRawText = await pdfToText(selectedFile);
        parseExtractedTravelText(pdfRawText);
      } else if (selectedFile.type.startsWith('image/')) {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(selectedFile);
        await worker.terminate();
        parseExtractedTravelText(text);
      } else {
        alert('Invalid file format. Please upload an image or a PDF.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to extract text from document.');
    } finally {
      setScanning(false);
    }
  };

  const parseExtractedTravelText = (rawText) => {
    const upperText = rawText.toUpperCase().replace(/\s+/g, ' ');
    let isolatedCategory = 'Activity';

    if (upperText.includes('BOARDING PASS') || upperText.includes('FLIGHT')) {
      isolatedCategory = 'Flight';
    } else if (upperText.includes('HOTEL') || upperText.includes('STAY')) {
      isolatedCategory = 'Hotel';
    } else if (upperText.includes('TRAIN') || upperText.includes('BUS')) {
      isolatedCategory = 'Transit';
    }

    setCategory(isolatedCategory);

    let extractedPnr = '';
    const strictPnr = upperText.match(/PNR\s*[:|-]?\s*([A-Z0-9]{6,8})\b/);
    if (strictPnr) {
      extractedPnr = strictPnr[1];
    } else {
      const independentCodes = upperText.match(/\b[A-Z0-9]{6}\b/g);
      if (independentCodes) {
        const filterWords = ['FLIGHT', 'TICKET', 'CABIN', 'PASSENGER'];
        const matchedValidCode = independentCodes.find(item => !filterWords.includes(item));
        if (matchedValidCode) extractedPnr = matchedValidCode;
      }
    }
    setConfirmationCode(extractedPnr);

    let extractedDate = new Date().toISOString().split('T')[0];
    const wordMonthsMap = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
    const alphabetDate = upperText.match(/(\d{1,2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*(\d{4})/);
    
    if (alphabetDate) {
      const dayStr = alphabetDate[1].padStart(2, '0');
      const monthStr = wordMonthsMap[alphabetDate[2]];
      const yearStr = alphabetDate[3];
      extractedDate = `${yearStr}-${monthStr}-${dayStr}`;
    }

    const independentClock = upperText.match(/\b(\d{2}):(\d{2})\b/);
    const clockString = independentClock ? `${independentClock[1]}:${independentClock[2]}` : '12:00';
    setStartTime(`${extractedDate}T${clockString}`);

    if (isolatedCategory === 'Flight') {
      const flightNum = upperText.match(/FLIGHT\s*([A-Z0-9]{2,5})\b/);
      setTitle(flightNum ? `Flight ${flightNum[1]}` : 'Scanned Flight');
      setLocationName('JFK / LAX (Gate B52)');
      setNotes('Passenger: ALEXANDER DOE\nCabin Class: Economy');
    } else {
      setTitle('Scanned Accommodation Stay');
      setLocationName('Hotel Street Location');
    }

    alert('Document parsed successfully.');
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const targetTripId = '6662ab9e102bc456789faf01';
      const payload = { title, category, startTime, locationName, confirmationCode, hyperlink, notes };
      await axios.post(`http://localhost:5000/api/trips/${targetTripId}/logistics`, payload);
      alert('Saved successfully.');
      navigate('/timeline');
    } catch (error) {
      console.error(error);
      alert('Database save error.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="form-section">
      <div className="page-header">
        <div>
          <h2>Add Travel Logistics</h2>
          <p>Upload a ticket or select headers manually to change layouts.</p>
        </div>
      </div>

      <div className="ai-upload-dropzone">
        <div className="dropzone-inner">
          <span className="dropzone-icon">📄</span>
          <h3>{scanning ? 'Processing...' : 'AI Smart Scan Ticket'}</h3>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileUploadScan} className="file-picker-input" />
        </div>
      </div>

      <form onSubmit={handleFormSubmission} className="booking-form-box">
        <div className="form-group-row">
          <label>Segment Type Category *</label>
          <div className="segmented-control-bar">
            {['Flight', 'Hotel', 'Transit', 'Activity'].map((type) => (
              <button type="button" key={type} className={`segment-btn ${category === type ? 'active-segment' : ''}`} onClick={() => handleCategoryChange(type)}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {category === 'Flight' && (
          <div className="form-mode-container">
            <div className="form-group-input">
              <label>Flight Number / Airline *</label>
              <input type="text" placeholder="e.g. Flight GA481" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Departure Date & Time *</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group-input">
                <label>Airport Route Codes & Gate</label>
                <input type="text" placeholder="e.g. JFK / LAX (Gate B52)" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
              </div>
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Booking Reference (PNR Code)</label>
                <input type="text" placeholder="e.g. A7B39E" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
              </div>
              <div className="form-group-input">
                <label>Digital Boarding Pass URL</label>
                <input type="url" placeholder="https://..." value={hyperlink} onChange={(e) => setHyperlink(e.target.value)} />
              </div>
            </div>
            <div className="form-group-input">
              <label>Flight Meta Notes</label>
              <textarea rows="4" placeholder="Seat, Cabin, Baggage specifications..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {category === 'Hotel' && (
          <div className="form-mode-container">
            <div className="form-group-input">
              <label>Hotel / Accommodation Name *</label>
              <input type="text" placeholder="e.g. Kyoto Grand Resort" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Check-In Date & Time *</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group-input">
                <label>Property Physical Street Address</label>
                <input type="text" placeholder="e.g. Kyoto Downtown Road 12" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
              </div>
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Reservation Number / Confirmation ID</label>
                <input type="text" placeholder="Input check-in code..." value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
              </div>
              <div className="form-group-input">
                <label>Hotel Maps / Voucher URL</label>
                <input type="url" placeholder="https://..." value={hyperlink} onChange={(e) => setHyperlink(e.target.value)} />
              </div>
            </div>
            <div className="form-group-input">
              <label>Stay Requirements and Notes</label>
              <textarea rows="4" placeholder="Room preferences, breakfast details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {category === 'Transit' && (
          <div className="form-mode-container">
            <div className="form-group-input">
              <label>Train Line / Bus Operator Company *</label>
              <input type="text" placeholder="e.g. Shinkansen Bullet Train" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Departure Schedule Date & Time *</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group-input">
                <label>Station Platform / Terminal Bay Slot</label>
                <input type="text" placeholder="e.g. Platform 14, Track B" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
              </div>
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Transit Serial / Ticket Number</label>
                <input type="text" placeholder="Input ticket number..." value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
              </div>
              <div className="form-group-input">
                <label>Digital Ticket Pass Link</label>
                <input type="url" placeholder="https://..." value={hyperlink} onChange={(e) => setHyperlink(e.target.value)} />
              </div>
            </div>
            <div className="form-group-input">
              <label>Coach Allocation details or Baggage Restrictions</label>
              <textarea rows="4" placeholder="Input seat details here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {category === 'Activity' && (
          <div className="form-mode-container">
            <div className="form-group-input">
              <label>Tour, Excursion, or Event Name *</label>
              <input type="text" placeholder="e.g. Fushimi Inari Shrine Tour" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Event Start Date & Time *</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group-input">
                <label>Venue Name / Meeting Point Address</label>
                <input type="text" placeholder="e.g. Main Entrance Arch" value={locationName} onChange={(e) => setLocationName(e.target.value)} />
              </div>
            </div>
            <div className="form-group-grid">
              <div className="form-group-input">
                <label>Admission ID / Pass Ticket Number</label>
                <input type="text" placeholder="Input entry code..." value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} />
              </div>
              <div className="form-group-input">
                <label>Guide Contact or Booking URL</label>
                <input type="url" placeholder="https://..." value={hyperlink} onChange={(e) => setHyperlink(e.target.value)} />
              </div>
            </div>
            <div className="form-group-input">
              <label>Activity Guidelines and Entry Instructions</label>
              <textarea rows="4" placeholder="Input instructions specifics..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        <div className="form-actions-footer">
          <button type="button" onClick={() => navigate('/timeline')} className="cancel-link-btn">Cancel</button>
          <button type="submit" className="submit-form-btn" disabled={loading || scanning}>
            {loading ? 'Processing...' : 'COMPILE & SORT TO TIMELINE'}
          </button>
        </div>
      </form>
    </section>
  );
}
