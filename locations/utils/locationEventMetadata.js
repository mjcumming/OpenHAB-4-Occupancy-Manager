/**
 * Location Occupancy Event Metadata
 * 
 * Provides an interface to an item's metadata that determines occupancy settings.
 */


class LocationEventMetadata {

    /**
     * Constructs a new LocationEventMetadata object.
     * 
     * @param {string} locationItemName - The name of the location item.
     */
    constructor(locationItemName) {
        this.itemName = locationItemName;
        this.namespace = "OccupancySettings";

        // Retrieve the item object from openHAB using the item name
        this.item = items.getItem(this.itemName);

        // Validate if the item is a location using openHAB semantics
        if (!this.item.semantics.isLocation) {
            throw new Error(`Item ${this.itemName} is not a location.`);
        }
        
        // Validate the metadata for the item
        this.validateMetadata();
    }

    validateMetadata() {
        const metadata = this.item.getMetadata(this.namespace);

        // Check if metadata is null
        if (!metadata) {
            console.warn(`WARNING: Metadata is null for item: ${this.itemName}`);
            // this happens if we process an item immediately after it was added - it seems the metadata is not available yet, so we need to wait a bit as done in the event handler.
            // this code left here for reference
            return;
        }

        // Check for Time key
        if (!metadata.configuration['Time']) {
                console.warn(`WARNING: 'Time' key is missing in metadata for item: ${this.itemName}`);
        }

        // Check for OccupiedActions
        if (metadata.configuration['OccupiedActions']) {
            const allowedOccupiedActions = ['LightsOn', 'LightsOnIfDark', 'SceneOn', 'SceneOnIfDark'];
            const actions = metadata.configuration['OccupiedActions'].split(',');
            actions.forEach(action => {
                if (!allowedOccupiedActions.includes(action)) {
                    console.warn(`WARNING: Invalid OccupiedAction value '${action}' for item: ${this.itemName}`);
                }
            });
        }

        // Check for VacantActions
        if (metadata.configuration['VacantActions']) {
            const allowedVacantActions = ['LightsOff', 'SceneOff', 'ExhaustFansOff', 'AVOff'];
            const actions = metadata.configuration['VacantActions'].split(',');
            actions.forEach(action => {
                if (!allowedVacantActions.includes(action)) {
                    console.warn(`WARNING: Invalid VacantAction value '${action}' for item: ${this.itemName}`);
                }
            });
        }

        // Check for any other unexpected keys
        const allowedKeys = ['Time', 'OccupiedActions', 'VacantActions'];
        Object.keys(metadata.configuration).forEach(key => {
            if (!allowedKeys.includes(key)) {
                console.warn(`WARNING: Unexpected key '${key}' in metadata for item: ${this.itemName}`);
            }
        });
    }

    /**
     * Retrieves the actions to be taken when the location is occupied.
     * 
     * @returns {Array<string>} - An array of actions.
     */
    getOccupiedActions() {
        const actions = this.getValueForConfigurationKey('OccupiedActions');
        return actions ? actions.split(',') : [];
    }

    /**
     * Retrieves the actions to be taken when the location is vacant.
     * 
     * @returns {Array<string>} - An array of actions.
     */
    getVacantActions() {
        const actions = this.getValueForConfigurationKey('VacantActions');
        return actions ? actions.split(',') : [];
    }

    /**
     * Retrieves the time duration for occupancy.
     * 
     * @returns {number|boolean} - The time duration or false if not set.
     */
    getOccupancyTime() {
        const time = this.getValueForConfigurationKey('Time');
        return time ? parseInt(time) : false;
    }

    /**
     * Helper method to retrieve the value for a given configuration key.
     * 
     * @param {string} key - The configuration key.
     * @returns {string|null} - The value for the key or null if not found.
     */
    getValueForConfigurationKey(key) {
        // Retrieve metadata for the specified namespace
        const metadata = this.item.getMetadata(this.namespace);

        // If metadata exists and has the specified configuration key, return its value
        if (metadata && metadata.configuration && metadata.configuration[key]) {
            return metadata.configuration[key];
        }

        // Return null if the key is not found or metadata doesn't exist
        return null;
    }
    
    /**
     * Retrieves the occupancy settings as a string.
     *
     * @returns {string} - A string representation of the occupancy settings.
     */
    getOccupancySettings() {
        const occupiedActions = this.getOccupiedActions().join(', ');
        const vacantActions = this.getVacantActions().join(', ');
        const occupancyTime = this.getOccupancyTime() || 'not set';

        return `Occupied Actions: ${occupiedActions} Vacant Actions: ${vacantActions} Occupancy Time: ${occupancyTime}`;
    }
}



/**
 * Tests the LocationEventMetadata class with a given item name.
 * 
 * @param {string} testItemName - The name of the item to test.
 */
function testLocationEventMetadata(itemName) {
    console.log(`Testing metadata for item: ${itemName}`);

    const metadataObj = new LocationEventMetadata(itemName);

    // Test getting all configuration values
    const configuration = metadataObj.item.getMetadata(metadataObj.namespace).configuration;
    if (configuration) {
        console.log("Configuration values:");
        for (const key in configuration) {
            console.log(`${key}: ${metadataObj.getValueForConfigurationKey(key)}`);
        }
    } else {
        console.log("No configuration values found.");
    }
}

// Example usage:
// Assuming you have an item with the name "yourItemName" with the necessary metadata
//testLocationEventMetadata("gLocBasementStorageRoom");


// Export the LocationEventMetadata class for external use
module.exports = {
    LocationEventMetadata: LocationEventMetadata
}
