// Use CommonJS require syntax
const { EventBase }= require('occupancymanager/locations/events/eventBase');

/**
 * Represents an event that triggers when an item turns on or off.
 * @extends EventBase
 */
class EventSwitch extends EventBase {
    /**
     * Processes the changed event and begins or ends the event based on the item state.
     * @param {ItemStateChangedEvent} event - The item state changed event.
     */
    processChangedEvent(event) {
        super.processChangedEvent(event);
        const itemState = this.item.state;
        let percent = 0;

        try {
            percent = parseFloat(itemState);
        } catch (error) {
            percent = 0;
        }

        if (itemState === "ON" || percent > 0) {
            this.beginEvent(event);
        } else if (itemState === "OFF" || percent === 0) {
            this.endEvent(event);
        } else {
            console.warn(`Unknown Switch event ${itemState} for item ${event.itemName}`);
        }
    }
}

// Use CommonJS export syntax
module.exports = {
    EventSwitch: EventSwitch
};

