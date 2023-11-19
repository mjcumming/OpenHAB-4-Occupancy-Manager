// Description: This file contains the LocationEventHandlers class that handles and dispatches location events to the locaiton. We capture all events and hand them off versus creating seperate rules for every location

const { GenericEventTrigger } = require ('./GenericEventTrigger.js');
const { LocationUtils } = require ('./locationUtils.js');



// create a new rule to handle location events and dispatch to the location versus creating seperate rules for every location

/**
 * Represents a class that handles and dispatches location events to the locaiton. We capture all events and hand them off versus creating seperate rules for every location
 *  * @class
 * @property {LocationManager} locationManager - The Location Manager instance.
 */
class LocationEventHandlers {
    /**
     * Create a Location Event Handler.
     * @constructor
     * @param {LocationManager} locationManager - The Location Manager instance.
     */
    constructor(locationManager) {
        this.locationManager = locationManager;

        //make sure old rules are removed
        rules.removeRule("OccupancyManagerItemAddedEvent");
        rules.removeRule("OccupancyManagerItemRemovedEvent");
        rules.removeRule("OccupancyManagerItemStateEvent");
        rules.removeRule("OccupancyManagerItemCommandEvent");

        this.registerEventHandlers();
    }

    /**
     * Register event handlers for location events.
     */
    registerEventHandlers() {      
        // Capture add events to add new locations
        rules.JSRule({
            name: "Occupany Manager Item Added",
            triggers: [GenericEventTrigger.getTrigger("openhab/items/**","","ItemAddedEvent","OccupancyManagerItemAddedEvent")],
            execute: (event) => {
                const item = items.getItem(event.payload.name);
                //console.warn(`Item ${item.name} added to the system.`);

                if (item.semantics.isLocation) {
                    const timeoutCallback = () => {
                        console.info(`Adding location ${item.name} to location manager.`);
                        this.locationManager.addLocation(item);
                    };

                    // we need this delayed because the item may not be fully initialized yet and the metadata may not be available
                    setTimeout(timeoutCallback, 2000);
                }
            },
            tags: ["OccupancyManagerHandler"],
            id: "OccupancyManagerItemAddedEvent"
        });

        // Capture remove events to remove locations
        rules.JSRule({
            name: "Occupancy Manager Item Removed",
            triggers: [GenericEventTrigger.getTrigger("openhab/items/**","","ItemRemovedEvent","OccupancyManagerItemRemovedEvent")],
            execute: (event) => {
                //console.log(`Item ${event.payload.name} removed from the system.`);
                // we get all item removed events here, the item is gone, we do not know if it was a location or not so we pass it on to the location manager and let it figure it out
                this.locationManager.removeLocation(event.payload.name);
            },
            tags: ["OccupancyManagerHandler"],
            id: "OccupancyManagerItemRemovedEvent"
        });

        // Capture item change events for occupancy events from points, or occupancy state change or locking change
        rules.JSRule({
            name: "Occupany Manager Item State Changed Event",
            triggers: [GenericEventTrigger.getTrigger("openhab/items/**","","ItemStateChangedEvent","OccupancyManagerItemStateEvent")],
            execute: (event) => {
                if (event.oldItemState === null) { // avoid events from persistence
                    return;
                }
                console.debug(`Occupancy Item Event for Item ${event.itemName}`);

                const item = items.getItem(event.itemName);
        
                if (item.semantics.isPoint) {
                    const locationItem = LocationUtils.getLocationItemForItem(item);
                    const location = this.locationManager.getLocation(locationItem.name);

                    if (location) {
                        location.itemEventHandler.handleEvent(event);
                    } else {
                        console.debug(`Item ${item.name} is not associated with a location.`);
                    }
                }
            },
            tags: ["OccupancyManagerHandler"],
            id: "OccupancyManagerItemStateEvent"
        });
        
        // Captures commands to items, used for occupancy state and occupancy control processing
        rules.JSRule({
            name: "Occupancy Manager Item Command",
            triggers: [GenericEventTrigger.getTrigger("openhab/items/**", "", "ItemCommandEvent", "OccupancyManagerItemCommandEvent")],
            execute: (event) => {
                const item = items.getItem(event.itemName);
                const locationItem = LocationUtils.getLocationItemForItem(item); 

                if (locationItem) {
                    const location = this.locationManager.getLocation(locationItem.name);

                    if (location) {
                        // check if the item is an occupancy state item
                        if (item.tags.includes("OccupancyState")) {
                            console.log(`Location ${location.locationItem.name} received command from Occupancy State item ${event.itemCommand}`);
                    
                            if (event.itemCommand === 'ON') {
                                location.setLocationOccupied('Direct command from Occupancy State Item');
                            } else if (event.itemCommand === 'OFF') {
                                location.setLocationVacant('Direct command from Occupancy State Item');
                            } else {
                                console.warn(`Unknown occupancy state command ${event.itemCommand}`);
                            }
                            
                        } else if (item.tags.includes("OccupancyLocking")) {
                            console.log(`Location ${location.locationItem.name} received command from Occupancy Control item ${event.type}`);

                            const parts = event.itemCommand.split(',');
                            const command = parts[0];

                            switch (command) {
                                case 'LOCK':
                                    if (parts.length === 2) {
                                        this.location.locationLock.lock(parseInt(parts[1], 10));
                                    } else {
                                        this.location.locationLock.lock();
                                    }
                                    break;
                                
                                case 'UNLOCK':
                                    this.location.locationLock.unlock();
                                    break;

                                case 'CLEARLOCKS':
                                    this.location.locationLock.clearLock();
                                    break;

                                default:
                                    console.warn(`Unknown occupancy control command ${command}`);
                            }
                        }
                    }
                }
            },
            tags: ["OccupancyManagerHandler"],
            id: "OccupancyManagerItemCommandEvent"
        });
    }

    /**
     * Cleanup method to release resources and deregister event handlers.
     */
    dispose() {
        rules.removeRule("OccupancyManagerItemAddedEvent");
        rules.removeRule("OccupancyManagerItemRemovedEvent");
        rules.removeRule("OccupancyManagerItemStateEvent");
        rules.removeRule("OccupancyManagerItemCommandEvent");
    }
}

module.exports = {
     LocationEventHandlers: LocationEventHandlers
};
