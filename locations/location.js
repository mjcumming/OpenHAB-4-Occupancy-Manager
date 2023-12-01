
/**
 * Represents a location with occupancy management.
 */

/*global rules, items, things*/

const { LocationUtils } = require ('occupancymanager/locations/utils/locationUtils.js');  //location utils
const { LocationLocking } = require ('occupancymanager/locations/utils/locationLocking.js'); //location locking management and timer
const { LocationEventMetadata } = require ('occupancymanager/locations/utils/locationEventMetadata.js'); //location event metadata
const { ItemEventHandler } = require ('occupancymanager/locations/events/itemEventHandler.js'); // handlers events for items in a location
const { OccupancyTimer } = require ('occupancymanager/locations/utils/occupancyTimer.js'); // occupancy timer
const { LocationOccupancyItems } = require ('occupancymanager/locations/utils/locationOccupancyItems.js'); // 
const { LocationActions } = require ('occupancymanager/locations/utils/locationActions.js'); //

/**
 * Represents a location with occupancy management.
 * @class
 *  @property {Object} locationItem - The item representing the location.
 *  @property {Object} locations - Contains all location objects indexed by location name.
 */
class Location {
    /**
     * Constructs a new Location instance.
     * 
     * @param {Object} locationItem - The main item representing the location.
     * @param {Object} locations - Contains all location objects indexed by location name.
     */
    constructor(locationItem, locations, config) {
        this.locationItem = locationItem;
        this.locations = locations;
        this.config = config;
        
        this.occupancySettings = new LocationEventMetadata(this.locationItem.name, this.config.createLocationMetadata);
        console.log(`Adding Location ${this.locationItem.name} Occupancy settings: ${this.occupancySettings.getOccupancySettings()}`);

        this.occupancyTimer = new OccupancyTimer(this);
        this.locking = new LocationLocking(this);
        this.itemEventHandler = new ItemEventHandler(this);
        this.occupancyItems = new LocationOccupancyItems(this.locationItem);
        this.locationActions = new LocationActions(this);
        this.locationOccupied = false;
    }
  
    /**
     * String representation of the Location instance.
     *     
     * @returns {string} - Description of the location instance.
     */
    toString() {
        const ot = this.occupancyTimer.timeOut || 'Vacant';
        const lockedState = this.locking.isLocked() ? 'Locked' : 'Unlocked';
        return `Location: ${this.locationItem.name}, Occupied until = ${ot}, Locked state: ${lockedState}`;
    }
 
    /**
     * Sets the location as occupied and propagates the change to parent location.
     *
     * @param {string} reason - The reason for setting the location to occupied.
     * @param {number|null} occupancyTime - The time duration (in minutes) for which the location is occupied, or null if the default occupancy time should be used, or 0 if the location should be set to vacant.
     */
    setLocationOccupied(reason, occupancyTime = null) {
        if (!this.locking.isLocked()) {
            occupancyTime = occupancyTime || this.occupancySettings.getOccupancyTime();

            console.log(`Location ${this.locationItem.name} set location occuppied, triggering reason ${reason}, using occupancy time of ${occupancyTime}`);

            if (!this.locationOccupied) {
                this.locationActions.executeOccupiedActions();
            }
            this.locationOccupied = true;

            if (occupancyTime !== null) {
                occupancyTime = parseFloat(occupancyTime);
                if (isNaN(occupancyTime)) {
                    console.warn(`Invalid occupancy time ${occupancyTime} for location ${this.locationItem.name} occupied event.`);
                    return;
                }
                if (occupancyTime === 0) {
                    this.setLocationVacant("Occupancy time of 0 for last event");
                    return;
                }
            } 

            this.occupancyItems.occupancyStateItem.postUpdate('ON'); //postUpdate not sendCommand which creates events

            if (!occupancyTime) {
                console.warn(`No occupancy time specified for location ${this.locationItem.name} occupied event.`);
            } else if (occupancyTime > 0) {
                this.occupancyTimer.start(occupancyTime * 60);
            } 
        } else {
            console.warn(`Location ${this.locationItem.name} is locked, occupancy state not changed.`);
            return;
        }

        const parentLocationGroup = LocationUtils.getParentLocation(this.locationItem);
        if (parentLocationGroup) {
            const parentLocation = this.locations[parentLocationGroup.name];
            if (parentLocation) {
                console.debug(`Location ${this.locationItem.name} is propagating event to ${parentLocationGroup.name}`);
                parentLocation.setLocationOccupied("Child Location Occupied");
            } else {
                console.warn(`Location ${this.locationItem.name} has a parent location, but it was not found in locations.`);
            }
        } else {
            console.debug(`Location ${this.locationItem.name} does not have a parent location.`);
        }
    }
 
    /**
     * Set the location to vacant and propagate the change to child locations.
     *
     * @param {string} reason - The reason for setting the location to vacant, for logging purposes.
     */
    setLocationVacant(reason) {
        console.log(`Set location ${this.locationItem.name} to vacant, reason ${reason}`);

        if (this.locking.hasLockedChildLocations()) {
            console.warn(`Location ${this.locationItem.name} has locked child locations, cannot set to vacant.`);
            return;
        }   

        if (!this.locking.isLocked()) {
            this.locationOccupied = false;
            this.locationActions.executeVacantActions();

            this.occupancyItems.occupancyStateItem.postUpdate('OFF'); //postUpdate not sendCommand which creates events
            this.occupancyItems.occupancyTimeItem.postUpdate("Vacant");

            // When location is vacant, force child locations to vacant
            console.debug(`Location ${this.locationItem.name} is vacant, propagating event to child locations`)
            const childLocationItems = LocationUtils.getChildLocations(this.locationItem);
            for (const childLocationItem of childLocationItems) {
                const location = this.locations[childLocationItem.name];
                if (location === undefined) {
                    console.warn(`Location ${childLocationItem.name} not found in locations.`);
                } else {
                    console.debug(`Propagating occupancy state to child location ${childLocationItem.name}`);
                    location.setLocationVacant('Parent Vacant');
                }
            }
        } else {
            console.warn(`Location ${this.locationItem.name} is locked. Cannot set state to vacant.`);
        }
    }

    /**
    * Check if the location is occupied.
    * @returns {boolean} True if the location is occupied, false otherwise.
    */
    isLocationOccupied() {
       return this.locationOccupied;
    }

    logPointItems() {
        const pointItems = LocationUtils.getPointItems(this.locationItem);
        console.log(`All point items for location ${this.locationItem.name}:`);
        pointItems.forEach(item => console.log(item.name));
    }

    /**
     * Logs details about the location.
     *
     * @param {string} level - Logging level.
     * @param {string} indent - Indentation for the log.
     */
    logDetails(level, indent) {
        const ot = this.occupancyTimer.timeOut || 'Vacant';
        console.warn(`${indent}Location: ${this.location.locationItem.name}, Occupied until = ${ot}, ${this.locking.isLocked() ? 'Locked' : 'Unlocked'}`);
        // Additional logging for occupancy items can be added here if needed.
    }

    /**
     * Cancels any active timer for the location.
     */
    dispose() {
        this.occupancyItems.dispose();
        //this.occupancyTimer.dispose(); 
        //this.locking.dispose();

        console.log(`Location ${this.locationItem.name} disposed.`);
    }

} 

module.exports = {
    Location: Location
};  

//var item = items.getItem('gLocThirdFloor')

//const l = new Location (item,{})

//l.occupancyTimer.start(5) 
//l.setLocationOccupied('test',.5)  
//l.locking.clearLock()
//l.locking.lock (5)
//l.unlock()
 



 
  
//l.logPointItems()




