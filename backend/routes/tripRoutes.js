import express from 'express';
import { getTripTimeline, addLogisticsComponent } from '../controllers/tripController.js';

const router = express.Router();

router.get('/:tripId', getTripTimeline);
router.post('/:tripId/logistics', addLogisticsComponent);

export default router;
