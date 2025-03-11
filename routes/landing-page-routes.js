import express from 'express';
import mongoose from 'mongoose';
import auth from '../middlewares/admin-middleware.js';
import dbConnect from '../config/db.config.js';

const router = express.Router();

// Generic pagination handler
async function handlePaginatedList(req, res, resource) {
    try {
        await dbConnect();
        
        const { range, sort, filter } = req.query;
        
        const Model = mongoose.model(resource);
        const [start, end] = JSON.parse(range || '[0, 9]');
        const sortValues = JSON.parse(sort || '{"_id": 1}');
        const filterValues = JSON.parse(filter || '{}');
        
        // Add indexes to your collections for these frequently queried fields
        const limit = end - start + 1;
        
        // Run queries in parallel to save time
        const [data, total] = await Promise.all([
            Model
                .find(filterValues)
                .sort(sortValues)
                .skip(start)
                .limit(limit)
                .lean() // Use lean() to get plain JS objects instead of Mongoose documents (faster)
                .exec(),
            
            Model.countDocuments(filterValues)
        ]);
        
        // Set cache headers if data doesn't change frequently
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
        res.json({ data, total });
    } catch (error) {
        console.error(`Error in ${resource} handler:`, error);
        res.status(500).json({ error: error.message });
    }
}

// GET list with pagination for best offers
router.get('/best-offers', async (req, res) => {
    await handlePaginatedList(req, res, 'BestOffer');
});

// GET list with pagination for featured properties
router.get('/featured-properties', async (req, res) => {
    await handlePaginatedList(req, res, 'FeturedProperty'); // Fixed typo in "FeturedProperty"
});

// GET list with pagination for banners
router.get('/banners', async (req, res) => {
    await handlePaginatedList(req, res, 'Banner');
});

// GET list with pagination for popular destinations
router.get('/popular-destinations', async (req, res) => {
    await handlePaginatedList(req, res, 'PopularDestination');
});

export default router;