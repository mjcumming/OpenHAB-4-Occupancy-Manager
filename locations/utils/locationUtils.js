/**
 * LocationUtils Module
 * 
 * This module provides utility functions to handle and manipulate locations in openHAB.
 * It offers functionalities like fetching all locations, getting parent and child locations,
 * finding the location of a non-location item, and printing a hierarchy tree of locations.
 */

class LocationUtils {

    /**
     * Get all location items.
     * @returns {Array} An array of location items.
     */
    static getAllLocations() {
        return items.getItems().filter(item => item.semantics.isLocation);
    }

    /**
     * Get the parent location of a given item.
     * @param {Object} item - The item for which the parent location is to be found.
     * @returns {Object|null} The parent location item or null if not found.
     */
    static getParentLocation(item) {
        for (const groupName of item.groupNames) {
            const group = items.getItem(groupName);
            if (group.semantics.isLocation) {
                return group;
            }
        }
        return null;
    }

    /**
     * Get child locations of a given location.
     * @param {Object} item - The location for which child locations are to be found.
     * @returns {Array} An array of child location items.
     */
    static getChildLocations(item) {
        return this.getAllLocations().filter(loc => loc.groupNames.includes(item.name));
    }

    /**
     * Retrieves the location for a given item.
     * @param {Object} item - The item for which the location is to be retrieved.
     * @returns {Object|null} - The location for the item or null if not found.
     */
    static getLocationItemForItem(item) {
        const locationItem = item.semantics.location;
        if (!locationItem) {
            return null;
        }

        return locationItem;
    }

    /**
     * Print a hierarchy tree of locations.
     * @param {Object|null} startLocation - The starting location for the tree. If null, the entire tree is printed.
     */
    static printLocationTree(startLocation = null) {
        const printTree = (location, indent = "") => {
            console.log(indent + location.label);
            const children = this.getChildLocations(location);
            for (const child of children) {
                printTree(child, indent + "  ");
            }
        };

        if (startLocation) {
            // Print tree starting from the specified location
            printTree(startLocation);
        } else {
            // Print the entire tree
            const rootLocations = this.getAllLocations().filter(location => !this.getParentLocation(location));
            for (const root of rootLocations) {
                printTree(root);
            }
        }
    }

    /**
     * Get all point items for a given location.
     * @param {Object} item - The location item.
     * @returns {Array} An array of point items for the location.
     */
    static getPointItems(item) {
        const items = [];

        const enumerateEquipmentItems = (item) => {
            item.members.forEach(member => {
                if (member.semantics && member.semantics.isPoint) {
                    items.push(member);
                } else if (member.semantics && member.semantics.isEquipment) {
                    member.members.forEach(equipmentMember => {
                        if (equipmentMember.semantics && equipmentMember.semantics.isPoint) {
                            items.push(equipmentMember);
                        }
                    });
                }
            });
        };

        enumerateEquipmentItems(item);

        return items;
    }
}

module.exports = {
    LocationUtils : LocationUtils
  };