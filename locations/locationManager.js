
// Load the required modules
const { LocationEventHandlers } = require ('./utils/locationEventHandlers.js');
const { Location } = require ('./location.js');
const intializeDaylightSwtich = require ('./utils/daylightSwitch.js');



/**
 * The LocationManager class manages a collection of locations and handles location item events.
 */
class LocationManager {

    /**
     * Creates a new instance of the LocationManager class.
     * @constructor
     * @param {Object} config - The configuration object containing key-value pairs.
     */
    constructor(config) {
        /**
         * The locations managed by this manager.
         * @type {Object.<string, Location>}
         */
        intializeDaylightSwtich();

        this.locations = {};
        this.config = config;
        console.log(`LocationManager config: ${JSON.stringify(this.config)}`);
        this.addExistingLocations();
        this.LocationEventHandlers = new LocationEventHandlers(this);

        require('@runtime').lifecycleTracker.addDisposeHook(() => {
            this.dispose()
          });
    }

    /**
     * Adds existing items that are locations.
     */
    addExistingLocations() {
        const allItems = items.getItems();
        for (let item of allItems) {
            if (item.semantics.isLocation) {
                this.addLocation(item);
            }
        }
    }

    /**
     * Adds a location to the manager.
     * @param {Location} locationItem - The location to add.
     */
    addLocation(locationItem) {
        this.locations[locationItem.name] = new Location(locationItem, this.locations, this.config);
    }

    /**
     * Removes a location from the manager.
     * @param {string} locationName - The name of the location to remove.
     */
    removeLocation(locationName) {
        const location = this.locations[locationName];
        if (location) {
            location.dispose();
            delete this.locations[locationName];
        } else {
            //console.log(`Location ${locationName} does not exist. Nothing to remove.`);
            // we get all item remove events, we have no way of knowing if it was a location or not, so we just ignore it if it is not a location.
        }
    }

    /**
     * Gets a location from the manager.
     * @param {string} locationName - The name of the location to get.
     * @returns {Location} - The location with the specified name, or undefined if it doesn't exist.
     */
    getLocation(locationName) {
        return this.locations[locationName];
    }
    
    /**
     * Prints the tree view of locations.
     */
    printTreeView() {
        LocationUtils.printLocationTree();
    }

    /**
     * Closes all locations.
     */
    dispose() {
        this.LocationEventHandlers.dispose();
        
        for (let locationName in this.locations) {
            let location = this.locations[locationName];
            location.dispose();
        }
    }
}

// Export the LocationManager class

module.exports = {
    LocationManager: LocationManager
};