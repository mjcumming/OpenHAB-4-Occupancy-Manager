/**
 * ItemEventMetadata: Gets settings for an items event.
 * 
 * ModifyBehavior - overrides default settings:
 * - OnlyIfLocationVacant: Generates an occupancy event only if the location is currently vacant.
 * - OverrideTimesIfVacant: Overrides the default times of the location only if the location is currently vacant.
 * - OccupiedUntilEnded: Keeps the state of the location occupied until a closed event occurs (e.g., a door contact stays open).
 * 
 * Occupancy events can override the occupancy times specified in the location:
 * - BeginOccupancyTime: Set when the event begins.
 * - EndOccupancyTime: Set when the event ends.
 * 
 * Begin events are typically On events that set/update the state of a location to Occupied.
 * End events are typically Off events or may be used to set a location to unoccupied to lower the time until a location becomes vacant.
 */

class ItemEventMetadata {
    /**
     * Constructs the EventMetadata object.
     * @param {string} item - The OpenHAB item.
     * @param {boolean} addMetadataPlaceholder - Whether to add a placeholder metadata object if none exists.
     */
    constructor(item, addMetadataPlaceholder = false) {
        this.item = item
        this.namespace = "OccupancyEvent";
        this.addMetadataPlaceholder = addMetadataPlaceholder;
        this.validateMetadata();
        console.debug(`Event settings for item '${this.item.name}': ${this.getMetadataText()}`);
    }

    /**
     * Retrieves the metadata for the provided namespace.
     * @returns {object} - The metadata object.
     */
    getMetadata() {
        return this.item.getMetadata(this.namespace);
    }
    
    hasEventData() {
        const metadata = this.getMetadata();
        return metadata !== null;
    }

    getEventType() {    
        const metadata = this.getMetadata();
        return metadata?.value;
    }

    /**
     * Retrieves the behaviors set in the metadata.
     * @returns {string[]} - An array of behaviors.
     */
    getBehaviors() {
        const metadata = this.getMetadata();
        const modifyBehavior = metadata?.configuration?.['ModifyBehavior'];
        return modifyBehavior ? modifyBehavior.split(',') : [];
    }

    onlyIfVacant() {
        return this.getBehaviors().includes("OnlyIfLocationVacant");
    }

    overrideTimesIfVacant() {
        return this.getBehaviors().includes("OverrideTimesIfVacant");
    }

    occupiedUntilEnded() {
        return this.getBehaviors().includes("OccupiedUntilEnded");
    }

    overrideLock() {
        return this.getBehaviors().includes("OverrideLock");
    }

    getBeginOccupiedTime() {
        const metadata = this.getMetadata();
        if (metadata && metadata.configuration && metadata.configuration['BeginOccupiedTime']) {
            return parseInt(metadata.configuration['BeginOccupiedTime'], 10);
        }
        return null;
    }

    getEndOccupiedTime() {
        const metadata = this.getMetadata();
        if (metadata && metadata.configuration && metadata.configuration['EndOccupiedTime']) {
            return parseInt(metadata.configuration['EndOccupiedTime'], 10);
        }
        return null;
    }
    
    /**
     * Validates the metadata configurations.
     */
    validateMetadata() {
        const metadata = this.getMetadata();

        if (!metadata) {
            if (this.addMetadataPlaceholder) {
                // Add a placeholder metadata object
                console.log(`Adding placeholder metadata for item: ${this.itemName}`);
                this.item.replaceMetadata(this.namespace, '', {});
            }
        }   

        if (typeof this.getEventType() === 'undefined' || this.getEventType() === '') {
            // ignore empty event types that occur when the item is first created using default metadata
            return;
        }

        if (!this.validateOccupancyEventValue(this.getEventType())) {
            console.warn(`WARNING: Invalid OccupancyEvent value'${this.getEventType()}' for item: ${this.item.name}`);
        }
        
        if (metadata && metadata.configuration) {
            // List of expected keys and their respective validation functions
            const validators = {
                'ModifyBehavior': this.validateModifyBehavior,
                'BeginOccupiedTime': this.validateIntegerValue,
                'EndOccupiedTime': this.validateIntegerValue,
                // Add other keys and their validators as needed
            };

            // Check for unexpected keys in the metadata
            for (const key in metadata.configuration) {
                if (!validators[key]) {
                    console.warn(`WARNING: Unexpected key '${key}' found in metadata for item: ${this.item.name}`);
                } else {
                    validators[key].call(this, metadata.configuration[key]);
                }
            }
        }
    }

    validateModifyBehavior(value) {
        const allowedBehaviors = ["OnlyIfLocationVacant", "OverrideTimesIfVacant", "OccupiedUntilEnded", "OverrideLock"];
        const behaviors = value.split(',');
        return behaviors.every(behavior => allowedBehaviors.includes(behavior));
    }

    validateIntegerValue(value) {
        return !isNaN(value) && parseInt(value, 10) === Number(value);
    }

    validateOccupancyEventValue(value) {
        const allowedValues = ["OnOff", "Contact", "Presence", "AnyChange"];
        return allowedValues.includes(value);
    }

    /**
     * Creates a text string containing the event metadata settings.
     * @returns {string} - The event metadata settings as a text string.
     */
    getMetadataText() {
        let metadataText = `Event settings for item '${this.item.name}': `;

        if (this.getEventType()) {
            metadataText += `Occupancy event: ${this.getEventType()} `;
        }        
        
        metadataText += `Behaviors: ${this.getBehaviors().join(', ')} `;

        if (this.getBeginOccupiedTime()) {
            metadataText += `Begin occupancy time: ${this.getBeginOccupiedTime()} `;
        }

        if (this.getEndOccupiedTime()) {
            metadataText += `End occupancy time: ${this.getEndOccupiedTime()} `;
        }

        if (this.overrideLock()) {
            metadataText += `Override lock: ${this.overrideLock()} `;
        }

        if (this.overrideTimesIfVacant()) {
            metadataText += `Override times if vacant: ${this.overrideTimesIfVacant()} `;
        }

        if (this.onlyIfVacant()) {
            metadataText += `Only if vacant: ${this.onlyIfVacant()} `;
        }

        if (this.occupiedUntilEnded()) {
            metadataText += `Occupied until ended: ${this.occupiedUntilEnded()} `;
        }

        return metadataText;
    }

}
 

// Export the EventMetadata class for use in other files
module.exports = {
    ItemEventMetadata: ItemEventMetadata
};