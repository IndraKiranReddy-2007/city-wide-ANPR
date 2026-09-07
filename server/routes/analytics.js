import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const data = db.getAnalytics(timeframe);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
