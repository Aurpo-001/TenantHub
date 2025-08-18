const express = require('express');
const {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    getRecommendations
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (NO protect middleware)
router.get('/', getProperties);  // Get all properties - PUBLIC
router.get('/:id', getProperty);  // Get single property - PUBLIC

// Private routes (WITH protect middleware)
router.get('/user/recommendations', protect, getRecommendations);  // PROTECTED
router.post('/', protect, authorize('admin', 'owner'), createProperty);  // PROTECTED + ROLE-BASED
router.put('/:id', protect, authorize('admin', 'owner'), updateProperty);  // PROTECTED + ROLE-BASED
router.delete('/:id', protect, authorize('admin', 'owner'), deleteProperty);  // PROTECTED + ROLE-BASED

module.exports = router;