const express = require('express');
const {
    createCommuteRoute,
    getCommuteRoutes,
    getCommuteRoute,
    updateCommuteRoute,
    deleteCommuteRoute,
    toggleFavorite,
    getNearbyMosques,
    addTrafficAlert,
    getPropertiesWithCommute
} = require('../controllers/commuteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/nearby-mosques', getNearbyMosques);
router.get('/properties-with-commute', getPropertiesWithCommute);

// Protected routes
router.use(protect);

// User commute route management
router.route('/routes')
    .get(getCommuteRoutes)
    .post(createCommuteRoute);

router.route('/routes/:id')
    .get(getCommuteRoute)
    .put(updateCommuteRoute)
    .delete(deleteCommuteRoute);

router.put('/routes/:id/favorite', toggleFavorite);
router.post('/routes/:id/alerts', addTrafficAlert);

module.exports = router;