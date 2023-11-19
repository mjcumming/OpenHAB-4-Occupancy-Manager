// Description: Represents an event that is triggered when any change occurs.
const { EventBase } = require('./eventBase.js');

/**
 * Represents an event that is triggered when any change occurs.
 * @extends EventBase
 */
class EventAnyChange extends EventBase {
    /**
     * Processes the changed event and begins the event.
     * @param {Object} event - The event object.
     */
    processChangedEvent(event) {
        super.processChangedEvent(event);
        this.beginEvent(event);
    }
}

module.exports = { 
    EventAnyChange: EventAnyChange
};
