import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { fetchTracks } from './spotifyUtils.js';
dotenv.config();

const app = express();
app.use(express.json());

app.get('/tracks', async (req, res) => {
    const { trackIDs } = req.body;

    if (!trackIDs || !Array.isArray(trackIDs) || trackIDs.length === 0) {
        return res.status(400).json({ error: 'trackIDs must be a non-empty array' });
    }

    try {
        const tracks = await fetchTracks(trackIDs); 
        res.json(tracks);
    } catch (error) {
        console.error('Error fetching track info:', error);
        res.status(500).json({ error: 'Failed to fetch track information' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));