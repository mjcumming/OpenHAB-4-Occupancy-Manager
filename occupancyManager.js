
const { LocationManager } = require('./locations/locationManager.js');

/** 
 * config: {
 *  createLocationMetadata: true|false
 *  CreatePointItemMetadata: true|false
 */

/**
 * The Occupancy Manager class is used to start the Location Manager.
 * @class
 */
class OccupancyManager {
    /**
     * Create an Occupancy Manager.
     * @constructor
     * @param {Object} config - The configuration object containing key-value pairs.
     */
    constructor(config) {
        console.log('Occupancy Manager is Starting');
        this.locationManager = new LocationManager(config);
        console.log('Occupancy Manager Running');
    }
    
}

module.exports = {
    OccupancyManager: OccupancyManager
}

