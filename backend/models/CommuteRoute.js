const mongoose = require('mongoose');

const commuteRouteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Commute route must belong to a user']
    },
    name: {
        type: String,
        required: [true, 'Route must have a name'],
        maxlength: 100
    },
    origin: {
        address: {
            type: String,
            required: [true, 'Origin address is required']
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        },
        placeId: String // Google Places ID
    },
    destination: {
        address: {
            type: String,
            required: [true, 'Destination address is required']
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        },
        placeId: String // Google Places ID
    },
    routeOptions: [{
        mode: {
            type: String,
            enum: ['driving', 'walking', 'transit', 'bicycling'],
            required: true
        },
        distance: {
            value: Number, // in meters
            text: String   // human readable
        },
        duration: {
            value: Number, // in seconds
            text: String   // human readable
        },
        durationInTraffic: {
            value: Number, // in seconds (for driving mode)
            text: String
        },
        steps: [{
            instruction: String,
            distance: {
                value: Number,
                text: String
            },
            duration: {
                value: Number,
                text: String
            },
            startLocation: {
                lat: Number,
                lng: Number
            },
            endLocation: {
                lat: Number,
                lng: Number
            },
            travelMode: String
        }],
        polyline: String, // Encoded polyline for route visualization
        transitDetails: {
            lines: [{
                name: String,
                shortName: String,
                color: String,
                vehicle: {
                    type: String, // bus, train, metro, etc.
                    name: String
                }
            }],
            totalStops: Number,
            totalTransfers: Number
        },
        fare: {
            currency: String,
            value: Number,
            text: String
        }
    }],
    preferences: {
        preferredMode: {
            type: String,
            enum: ['driving', 'walking', 'transit', 'bicycling'],
            default: 'driving'
        },
        avoidTolls: {
            type: Boolean,
            default: false
        },
        avoidHighways: {
            type: Boolean,
            default: false
        },
        avoidFerries: {
            type: Boolean,
            default: false
        }
    },
    schedule: {
        isDaily: {
            type: Boolean,
            default: true
        },
        daysOfWeek: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        departureTime: String, // HH:MM format
        arrivalTime: String    // HH:MM format
    },
    nearbyPlaces: {
        restaurants: [{
            name: String,
            address: String,
            rating: Number,
            distance: Number, // in meters
            coordinates: {
                lat: Number,
                lng: Number
            }
        }],
        gasStations: [{
            name: String,
            address: String,
            distance: Number,
            coordinates: {
                lat: Number,
                lng: Number
            }
        }],
        hospitals: [{
            name: String,
            address: String,
            distance: Number,
            coordinates: {
                lat: Number,
                lng: Number
            }
        }],
        schools: [{
            name: String,
            address: String,
            distance: Number,
            coordinates: {
                lat: Number,
                lng: Number
            }
        }],
        mosques: [{
            name: String,
            address: String,
            distance: Number, // in meters
            walkingTime: String,
            coordinates: {
                lat: Number,
                lng: Number
            },
            prayerTimes: {
                fajr: String,
                dhuhr: String,
                asr: String,
                maghrib: String,
                isha: String
            },
            facilities: [{
                type: String,
                enum: ['parking', 'wheelchair_accessible', 'ablution_area', 'separate_women_section']
            }]
        }]
    },
    analytics: {
        timesUsed: {
            type: Number,
            default: 0
        },
        lastUsed: Date,
        averageTravelTime: Number, // in minutes
        peakHourMultiplier: Number, // traffic multiplier during peak hours
        weatherImpact: {
            rainy: Number,    // additional time in minutes
            snowy: Number,
            sunny: Number
        }
    },
    alerts: [{
        type: {
            type: String,
            enum: ['traffic', 'construction', 'accident', 'weather', 'schedule_change']
        },
        message: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        startTime: Date,
        endTime: Date,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    isFavorite: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
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

// Index for faster queries
commuteRouteSchema.index({ user: 1, isActive: 1 });
commuteRouteSchema.index({ user: 1, isFavorite: 1 });
commuteRouteSchema.index({ 'origin.coordinates': '2dsphere' });
commuteRouteSchema.index({ 'destination.coordinates': '2dsphere' });

// Update the updatedAt field before saving
commuteRouteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to increment usage count
commuteRouteSchema.methods.incrementUsage = function() {
    this.analytics.timesUsed += 1;
    this.analytics.lastUsed = Date.now();
    return this.save();
};

// Method to add traffic alert
commuteRouteSchema.methods.addAlert = function(alertData) {
    this.alerts.push(alertData);
    return this.save();
};

// Method to get active alerts
commuteRouteSchema.methods.getActiveAlerts = function() {
    const now = Date.now();
    return this.alerts.filter(alert => 
        alert.isActive && 
        (!alert.endTime || alert.endTime > now)
    );
};

module.exports = mongoose.model('CommuteRoute', commuteRouteSchema);