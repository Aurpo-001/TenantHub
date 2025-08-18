const mongoose = require('mongoose');

const ownerDashboardSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Dashboard must belong to an owner'],
        unique: true
    },
    properties: [{
        property: {
            type: mongoose.Schema.ObjectId,
            ref: 'Property'
        },
        currentTenant: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        rentStatus: {
            type: String,
            enum: ['vacant', 'occupied', 'maintenance'],
            default: 'vacant'
        },
        lastMaintenanceDate: Date,
        nextMaintenanceDate: Date
    }],
    tenants: [{
        tenant: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        property: {
            type: mongoose.Schema.ObjectId,
            ref: 'Property'
        },
        moveInDate: Date,
        leaseEndDate: Date,
        rentAmount: Number,
        securityDeposit: Number,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    financials: {
        totalRevenue: {
            type: Number,
            default: 0
        },
        monthlyRevenue: {
            type: Number,
            default: 0
        },
        yearlyRevenue: {
            type: Number,
            default: 0
        },
        pendingPayments: {
            type: Number,
            default: 0
        },
        totalExpenses: {
            type: Number,
            default: 0
        },
        netIncome: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    monthlyReports: [{
        month: String, // Format: "2024-01"
        revenue: {
            type: Number,
            default: 0
        },
        expenses: {
            type: Number,
            default: 0
        },
        netIncome: {
            type: Number,
            default: 0
        },
        occupancyRate: {
            type: Number,
            default: 0
        },
        newTenants: {
            type: Number,
            default: 0
        },
        tenantTurnover: {
            type: Number,
            default: 0
        },
        maintenanceRequests: {
            type: Number,
            default: 0
        },
        generatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    analytics: {
        totalProperties: {
            type: Number,
            default: 0
        },
        occupiedProperties: {
            type: Number,
            default: 0
        },
        vacantProperties: {
            type: Number,
            default: 0
        },
        occupancyRate: {
            type: Number,
            default: 0
        },
        averageRent: {
            type: Number,
            default: 0
        },
        totalTenants: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number, // in hours
            default: 0
        },
        ownerRating: {
            average: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            }
        }
    },
    notifications: {
        emailEnabled: {
            type: Boolean,
            default: true
        },
        smsEnabled: {
            type: Boolean,
            default: false
        },
        pushEnabled: {
            type: Boolean,
            default: true
        },
        maintenanceReminders: {
            type: Boolean,
            default: true
        },
        paymentReminders: {
            type: Boolean,
            default: true
        },
        newBookingAlerts: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
ownerDashboardSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate analytics when dashboard is updated
ownerDashboardSchema.methods.calculateAnalytics = async function() {
    const Property = mongoose.model('Property');
    const Booking = mongoose.model('Booking');
    
    // Get all properties for this owner
    const properties = await Property.find({ owner: this.owner });
    
    this.analytics.totalProperties = properties.length;
    this.analytics.occupiedProperties = this.properties.filter(p => p.rentStatus === 'occupied').length;
    this.analytics.vacantProperties = this.properties.filter(p => p.rentStatus === 'vacant').length;
    
    // Calculate occupancy rate
    if (this.analytics.totalProperties > 0) {
        this.analytics.occupancyRate = (this.analytics.occupiedProperties / this.analytics.totalProperties) * 100;
    }
    
    // Calculate average rent
    if (properties.length > 0) {
        const totalRent = properties.reduce((sum, property) => sum + property.price, 0);
        this.analytics.averageRent = totalRent / properties.length;
    }
    
    this.analytics.totalTenants = this.tenants.filter(t => t.isActive).length;
    
    return this.save();
};

// Generate monthly report
ownerDashboardSchema.methods.generateMonthlyReport = async function(month) {
    const Booking = mongoose.model('Booking');
    
    // Calculate revenue for the month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const bookings = await Booking.find({
        'property': { $in: this.properties.map(p => p.property) },
        'payment.isPaid': true,
        'payment.paymentDate': {
            $gte: startDate,
            $lte: endDate
        }
    });
    
    const monthlyRevenue = bookings.reduce((sum, booking) => sum + booking.payment.ownerAmount, 0);
    
    // Find existing report or create new one
    let report = this.monthlyReports.find(r => r.month === month);
    if (!report) {
        report = {
            month: month,
            revenue: monthlyRevenue,
            expenses: 0, // This would be calculated based on actual expenses
            netIncome: monthlyRevenue,
            occupancyRate: this.analytics.occupancyRate,
            newTenants: 0,
            tenantTurnover: 0,
            maintenanceRequests: 0,
            generatedAt: Date.now()
        };
        this.monthlyReports.push(report);
    } else {
        report.revenue = monthlyRevenue;
        report.netIncome = monthlyRevenue - report.expenses;
        report.occupancyRate = this.analytics.occupancyRate;
        report.generatedAt = Date.now();
    }
    
    return this.save();
};

module.exports = mongoose.model('OwnerDashboard', ownerDashboardSchema);