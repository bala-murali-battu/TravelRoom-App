import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Flight', 'Hotel', 'Transit', 'Activity'], required: true },
  startTime: { type: Date, required: true }, // The critical sorting timestamp marker field
  locationName: { type: String, default: '' },
  confirmationCode: { type: String, default: '' },
  hyperlink: { type: String, default: '' },
  notes: { type: String, default: '' }
});

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'dev_traveler_123' }, 
  destination: { type: String, required: true, default: 'Kyoto, Japan' },
  timeline: [EventSchema] // Embedded data log arrays tracking items dynamically
}, { timestamps: true });

// Pre-save schema trigger hook: Automatically re-sorts your timeline items chronologically
TripSchema.pre('save', function() {
  if (this.timeline && this.timeline.length > 0) {
    this.timeline.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }
});

export default mongoose.model('Trip', TripSchema);
