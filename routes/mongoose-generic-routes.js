import express from 'express';
import mongoose from 'mongoose';
import auth from '../middlewares/admin-middleware.js';

const router = express.Router();

// GET list with pagination
router.get('/:resource',auth, async (req, res) => {
    try {
        const { resource } = req.params;
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

// GET one by ID
router.get('/:resource/:id', auth, async (req, res) => {
    try {
        const { resource, id } = req.params;
        const Model = mongoose.model(resource);
        
        const item = await Model.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new item
router.post('/:resource', auth, async (req, res) => {
    try {
        const { resource } = req.params;
        const Model = mongoose.model(resource);
        
        const newItem = new Model(req.body);
        await newItem.save();
        
        res.json({ id: newItem._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update item
router.put('/:resource/:id', auth, async (req, res) => {
    try {
        const { resource, id } = req.params;
        const Model = mongoose.model(resource);
        const { _id, ...updateData } = req.body;
        
        const updatedItem = await Model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.json({ id, ...updateData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE one item
router.delete('/:resource/:id', auth, async (req, res) => {
    try {
        const { resource, id } = req.params;
        const Model = mongoose.model(resource);
        
        await Model.findByIdAndDelete(id);
        res.json({ id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE many items
router.delete('/:resource', auth, async (req, res) => {
    try {
        const { resource } = req.params;
        const { ids } = req.body;
        const Model = mongoose.model(resource);
        
        await Model.deleteMany({ _id: { $in: ids } });
        res.json({ ids });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
