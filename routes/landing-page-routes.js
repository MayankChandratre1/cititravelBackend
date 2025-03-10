import express from 'express';
import mongoose from 'mongoose';
import auth from '../middlewares/admin-middleware.js';

const router = express.Router();

// GET list with pagination for best offers
router.get('/best-offers', async (req, res) => {
    const resource = 'BestOffer';
    try {
        const { range, sort, filter } = req.query;
        
        const Model = mongoose.model(resource);
        const [start, end] = JSON.parse(range || '[0, 9]');
        const sortValues = JSON.parse(sort || '{"_id": 1}');
        const filterValues = JSON.parse(filter || '{}');
        
        const limit = end - start + 1;
        
        const data = await Model
            .find(filterValues)
            .sort(sortValues)
            .skip(start)
            .limit(limit)
            .exec();
            
        const total = await Model.countDocuments(filterValues);
        
        res.json({ data, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET list with pagination for featured properties
router.get('/featured-properties', async (req, res) => {
    const resource = 'FeturedProperty';
    try {
        const { range, sort, filter } = req.query;
        
        const Model = mongoose.model(resource);
        const [start, end] = JSON.parse(range || '[0, 9]');
        const sortValues = JSON.parse(sort || '{"_id": 1}');
        const filterValues = JSON.parse(filter || '{}');
        
        const limit = end - start + 1;
        
        const data = await Model
            .find(filterValues)
            .sort(sortValues)
            .skip(start)
            .limit(limit)
            .exec();
            
        const total = await Model.countDocuments(filterValues);
        
        res.json({ data, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET list with pagination for banners
router.get('/banners', async (req, res) => {
    const resource = 'Banner';
    try {
        const { range, sort, filter } = req.query;
        
        const Model = mongoose.model(resource);
        const [start, end] = JSON.parse(range || '[0, 9]');
        const sortValues = JSON.parse(sort || '{"_id": 1}');
        const filterValues = JSON.parse(filter || '{}');
        
        const limit = end - start + 1;
        
        const data = await Model
            .find(filterValues)
            .sort(sortValues)
            .skip(start)
            .limit(limit)
            .exec();
            
        const total = await Model.countDocuments(filterValues);
        
        res.json({ data, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET list with pagination for popular destinations
router.get('/popular-destinations', async (req, res) => {
    const resource = 'PopularDestination';
    try {
        const { range, sort, filter } = req.query;
        
        const Model = mongoose.model(resource);
        const [start, end] = JSON.parse(range || '[0, 9]');
        const sortValues = JSON.parse(sort || '{"_id": 1}');
        const filterValues = JSON.parse(filter || '{}');
        
        const limit = end - start + 1;
        
        const data = await Model
            .find(filterValues)
            .sort(sortValues)
            .skip(start)
            .limit(limit)
            .exec();
            
        const total = await Model.countDocuments(filterValues);
        
        res.json({ data, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;