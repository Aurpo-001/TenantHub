const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get all properties with search and filters
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
    try {
        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Build query
        let query = Property.find(JSON.parse(queryStr));

        // Advanced search
        if (req.query.search) {
            query = query.find({
                $or: [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { description: { $regex: req.query.search, $options: 'i' } },
                    { 'location.address': { $regex: req.query.search, $options: 'i' } }
                ]
            });
        }

        // Filter by property type
        if (req.query.type) {
            query = query.find({ type: req.query.type });
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            const priceFilter = {};
            if (req.query.minPrice) priceFilter.$gte = parseInt(req.query.minPrice);
            if (req.query.maxPrice) priceFilter.$lte = parseInt(req.query.maxPrice);
            query = query.find({ price: priceFilter });
        }

        // Availability filter
        if (req.query.available === 'true') {
            query = query.find({ 'availability.isAvailable': true });
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Property.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Populate owner info
        query = query.populate('owner', 'name email phone');

        // Execute query
        const properties = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: properties.length,
            total,
            pagination,
            data: properties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching properties',
            error: error.message
        });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name email phone')
            .populate('reviews.user', 'name');

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Increment views
        property.views += 1;
        await property.save();

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching property',
            error: error.message
        });
    }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Admin/Owner)
exports.createProperty = async (req, res) => {
    try {
        // Add user to req.body
        req.body.owner = req.user.id;

        const property = await Property.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating property',
            error: error.message
        });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Admin/Owner)
exports.updateProperty = async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Make sure user is property owner or admin
        if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this property'
            });
        }

        property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating property',
            error: error.message
        });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Admin/Owner)
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Make sure user is property owner or admin
        if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this property'
            });
        }

        await property.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error deleting property',
            error: error.message
        });
    }
};

// @desc    Get recommendations for user
// @route   GET /api/properties/user/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const preferences = user.preferences;

        // Build recommendation query based on user preferences
        const query = {
            'availability.isAvailable': true,
            isActive: true
        };

        // Filter by preferred property types
        if (preferences.propertyType && preferences.propertyType.length > 0) {
            query.type = { $in: preferences.propertyType };
        }

        // Filter by price range
        if (preferences.priceRange) {
            query.price = {
                $gte: preferences.priceRange.min,
                $lte: preferences.priceRange.max
            };
        }

        // Filter by location if specified
        if (preferences.location) {
            query['location.address'] = { $regex: preferences.location, $options: 'i' };
        }

        // Get recommended properties
        let recommendations = await Property.find(query)
            .populate('owner', 'name email phone')
            .sort({ 'ratings.average': -1, views: -1 })
            .limit(10);

        // If user has search history, also recommend based on that
        if (user.searchHistory && user.searchHistory.length > 0) {
            const recentSearches = user.searchHistory.slice(-5);
            const searchBasedQuery = {
                $or: recentSearches.map(search => ({
                    $or: [
                        { title: { $regex: search.searchTerm, $options: 'i' } },
                        { description: { $regex: search.searchTerm, $options: 'i' } }
                    ]
                }))
            };

            const searchBasedRecs = await Property.find(searchBasedQuery)
                .populate('owner', 'name email phone')
                .limit(5);

            recommendations = [...recommendations, ...searchBasedRecs];

            // Remove duplicates
            const uniqueRecommendations = recommendations.filter((property, index, self) =>
                index === self.findIndex(p => p._id.toString() === property._id.toString())
            );

            recommendations = uniqueRecommendations.slice(0, 10);
        }

        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations,
            message: 'Recommendations generated based on your preferences and search history'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error generating recommendations',
            error: error.message
        });
    }
};