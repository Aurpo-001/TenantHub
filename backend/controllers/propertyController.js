// backend/controllers/propertyController.js

const Property = require('../models/Property');
const User = require('../models/User');

/**
 * @desc   Get all properties with search & filters
 * @route  GET /api/properties
 * @access Public
 *
 * Accepts query params:
 *  - search        (string, matches title/description/location.address)
 *  - type          ('apartment' | 'garage')
 *  - minPrice      (number)
 *  - maxPrice      (number)
 *  - available     ('true' to filter by availability.isAvailable)
 *  - sort          (e.g. '-createdAt', 'price', '-price', '-views', '-ratings.average')
 *  - select        (optional CSV of fields)
 *  - page          (number, default 1)
 *  - limit         (number, default 10)
 */
exports.getProperties = async (req, res, next) => {
  try {
    const {
      search,
      type,
      minPrice,
      maxPrice,
      available,
      sort,
      select,
      page = 1,
      limit = 10,
    } = req.query;

    // Build a single filter object so we can reuse it for both .find() and .countDocuments()
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    if (type) {
      filter.type = type; // 'apartment' | 'garage'
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice, 10);
    }

    if (available === 'true') {
      filter['availability.isAvailable'] = true;
    }

    // Create the base query with the filter
    let query = Property.find(filter).populate('owner', '_id name email');

    // Base query (already defined above with owner population)
    
    // Select specific fields if requested
    if (select) {
      const fields = select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sorting
    const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';
    query = query.sort(sortBy);

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute count and query in parallel
    const [total, properties] = await Promise.all([
      Property.countDocuments(filter),
      query
        .skip(skip)
        .limit(limitNum)
    ]);

    // Pagination result
    const pagination = {};
    if (skip + limitNum < total) {
      pagination.next = { page: pageNum + 1, limit: limitNum };
    }
    if (skip > 0) {
      pagination.prev = { page: pageNum - 1, limit: limitNum };
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching properties',
      error: error.message,
    });
  }
};

/**
 * @desc   Get single property
 * @route  GET /api/properties/:id
 * @access Public
 */
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('reviews.user', 'name');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Increment views (non-blocking best-effort)
    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching property',
      error: error.message,
    });
  }
};

/**
 * @desc   Create new property
 * @route  POST /api/properties
 * @access Private (Admin/Owner)
 */
exports.createProperty = async (req, res) => {
  try {
    // attach owner from auth middleware
    req.body.owner = req.user.id;

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating property',
      error: error.message,
    });
  }
};

/**
 * @desc   Update property
 * @route  PUT /api/properties/:id
 * @access Private (Admin/Owner)
 */
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Only owner or admin can update
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this property',
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating property',
      error: error.message,
    });
  }
};

/**
 * @desc   Delete property
 * @route  DELETE /api/properties/:id
 * @access Private (Admin/Owner)
 */
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Only owner or admin can delete
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this property',
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting property',
      error: error.message,
    });
  }
};

/**
 * @desc   Get recommendations for user (based on preferences + recent searches)
 * @route  GET /api/properties/user/recommendations
 * @access Private
 */
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = user.preferences || {};

    const query = {
      'availability.isAvailable': true,
      isActive: true,
    };

    if (preferences.propertyType && preferences.propertyType.length > 0) {
      query.type = { $in: preferences.propertyType };
    }

    if (preferences.priceRange) {
      query.price = {
        $gte: preferences.priceRange.min,
        $lte: preferences.priceRange.max,
      };
    }

    if (preferences.location) {
      query['location.address'] = { $regex: preferences.location, $options: 'i' };
    }

    let recommendations = await Property.find(query)
      .populate('owner', 'name email phone')
      .sort({ 'ratings.average': -1, views: -1 })
      .limit(10);

    // Also include results influenced by recent searches
    if (user.searchHistory && user.searchHistory.length > 0) {
      const recentSearches = user.searchHistory.slice(-5);
      const searchBasedQuery = {
        $or: recentSearches.map((s) => ({
          $or: [
            { title: { $regex: s.searchTerm, $options: 'i' } },
            { description: { $regex: s.searchTerm, $options: 'i' } },
          ],
        })),
      };

      const searchBasedRecs = await Property.find(searchBasedQuery)
        .populate('owner', 'name email phone')
        .limit(5);

      // Merge & dedupe by _id
      const merged = [...recommendations, ...searchBasedRecs];
      const seen = new Set();
      recommendations = [];
      for (const p of merged) {
        const id = p._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          recommendations.push(p);
        }
        if (recommendations.length >= 10) break;
      }
    }

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      message:
        'Recommendations generated based on your preferences and search history',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error generating recommendations',
      error: error.message,
    });
  }
};
