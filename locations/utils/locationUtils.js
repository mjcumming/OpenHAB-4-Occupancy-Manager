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
     * Gets all point items in a location
     * @param {Item} item - The location item to search
     * @returns {Array} Array of point items
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

    /**
     * Gets all lighting point items in a location
     * @param {Item} locationItem - The location item to search
     * @returns {Array} Array of lighting control point items
     */
    static getLightingItems(locationItem) {
        const items = [];

        const processEquipment = (equipment) => {
            // Check if this is a lighting equipment
            if (equipment.tags.includes("Light")) {
                equipment.members.forEach(member => {
                    // Get points that are tagged for lighting control
                    if (member.semantics && member.semantics.isPoint && 
                        ((member.tags.includes("Control") && member.tags.includes("Light")) ||
                         (member.tags.includes("Switch") && member.tags.includes("Light")) ||
                         (member.tags.includes("Control") && member.tags.includes("ColorTemperature")))) {
                        items.push(member);
                    }
                });
            }
        };

        // Iterate through location members
        locationItem.members.forEach(member => {
            if (member.semantics && member.semantics.isEquipment) {
                processEquipment(member);
            } else if (member.semantics && member.semantics.isLocation) {
                // Handle nested locations (e.g., Master Suite containing Master Bedroom)
                member.members.forEach(submember => {
                    if (submember.semantics && submember.semantics.isEquipment) {
                        processEquipment(submember);
                    }
                });
            }
        });

        return items;
    }

    /**
     * Checks if an item is a lighting control point
     * @param {Item} item - The item to check
     * @returns {boolean} True if item is a lighting control point
     */
    static isLightingItem(item) {
        return item.semantics && 
               item.semantics.isPoint && 
               ((item.tags.includes("Control") && item.tags.includes("Light")) ||
                (item.tags.includes("Switch") && item.tags.includes("Light")) ||
                (item.tags.includes("Control") && item.tags.includes("ColorTemperature")));
    }

    /**
     * Gets all point items with a specific tag in a location
     * @param {Item} locationItem - The location item to search
     * @param {string} tag - The tag to search for
     * @returns {Array} Array of matching point items
     */
    static getItemsByTag(locationItem, tag) {
        const items = [];

        const processEquipment = (equipment) => {
            equipment.members.forEach(member => {
                if (member.semantics && member.semantics.isPoint && member.tags.includes(tag)) {
                    items.push(member);
                }
            });
        };

        // Iterate through location members
        locationItem.members.forEach(member => {
            if (member.semantics && member.semantics.isEquipment) {
                processEquipment(member);
            } else if (member.semantics && member.semantics.isLocation) {
                // Handle nested locations
                member.members.forEach(submember => {
                    if (submember.semantics && submember.semantics.isEquipment) {
                        processEquipment(submember);
                    }
                });
            }
        });

        return items;
    }

    /**
     * Gets all exhaust fan items in a location
     * @param {Item} locationItem - The location item to search
     * @returns {Array} Array of exhaust fan control points
     */
    static getExhaustFanItems(locationItem) {
        const items = [];

        const processEquipment = (equipment) => {
            // Check if this is a fan equipment
            if (equipment.tags.includes("Fan")) {
                equipment.members.forEach(member => {
                    // Get points that are tagged for power control
                    if (member.semantics && member.semantics.isPoint && 
                        member.tags.includes("Switch") && member.tags.includes("Power")) {
                        items.push(member);
                    }
                });
            }
        };

        // Only process direct members of the location
        locationItem.members.forEach(member => {
            if (member.semantics && member.semantics.isEquipment) {
                processEquipment(member);
            }
        });

        return items;
    }

    /**
     * Gets all AV equipment items in a location based on type
     * @param {Item} locationItem - The location item to search
     * @param {string} equipmentType - The type of AV equipment ("Receiver", "Speaker", "Screen", "Player")
     * @returns {Array} Array of matching control points
     */
    static getAVItems(locationItem, equipmentType) {
        const items = [];

        const processEquipment = (equipment) => {
            // Check if this is the requested AV equipment type
            if (equipment.tags.includes(equipmentType)) {
                equipment.members.forEach(member => {
                    if (member.semantics && member.semantics.isPoint) {
                        // Handle different types of control points
                        if ((member.tags.includes("Switch") && member.tags.includes("Power")) ||
                            (member.tags.includes("Control") && member.tags.includes("Volume")) ||
                            (member.tags.includes("Switch") && member.tags.includes("Mute")) ||
                            (member.tags.includes("Control") && member.tags.includes("Media"))) {
                            items.push(member);
                        }
                    }
                });
            }
        };

        // Only process direct members of the location
        locationItem.members.forEach(member => {
            if (member.semantics && member.semantics.isEquipment) {
                processEquipment(member);
            }
        });

        return items;
    }
}

module.exports = {
    LocationUtils: LocationUtils
};