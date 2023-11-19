//const { items } = require('openhab');

/**
 * Class to manage occupancy items for a location. These items are used to manage occupancy state and locking for a location and to view the occupancy state of the location.
 * @class
 */
class LocationOccupancyItems {
    constructor(locationItem) {
        this.locationItem = locationItem;

        const getItemOrCreate = (name, type, groups, tags, label) => {
            let item = items.getItem(name,true);
            if (!item) {
                console.log(`Adding ${name} item...`);
                item = items.addItem({
                    type,
                    name,
                    groups: [this.locationItem.name, ...groups],
                    tags: ['OccupancyManager'],
                    label: this.locationItem.name + label
                });
            }
            if (item.state === "NULL") { //?????
                // Handle "NULL" state if needed.
            }
            return item;
        };

        console.debug(`Creating items for ${this.locationItem.name}`)
        // Create supporting items for the location.
        // Occupancy State is ON for occupied, OFF for vacant.
        this.occupancyStateItem = getItemOrCreate(this.locationItem.name + "_Occupancy_State", 'Switch', [], ['OccupancyState', 'Switch'], " Occupied");
        this.locationOccupied = this.occupancyStateItem.state === 'ON'; //set occupancy state to true if the item is ON (happens via persistence)

        // Occupancy Control is used lock/unlock/clearlocks for the location. These events are propagated to child locations.
        this.occupancyControlItem = getItemOrCreate(this.locationItem.name + "_Occupancy_Control", 'String', [], ['OccupancyControl', 'Control'], " Occupancy Control");

        // Reflects the locking state of the location. ON for locked, OFF for unlocked.
        this.occupancyLockingItem = getItemOrCreate(this.locationItem.name + "_Occupancy_Lock", 'Switch', [], ['OccupancyLock', 'Switch'], " Occupancy Locking");

        // Reflects the time the location is occupied until.
        this.occupancyTimeItem = getItemOrCreate(this.locationItem.name + "_Occupancy_Time", 'String', [], ['OccupancyTime', 'Status'], " Occupied Until");
        console.debug(`Created items for ${this.locationItem.name}`)
    }

    /**
     * Removes supporting items for the location.
     */
    dispose() {
        const removeItemByName = (name) => {
            const item = items.getItem(name,true);
            if (item) {
                items.removeItem(item);
            }
        };

        removeItemByName(this.locationItem.name + "_Occupancy_State");
        removeItemByName(this.locationItem.name + "_Occupancy_Control");
        removeItemByName(this.locationItem.name + "_Occupancy_Lock");
        removeItemByName(this.locationItem.name + "_Occupancy_Time");
    }

}

module.exports = {
    LocationOccupancyItems: LocationOccupancyItems      
};
