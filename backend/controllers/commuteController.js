const CommuteRoute = require('../models/CommuteRoute');
const Property = require('../models/Property');

// @desc    Create new commute route
// @route   POST /api/commute/routes
// @access  Private
exports.createCommuteRoute = async (req, res) => {
    try {
        const {
            name,
            origin,
            destination,
            routeOptions,
            preferences,
            schedule
        } = req.body;

        const commuteRoute = await CommuteRoute.create({
            user: req.user.id,
            name,
            origin,
            destination,
            routeOptions,
            preferences,
            schedule
        });

        res.status(201).json({
            success: true,
            message: 'Commute route created successfully',
            data: commuteRoute
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating commute route',
            error: error.message
        });
    }
};

// @desc    Get user's commute routes
// @route   GET /api/commute/routes
// @access  Private
exports.getCommuteRoutes = async (req, res) => {
    try {
        const { page = 1, limit = 10, favorites = false } = req.query;

        const query = {
            user: req.user.id,
            isActive: true
        };

        if (favorites === 'true') {
            query.isFavorite = true;
        }

        const startIndex = (page - 1) * limit;
        const total = await CommuteRoute.countDocuments(query);

        const routes = await CommuteRoute.find(query)
            .sort('-createdAt')
            .skip(startIndex)
            .limit(parseInt(limit));

        const pagination = {};
        if (startIndex + limit < total) {
            pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
        }
        if (startIndex > 0) {
            pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
        }

        res.status(200).json({
            success: true,
            count: routes.length,
            total,
            pagination,
            data: routes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching commute routes',
            error: error.message
        });
    }
};

// @desc    Get single commute route
// @route   GET /api/commute/routes/:id
// @access  Private
exports.getCommuteRoute = async (req, res) => {
    try {
        const route = await CommuteRoute.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Commute route not found'
            });
        }

        // Check if user owns this route
        if (route.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Increment usage count
        await route.incrementUsage();

        res.status(200).json({
            success: true,
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching commute route',
            error: error.message
        });
    }
};

// @desc    Update commute route
// @route   PUT /api/commute/routes/:id
// @access  Private
exports.updateCommuteRoute = async (req, res) => {
    try {
        let route = await CommuteRoute.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Commute route not found'
            });
        }

        // Check if user owns this route
        if (route.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this route'
            });
        }

        route = await CommuteRoute.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Commute route updated successfully',
            data: route
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating commute route',
            error: error.message
        });
    }
};

// @desc    Delete commute route
// @route   DELETE /api/commute/routes/:id
// @access  Private
exports.deleteCommuteRoute = async (req, res) => {
    try {
        const route = await CommuteRoute.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Commute route not found'
            });
        }

        // Check if user owns this route
        if (route.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this route'
            });
        }

        await route.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Commute route deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error deleting commute route',
            error: error.message
        });
    }
};

// @desc    Toggle favorite status
// @route   PUT /api/commute/routes/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
    try {
        const route = await CommuteRoute.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Commute route not found'
            });
        }

        // Check if user owns this route
        if (route.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this route'
            });
        }

        route.isFavorite = !route.isFavorite;
        await route.save();

        res.status(200).json({
            success: true,
            message: `Route ${route.isFavorite ? 'added to' : 'removed from'} favorites`,
            data: { isFavorite: route.isFavorite }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating favorite status',
            error: error.message
        });
    }
};

// @desc    Find nearby mosques and religious places
// @route   GET /api/commute/nearby-mosques
// @access  Public
exports.getNearbyMosques = async (req, res) => {
    try {
        const { lat, lng, radius = 5000 } = req.query; // radius in meters

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // This is a simplified example. In production, you'd integrate with Google Places API
        // or maintain your own database of mosques/religious places
        const mockMosques = [
            {
                name: "Central Mosque",
                address: "123 Main Street, Campus Area",
                distance: 800,
                walkingTime: "10 minutes",
                coordinates: {
                    lat: parseFloat(lat) + 0.005,
                    lng: parseFloat(lng) + 0.005
                },
                prayerTimes: {
                    fajr: "05:30",
                    dhuhr: "12:45",
                    asr: "15:30",
                    maghrib: "18:15",
                    isha: "19:45"
                },
                facilities: ["parking", "ablution_area", "separate_women_section"]
            },
            {
                name: "University Mosque",
                address: "456 University Avenue",
                distance: 1200,
                walkingTime: "15 minutes",
                coordinates: {
                    lat: parseFloat(lat) - 0.008,
                    lng: parseFloat(lng) + 0.003
                },
                prayerTimes: {
                    fajr: "05:30",
                    dhuhr: "12:45",
                    asr: "15:30",
                    maghrib: "18:15",
                    isha: "19:45"
                },
                facilities: ["wheelchair_accessible", "ablution_area"]
            },
            {
                name: "Community Islamic Center",
                address: "789 Community Drive",
                distance: 2100,
                walkingTime: "25 minutes",
                coordinates: {
                    lat: parseFloat(lat) + 0.015,
                    lng: parseFloat(lng) - 0.010
                },
                prayerTimes: {
                    fajr: "05:30",
                    dhuhr: "12:45",
                    asr: "15:30",
                    maghrib: "18:15",
                    isha: "19:45"
                },
                facilities: ["parking", "wheelchair_accessible", "ablution_area", "separate_women_section"]
            }
        ];

        // Filter by radius
        const nearbyMosques = mockMosques.filter(mosque => mosque.distance <= radius);

        res.status(200).json({
            success: true,
            count: nearbyMosques.length,
            radius: `${radius} meters`,
            data: nearbyMosques
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error finding nearby mosques',
            error: error.message
        });
    }
};

// @desc    Add traffic alert to route
// @route   POST /api/commute/routes/:id/alerts
// @access  Private
exports.addTrafficAlert = async (req, res) => {
    try {
        const { type, message, severity, endTime } = req.body;

        const route = await CommuteRoute.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Commute route not found'
            });
        }

        // Check if user owns this route
        if (route.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add alerts to this route'
            });
        }

        const alertData = {
            type,
            message,
            severity,
            startTime: Date.now(),
            endTime: endTime ? new Date(endTime) : undefined
        };

        await route.addAlert(alertData);

        res.status(201).json({
            success: true,
            message: 'Alert added successfully',
            data: route.alerts[route.alerts.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error adding alert',
            error: error.message
        });
    }
};

// @desc    Get properties with commute information
// @route   GET /api/commute/properties-with-commute
// @access  Public
exports.getPropertiesWithCommute = async (req, res) => {
    try {
        const { 
            destinationLat, 
            destinationLng, 
            maxCommuteTime = 60, // in minutes
            mode = 'driving',
            page = 1,
            limit = 10
        } = req.query;

        if (!destinationLat || !destinationLng) {
            return res.status(400).json({
                success: false,
                message: 'Destination coordinates are required'
            });
        }

        const startIndex = (page - 1) * limit;

        // Get properties with location data
        const properties = await Property.find({
            'availability.isAvailable': true,
            'location.coordinates.lat': { $exists: true },
            'location.coordinates.lng': { $exists: true }
        })
        .skip(startIndex)
        .limit(parseInt(limit))
        .populate('owner', 'name email phone ownerProfile.ratings');

        // Add mock commute data to each property
        const propertiesWithCommute = properties.map(property => {
            // Calculate approximate distance (simplified)
            const propertyLat = property.location.coordinates.lat;
            const propertyLng = property.location.coordinates.lng;
            
            const R = 6371; // Earth's radius in km
            const dLat = (destinationLat - propertyLat) * Math.PI / 180;
            const dLng = (destinationLng - propertyLng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(propertyLat * Math.PI / 180) * Math.cos(destinationLat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c; // Distance in km

            // Mock commute times (in production, use Google Maps API)
            const commuteTime = Math.round(distance * (mode === 'walking' ? 12 : mode === 'transit' ? 3 : 2));

            return {
                ...property.toObject(),
                commuteInfo: {
                    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
                    duration: commuteTime,
                    mode: mode,
                    estimatedCost: mode === 'transit' ? Math.round(distance * 2) : Math.round(distance * 0.5)
                }
            };
        });

        // Filter by max commute time
        const filteredProperties = propertiesWithCommute.filter(
            property => property.commuteInfo.duration <= maxCommuteTime
        );

        res.status(200).json({
            success: true,
            count: filteredProperties.length,
            filters: {
                maxCommuteTime: `${maxCommuteTime} minutes`,
                mode,
                destination: `${destinationLat}, ${destinationLng}`
            },
            data: filteredProperties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching properties with commute info',
            error: error.message
        });
    }
};