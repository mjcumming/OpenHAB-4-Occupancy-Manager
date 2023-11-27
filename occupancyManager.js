
const { LocationManager } = require('./locations/locationManager.js');

/**
 * The Occupancy Manager class is used to start the Location Manager.
 * @class
 */
class OccupancyManager {
    /**
     * Create an Occupancy Manager.
     * @constructor
     */
    constructor() {
        console.log('Occupancy Manager is Starting');
        this.locationManager = new LocationManager();
        console.log('Occupancy Manager is Started');
    }

    /**
     * Dispose of the Occupancy Manager.
     * @method
     */
    dispose() {
        this.locationManager.dispose();
        console.log("OccupancyManager cleanup completed.");
    }      
}

module.exports = {
    OccupancyManager: OccupancyManager
}

