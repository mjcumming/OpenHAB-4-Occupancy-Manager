//No longer required as of OH 4.2.0

// Import necessary modules from openHAB's JS Scripting binding
const ModuleBuilder = Java.type('org.openhab.core.automation.util.ModuleBuilder');
const Configuration = Java.type('org.openhab.core.config.core.Configuration');

/**
 * GenericEventTrigger class provides utility methods to create triggers for openHAB events.
 * This class is structured as a static class, meaning you don't need to instantiate it to use its methods.
 */
class GenericEventTrigger {
    constructor() {}

    /**
     * Creates a trigger based on the provided parameters.
     * This is a private method used internally by the getTrigger method.
     * 
     * @param {string} typeString - The type of trigger to create.
     * @param {string} name - The name of the trigger.
     * @param {object} config - The trigger configuration.
     * @returns {HostTrigger} - Returns a HostTrigger object.
     */
    static createTrigger(typeString, name, config) {
        if (typeof name === 'undefined' || name === null) {
            name = utils.randomUUID().toString();
        }

        console.log(`Creating ${typeString} trigger as ${name} with config: ${JSON.stringify(config || {})}`);

        return ModuleBuilder.createTrigger()
            .withId(name)
            .withTypeUID(typeString)
            .withConfiguration(new Configuration(config))
            .build();
    }

    /**
     * Public method to get a trigger based on the provided parameters.
     * 
     * @param {string} event_topic - The event topic.
     * @param {string} event_source - The event source.
     * @param {string} event_types - The event types.
     * @param {string} triggerName - The name of the trigger.
     * @returns {HostTrigger} - Returns a HostTrigger object.
     */
    static getTrigger(event_topic, event_source, event_types, triggerName) {
        return this.createTrigger('core.GenericEventTrigger', triggerName, {
            topic: event_topic,
            source: event_source,
            types: event_types,
            payload: ""
        });
    }
}


module.exports = {
    GenericEventTrigger: GenericEventTrigger
  };
