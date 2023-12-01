
const { ItemEventMetadata } = require('./itemEventMetadata.js');

/**
 * Base class for events.
 * @class
 */
class EventBase {
    /**
     * Creates an instance of EventBase.
     * @param {Object} item - The item object.
     * @param {string} location - The location of the item.
     */
    constructor(item, location) {
        this.item = item;
        this.itemName = item.name;
        this.location = location;
        this.lastEvent = null;
    }

    /**
     * Returns the event metadata.
     * @returns {EventMetadata} - The event metadata.
     */
    getEventSettings() {
        return new ItemEventMetadata(this.item);
    }

    /**
     * Processes the changed event.
     * @param {Object} event - The event object.
     */
    processChangedEvent(event) {
        this.lastEvent = event;
    }

    /**
     * Begins the event.
     * @param {Object} event - The event object.
     */
    beginEvent(event) {
        if (!this.location.locking.isLocked()) { // check if location locked before proceeding with standard events
            const eventSettings = this.getEventSettings();

            if (eventSettings.onlyIfVacant() && this.location.isLocationOccupied()) { // item will generate an occupancy event if the location is currently vacant
                console.warn(`Ignoring item ${this.itemName} event as location is occuppied already and only if location vacant flag is present`);
                return;
            }

            let overrideOccupancyTime = eventSettings.getBeginOccupiedTime(); // set to null if time not specified
    
            if (!overrideOccupancyTime === null && eventSettings.overrideTimesIfVacant() && !this.location.isLocationOccupied()) { // override default time if specified and location is vacant
                console.warn(`Ignoring item ${this.itemName} event time as location is occuppied already`);
                overrideOccupancyTime = null;
            } else {
                console.debug(`Begin Event, using item ${this.itemName} event time ${overrideOccupancyTime}`);
            }

            this.location.setLocationOccupied (this.itemName,overrideOccupancyTime)

            if (eventSettings.occupiedUntilEnded()) { // lock the location until an end event comes from this item
                this.location.locking.lock();
            }
        } else {
            console.log(`Location ${this.location.locationItem.name} is locked, event from item ${this.itemName} occupancy state not changed.`);
            return;
        }
    }

    /**
     * Ends the event.
     * @param {Object} event - The event object.
     */
    endEvent(event) {
        const eventSettings = this.getEventSettings();

        if (!this.location.locking.isLocked()) { // check if location locked before proceeding with standard events     
            let overrideOccupancyTime = eventSettings.getEndOccupiedTime(); // set to null if time not specified

            if (!overrideOccupancyTime === null) {  //override default time
                if (overrideOccupancyTime > 0) {
                    this.location.setLocationOccupied (this.itemName,overrideOccupancyTime)
                } else {    
                    this.location.setLocationVacant(`Item ${this.itemName} event ended with occupancy time of 0`);
                }
            } // otherwise, do nothing, as end events typically do not indicate a change in state unless a time is specified
        } else if (eventSettings.occupiedUntilEnded()) {
            console.log(`Location ${this.itemName} unlocked as occupancy event ended`);
            this.location.locking.unlock();
        } else {
            console.log(`Location ${this.location.locationItem.name} is locked, event from item ${this.itemName} occupancy state not changed.`);
        }
    }


}

module.exports = {
    EventBase: EventBase
};  
