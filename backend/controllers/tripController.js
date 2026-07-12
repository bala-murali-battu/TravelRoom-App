import Trip from '../models/Trip.js';

// @desc    Fetch specific trip container or seed a test default sandbox profile
// @route   GET /api/trips/:tripId
export const getTripTimeline = async (req, res) => {
  try {
    const { tripId } = req.params;
    let trip = await Trip.findById(tripId);

    // Automation fallback: If the database is empty, seed a baseline test profile container document
    if (!trip && tripId === '6662ab9e102bc456789faf01') {
      trip = new Trip({
        _id: '6662ab9e102bc456789faf01',
        destination: 'Kyoto, Japan',
        timeline: []
      });
      await trip.save();
    }

    if (!trip) return res.status(404).json({ message: "Traveler profile dataset not resolved." });
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Server breakdown compiling timeline matrix", error: error.message });
  }
};

// @desc    Inject logistics segment card items into timeline array data blocks
// @route   POST /api/trips/:tripId/logistics
export const addLogisticsComponent = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Target database container sheet missing" });

    trip.timeline.push(req.body);
    await trip.save(); // Model's pre-save trigger function automatically runs sorting parameters here

    res.status(200).json({ message: "Component compiled successfully", timeline: trip.timeline });
  } catch (error) {
    res.status(500).json({ message: "Error appending operational dataset logs", error: error.message });
  }
};
