const OwnerDashboard = require('../models/OwnerDashboard');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get owner dashboard
// @route   GET /api/dashboard/owner
// @access  Private (Owner only)
exports.getOwnerDashboard = async (req, res) => {
    try {
        let dashboard = await OwnerDashboard.findOne({ owner: req.user.id })
            .populate('properties.property', 'title type price location availability')
            .populate('properties.currentTenant', 'name email phone')
            .populate('tenants.tenant', 'name email phone')
            .populate('tenants.property', 'title location');

        if (!dashboard) {
            // Create dashboard if it doesn't exist
            dashboard = await OwnerDashboard.create({ owner: req.user.id });
            await dashboard.populate([
                { path: 'properties.property', select: 'title type price location availability' },
                { path: 'properties.currentTenant', select: 'name email phone' },
                { path: 'tenants.tenant', select: 'name email phone' },
                { path: 'tenants.property', select: 'title location' }
            ]);
        }

        // Update analytics
        await dashboard.calculateAnalytics();

        res.status(200).json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching dashboard',
            error: error.message
        });
    }
};

// @desc    Update owner dashboard
// @route   PUT /api/dashboard/owner
// @access  Private (Owner only)
exports.updateOwnerDashboard = async (req, res) => {
    try {
        const { notifications, properties, tenants } = req.body;

        let dashboard = await OwnerDashboard.findOne({ owner: req.user.id });

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found'
            });
        }

        // Update notification preferences
        if (notifications) {
            dashboard.notifications = { ...dashboard.notifications, ...notifications };
        }

        // Update properties information
        if (properties) {
            dashboard.properties = properties;
        }

        // Update tenants information
        if (tenants) {
            dashboard.tenants = tenants;
        }

        await dashboard.save();
        await dashboard.calculateAnalytics();

        res.status(200).json({
            success: true,
            message: 'Dashboard updated successfully',
            data: dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating dashboard',
            error: error.message
        });
    }
};

// @desc    Generate monthly report
// @route   POST /api/dashboard/owner/reports/:month
// @access  Private (Owner only)
exports.generateMonthlyReport = async (req, res) => {
    try {
        const { month } = req.params; // Format: "2024-01"

        let dashboard = await OwnerDashboard.findOne({ owner: req.user.id });

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Dashboard not found'
            });
        }

        await dashboard.generateMonthlyReport(month);

        const report = dashboard.monthlyReports.find(r => r.month === month);

        res.status(200).json({
            success: true,
            message: `Monthly report for ${month} generated successfully`,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error generating report',
            error: error.message
        });
    }
};

// @desc    Get financial summary
// @route   GET /api/dashboard/owner/financials
// @access  Private (Owner only)
exports.getFinancialSummary = async (req, res) => {
    try {
        const { year, month } = req.query;

        // Get all properties for this owner
        const properties = await Property.find({ owner: req.user.id });
        const propertyIds = properties.map(p => p._id);

        // Build date filter
        let dateFilter = {};
        if (year && month) {
            const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            dateFilter = {
                'payment.paymentDate': {
                    $gte: startDate,
                    $lte: endDate
                }
            };
        } else if (year) {
            dateFilter = {
                'payment.paymentDate': {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            };
        }

        // Get all paid bookings for owner's properties
        const paidBookings = await Booking.find({
            'property': { $in: propertyIds },
            'payment.isPaid': true,
            ...dateFilter
        }).populate('property', 'title type price');

        // Calculate financial metrics
        const totalRevenue = paidBookings.reduce((sum, booking) => sum + booking.payment.ownerAmount, 0);
        const totalCommissions = paidBookings.reduce((sum, booking) => sum + booking.payment.adminCommission, 0);
        const totalAdvanceReceived = paidBookings.reduce((sum, booking) => sum + booking.payment.advanceAmount, 0);

        // Group by month for trend analysis
        const monthlyBreakdown = {};
        paidBookings.forEach(booking => {
            const monthKey = booking.payment.paymentDate.toISOString().substring(0, 7); // YYYY-MM
            if (!monthlyBreakdown[monthKey]) {
                monthlyBreakdown[monthKey] = {
                    revenue: 0,
                    commissions: 0,
                    bookings: 0
                };
            }
            monthlyBreakdown[monthKey].revenue += booking.payment.ownerAmount;
            monthlyBreakdown[monthKey].commissions += booking.payment.adminCommission;
            monthlyBreakdown[monthKey].bookings += 1;
        });

        // Get property-wise breakdown
        const propertyBreakdown = {};
        paidBookings.forEach(booking => {
            const propId = booking.property._id.toString();
            if (!propertyBreakdown[propId]) {
                propertyBreakdown[propId] = {
                    propertyTitle: booking.property.title,
                    propertyType: booking.property.type,
                    revenue: 0,
                    bookings: 0
                };
            }
            propertyBreakdown[propId].revenue += booking.payment.ownerAmount;
            propertyBreakdown[propId].bookings += 1;
        });

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalCommissions,
                    totalAdvanceReceived,
                    totalBookings: paidBookings.length,
                    averageBookingValue: paidBookings.length > 0 ? totalAdvanceReceived / paidBookings.length : 0
                },
                monthlyBreakdown: Object.entries(monthlyBreakdown).map(([month, data]) => ({
                    month,
                    ...data
                })).sort((a, b) => a.month.localeCompare(b.month)),
                propertyBreakdown: Object.values(propertyBreakdown).sort((a, b) => b.revenue - a.revenue)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching financial summary',
            error: error.message
        });
    }
};

// @desc    Get admin dashboard analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
    try {
        // Get overall statistics
        const totalUsers = await User.countDocuments();
        const totalProperties = await Property.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } });

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('property', 'title type price')
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(10);

        // Get most viewed properties
        const popularProperties = await Property.find()
            .sort('-views')
            .limit(10)
            .select('title type price views location ratings');

        // Get revenue statistics
        const revenueStats = await Booking.aggregate([
            {
                $match: { 'payment.isPaid': true }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$payment.advanceAmount' },
                    totalCommissions: { $sum: '$payment.adminCommission' },
                    averageBookingValue: { $avg: '$payment.advanceAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get user registration trends (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const userTrends = await User.aggregate([
            {
                $match: { createdAt: { $gte: twelveMonthsAgo } }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Get booking status distribution
        const bookingStatusStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get top rated properties
        const topRatedProperties = await Property.find()
            .sort({ 'ratings.average': -1, 'ratings.count': -1 })
            .limit(5)
            .select('title type price ratings location owner')
            .populate('owner', 'name email');

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalProperties,
                    totalBookings,
                    activeBookings
                },
                revenue: revenueStats[0] || {
                    totalRevenue: 0,
                    totalCommissions: 0,
                    averageBookingValue: 0,
                    count: 0
                },
                recentBookings,
                popularProperties,
                topRatedProperties,
                userTrends,
                bookingStatusStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching admin dashboard',
            error: error.message
        });
    }
};

// @desc    Get recommendation effectiveness analytics
// @route   GET /api/dashboard/admin/recommendations
// @access  Private (Admin only)
exports.getRecommendationAnalytics = async (req, res) => {
    try {
        const { timeframe = '30' } = req.query; // days
        
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

        // Get users who viewed recommendations
        const users = await User.find({
            'searchHistory.timestamp': { $gte: daysAgo }
        });

        // Get properties that were recommended vs viewed vs booked
        const recommendationStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: daysAgo }
                }
            },
            {
                $lookup: {
                    from: 'properties',
                    localField: 'property',
                    foreignField: '_id',
                    as: 'propertyInfo'
                }
            },
            {
                $group: {
                    _id: '$property',
                    bookings: { $sum: 1 },
                    propertyTitle: { $first: { $arrayElemAt: ['$propertyInfo.title', 0] } },
                    propertyViews: { $first: { $arrayElemAt: ['$propertyInfo.views', 0] } },
                    averageRating: { $first: { $arrayElemAt: ['$propertyInfo.ratings.average', 0] } }
                }
            },
            {
                $sort: { bookings: -1 }
            },
            {
                $limit: 20
            }
        ]);

        // Calculate conversion rates
        const totalRecommendationViews = await Property.aggregate([
            {
                $match: {
                    createdAt: { $gte: daysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        const totalBookings = await Booking.countDocuments({
            createdAt: { $gte: daysAgo }
        });

        const conversionRate = totalRecommendationViews[0] ? 
            (totalBookings / totalRecommendationViews[0].totalViews * 100) : 0;

        // User engagement metrics
        const userEngagement = await User.aggregate([
            {
                $match: {
                    'searchHistory': { $exists: true, $ne: [] }
                }
            },
            {
                $project: {
                    searchCount: { $size: '$searchHistory' },
                    recentSearches: {
                        $filter: {
                            input: '$searchHistory',
                            cond: { $gte: ['$$this.timestamp', daysAgo] }
                        }
                    }
                }
            },
            {
                $project: {
                    searchCount: 1,
                    recentSearchCount: { $size: '$recentSearches' }
                }
            },
            {
                $group: {
                    _id: null,
                    avgSearchesPerUser: { $avg: '$recentSearchCount' },
                    totalActiveUsers: { $sum: 1 },
                    totalSearches: { $sum: '$recentSearchCount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            timeframe: `${timeframe} days`,
            data: {
                overview: {
                    totalViews: totalRecommendationViews[0]?.totalViews || 0,
                    totalBookings,
                    conversionRate: Math.round(conversionRate * 100) / 100,
                    activeUsers: userEngagement[0]?.totalActiveUsers || 0,
                    avgSearchesPerUser: Math.round((userEngagement[0]?.avgSearchesPerUser || 0) * 10) / 10
                },
                topPerformingProperties: recommendationStats,
                userEngagement: userEngagement[0] || {
                    avgSearchesPerUser: 0,
                    totalActiveUsers: 0,
                    totalSearches: 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching recommendation analytics',
            error: error.message
        });
    }
};