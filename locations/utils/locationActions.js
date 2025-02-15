const { LocationUtils } = require('./locationUtils.js'); 

class LocationActions {
    constructor(location) {
        this.location = location;
    }

    /**
     * Executes actions for the occupied state.
     */
    executeOccupiedActions() {
        const actions = this.location.occupancySettings.getOccupiedActions()
        
        console.log(`Location ${this.location.locationItem.name} is occupied, executing actions ${actions}`);

        actions.forEach(action => {
            switch (action) {
                case "LightsOn":
                    const lightItems = LocationUtils.getLightingItems(this.location.locationItem);
                    lightItems.forEach(item => {
                        item.sendCommand('ON');
                    });
                    break;

                case "LightsOnIfDark":
                    if (items.getItem("DayLight_Switch").state === 'OFF') {
                        const lightItems = LocationUtils.getLightingItems(this.location.locationItem);
                        lightItems.forEach(item => {
                            item.sendCommand('ON');
                        });
                    }
                    break;

                case "SceneOn":
                    const sceneItems = LocationUtils.getItemsByTag(this.location.locationItem, "Scene");
                    sceneItems.forEach(item => {
                        item.sendCommand('ON');
                    });
                    break;

                case "SceneOnIfDark":
                    if (items.getItem("DayLight_Switch").state === 'OFF') {
                        const sceneItems = LocationUtils.getItemsByTag(this.location.locationItem, "Scene");
                        sceneItems.forEach(item => {
                            item.sendCommand('ON');
                        });
                    }
                    break;

                case "AVOn":
                    // Turn on Receivers
                    const receiverItems = LocationUtils.getAVItems(this.location.locationItem, "Receiver");
                    receiverItems.forEach(item => {
                        if (item.tags.includes("Power")) {
                            item.sendCommand('ON');
                        }
                    });
                    
                    // Turn on Speakers
                    const speakerItems = LocationUtils.getAVItems(this.location.locationItem, "Speaker");
                    speakerItems.forEach(item => {
                        if (item.tags.includes("Power")) {
                            item.sendCommand('ON');
                        }
                    });
                    break;

                case "ExhaustFansOn":
                    const exhaustFanItems = LocationUtils.getExhaustFanItems(this.location.locationItem);
                    exhaustFanItems.forEach(item => {
                        item.sendCommand('ON');
                    });
                    break;

                default:
                    console.warn(`Unknown action ${action} in location ${this.location.locationItem.name}`);
            }
        });
    }
 
    executeVacantActions() {
        const actions = this.location.occupancySettings.getVacantActions()

        console.log(`Location ${this.location.locationItem.name} is vacant, executing actions ${actions}`);

        actions.forEach(action => {
            switch (action) {
                case "LightsOff":
                    const lightItems = LocationUtils.getLightingItems(this.location.locationItem);
                    lightItems.forEach(item => {
                        item.sendCommand('OFF');
                    });
                    break;

                case "SceneOff":
                    const sceneItems = LocationUtils.getItemsByTag(this.location.locationItem, "Scene");
                    sceneItems.forEach(item => {
                        item.sendCommand('OFF');
                    });
                    break;

                case "AVOff":
                    // Turn off Receivers
                    const receiverItems = LocationUtils.getAVItems(this.location.locationItem, "Receiver");
                    receiverItems.forEach(item => {
                        if (item.tags.includes("Power")) {
                            item.sendCommand('OFF');
                        }
                    });
                    
                    // Turn off Speakers
                    const speakerItems = LocationUtils.getAVItems(this.location.locationItem, "Speaker");
                    speakerItems.forEach(item => {
                        if (item.tags.includes("Power")) {
                            item.sendCommand('OFF');
                        }
                    });
                    break;

                case "ExhaustFansOff":
                    const exhaustFanItems = LocationUtils.getExhaustFanItems(this.location.locationItem);
                    exhaustFanItems.forEach(item => {
                        item.sendCommand('OFF');
                    });
                    break;

                default:
                    console.warn(`Unknown action ${action} in location ${this.location.locationItem.name}`);
            }
        });
    }
}

module.exports = {
    LocationActions: LocationActions
};
