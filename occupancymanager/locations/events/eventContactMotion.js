
const { EventBase } = require('./eventBase.js');

/**
 * Represents an event that is triggered when a contact/motion sensor changes state.
 * @extends EventBase
 */
class EventContactMotion extends EventBase {
    /**
     * Processes the changed event and begins or ends the event based on the item state.
     * @param {ItemStateChangedEvent} event - The event that was triggered.
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
}

module.exports = {
    EventContactMotion: EventContactMotion
};
