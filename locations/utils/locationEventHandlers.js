// Description: This file contains the LocationEventHandlers class that handles and dispatches location events to the locaiton. We capture all events and hand them off versus creating seperate rules for every location

//const { GenericEventTrigger } = require ('./GenericEventTrigger.js');// no longer required as of OH 4.2.0
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
        console.log("Registering Location Event Handlers")
        // Capture add events to add new locations
        rules.JSRule({
            name: "Occupany Manager Item Added",
            triggers: [triggers.GenericEventTrigger("openhab/items/**","","ItemAddedEvent","OccupancyManagerItemAddedEvent")],
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
            triggers: [triggers.GenericEventTrigger("openhab/items/**","","ItemRemovedEvent","OccupancyManagerItemRemovedEvent")],
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
            triggers: [triggers.GenericEventTrigger("openhab/items/**","","ItemStateChangedEvent","OccupancyManagerItemStateEvent")],
            execute: (event) => {
                //console.log(`Item ${event.itemName} changed to ${event.itemState} from ${event.oldItemState}`);
                //if (event.oldItemState === null && event.itemState !== null) { // avoid events from persistence
                    console.debug(`Occupancy Item Event for Item ${event.itemName}`);

                    const item = items.getItem(event.itemName);

                    if (item.semantics.isPoint) {
                        const locationItem = LocationUtils.getLocationItemForItem(item);
                        if (locationItem) {
                            const location = this.locationManager.getLocation(locationItem.name);

                            if (location) {
                                location.itemEventHandler.handleEvent(event);
                            } else {
                                console.debug(`Item ${item.name} is not associated with a location.`);
                            }
                        } else {
                            console.debug(`Item ${item.name} does not have a location item.`);
                        }
                    }
                //}
            },
            tags: ["OccupancyManagerHandler"],
            id: "OccupancyManagerItemStateEvent"
        });
        
        // Captures commands to items, used for occupancy state and occupancy control items event processing
        rules.JSRule({
            name: "Occupancy Manager Item Command",
            triggers: [triggers.GenericEventTrigger("openhab/items/**", "", "ItemCommandEvent", "OccupancyManagerItemCommandEvent")],
            execute: (event) => {
                //console.warn("Item Command Event received:", event);

                const item = items.getItem(event.itemName);
                const locationItem = LocationUtils.getLocationItemForItem(item); 

                if (locationItem) {
                    //console.warn ('found location', locationItem.name)
                    const location = this.locationManager.getLocation(locationItem.name);
                    const command = event.payload.value
                    //console.warn ('command', command)

                    if (location) {
                        // check if the item is an occupancy state item
                        //console.warn ('found location', location)
                        if (item.tags.includes("OccupancyState")) {
                            console.log(`Location ${location.locationItem.name} received command from Occupancy State item ${command}`);
                    
                            if (command === 'ON') {
                                location.setLocationOccupied('Direct command from Occupancy State Item');
                            } else if (command === 'OFF') {
                                location.setLocationVacant('Direct command from Occupancy State Item');
                            } else {
                                console.warn(`Unknown occupancy state command ${command}`);
                            }
                            
                        } else if (item.tags.includes("OccupancyControl")) {
                            //console.warn(`Location ${location.locationItem.name} received command from Occupancy Control item ${command}`);

                            const parts = command.split(',');
                            //const command = parts[0];

                            switch (parts[0]) {
                                case 'LOCK':
                                    if (parts.length === 2) {
                                        location.locking.lock(parseInt(parts[1], 10));
                                    } else {
                                        location.locking.lock();
                                    }
                                    break;
                                
                                case 'UNLOCK':
                                    location.locking.unlock();
                                    break;

                                case 'CLEARLOCKS':
                                    location.locking.clearLock();
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
