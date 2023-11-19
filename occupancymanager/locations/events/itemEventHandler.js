/**
 * ItemEventHandler.js
 * Handles events from an item in a location and dispatches to the appropriate handler.
 * Used by location.js
 */

// Importing required classes
const { EventOnOff }= require('./eventOnOff');
const { EventContact } = require('./eventContact');
const { EventContactDoor } = require('./eventContactDoor');
const { EventContactMotion } = require('./eventContactMotion');
const { EventContactPresence } = require('./eventContactPresence');
const { EventAnyChange } = require('./eventAnyChange');
const { ItemEventMetadata } = require('../itemEventMetadata');

const eventToClass = {
    'OnOff': EventOnOff,
    'Contact': EventContact,
    'ContactDoor': EventContactDoor,
    'ContactMotion': EventContactMotion,
    'ContactPresence': EventContactPresence,
    'AnyChange': EventAnyChange,
};

/**
 * Class representing an event handler for an item in a location.
 */
class ItemEventHandler {
    /**
     * Create an item event handler.
     * @param {Location} location - The location of the item.
     */
    constructor(location) {
        this.location = location;
        this.locationItemEventHandlers = {};
        this.noSettingsWarningLogged = false;  //warning logged if no settings found for an item, only log once per item
    }

    /**
     * Process a changed event for an item.
     * @param {ItemStateChangedEvent} event - The event to process.
     */
    handleEvent(event) {
        const itemName = event.itemName;
        const item = items.getItem(itemName);

        const occupancyEvent = new ItemEventMetadata(item);
        console.debug(`Item ${itemName} in Location ${this.location.locationItem.name} changed. Event settings -->> ${occupancyEvent.getMetadataText()}`);

        if (occupancyEvent.hasEventData()) {
            if (!this.locationItemEventHandlers[itemName]) {
                const eventType = occupancyEvent.getEventType();

                if (eventToClass[eventType]) {
                    const handler = new eventToClass[eventType](item, this.location);
                    this.locationItemEventHandlers[itemName] = handler;
                } else {
                    console.warn(`Unknown occupancy event type ${eventType} for item ${itemName}`);
                    return;
                }
            }

            this.locationItemEventHandlers[itemName].processChangedEvent(event);
        } else {
            if (item.tags.includes("OccupancyTime") || item.tags.includes("OccupancyState") || item.tags.includes("OccupancyLock") || item.tags.includes("OccupancyControl")) {
                // Ignore these items
            } else {
                if (!this.noSettingsWarningLogged) {
                    console.debug(`No occupancy settings found for point item ${itemName}`);
                    this.noSettingsWarningLogged = true;
                }
            }
            return;
        }
    }
}

module.exports = {
    ItemEventHandler: ItemEventHandler
};

