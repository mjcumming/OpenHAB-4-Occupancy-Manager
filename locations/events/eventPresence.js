
const { EventBase } = require('occupancymanager/locations/events/eventBase.js');

/**
 * Represents an event for contact presence.
 * @extends EventBase
 */
class EventContactPresence extends EventBase {
    /**
     * Processes the changed event.
     * @param {Event} event - The event to process.
     */
    processChangedEvent(event) {
        super.processChangedEvent(event);
        const itemState = this.item.state;

        if (itemState === "OPEN") {
            this.beginEvent(event);
        } else if (itemState === "CLOSED") {
            this.endEvent(event);
        } else {
            console.warn(`Unknown event ${itemState} for item ${event.itemName}`);       
        }
    }

    /**
     * Begins the event.
     * @param {Event} event - The event to begin.
     */
    beginEvent(event) {
        super.beginEvent(event);
        console.log(`Location ${this.location.name} locked, until event ends`);
        this.location.lock();
    }

    /**
     * Ends the event.
     * @param {Event} event - The event to end.
     */
    endEvent(event) {
        super.endEvent(event);
        this.location.unlock();
        console.log(`Location ${this.location.name} unlocked and set to vacant, presence event ended`);
    }
}

module.exports = {
    EventContactPresence: EventContactPresence
};
