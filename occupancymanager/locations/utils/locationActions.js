const { LocationUtils } = require ('./locationUtils.js'); 

class LocationActions {
    constructor(location) {
        this.location = location;
    }

    /**
     * Executes actions for the occupied state.
     * The actions are determined by the occupancy settings and are executed based on the provided map.
     *
     */
    executeOccupiedActions() {
        const actions = this.location.occupancySettings.getOccupiedActions()
        const pointItems = LocationUtils.getPointItems(this.location.locationItem);
        
        console.log(`Location ${this.location.locationItem.name} is occupied, executing actions ${actions}`);

        actions.forEach(action => {
            switch (action) {
                case "LightsOn":
                    pointItems.forEach(item => {
                        if (item.tags.includes("Light")) {
                            item.sendCommand('ON');
                        }
                    });
                    break;
                case "LightsOnIfDark":
                    if (this.location.getItem("DayLight_Switch").state === 'OFF') {
                        pointItems.forEach(item => {
                            if (item.tags.includes("Light")) {
                                item.sendCommand('ON');
                            }
                        });
                    }
                    break;
                case "SceneOn":
                    pointItems.forEach(item => {
                        if (item.tags.includes("Scene")) {
                            item.sendCommand('ON');
                        }
                    });
                    break;
                case "SceneOnIfDark":
                    if (this.location.getItem("DayLight_Switch").state === 'OFF') {
                        pointItems.forEach(item => {
                            if (item.tags.includes("Scene")) {
                                item.sendCommand('ON');
                            }
                        });
                    }
                    break;
                case "AVOn":
                    pointItems.forEach(item => {
                        if (item.tags.includes("AVPower")) {
                            item.sendCommand('ON');
                        }
                    });
                    break;
                case "ExhaustFansOn":
                    pointItems.forEach(item => {
                        if (item.tags.includes("ExhaustFan")) {
                            item.sendCommand('ON');
                        }
                    });
                    break;
                default:
                    console.warn(`Unknown action ${action} in location ${this.locationItem.name}`);
            }
        });
    }
 
    executeVacantActions() {
        const actions = this.location.occupancySettings.getVacantActions()
        const pointItems = LocationUtils.getPointItems(this.location.locationItem);

        console.log(`Location ${this.location.locationItem.name} is vacant, executing actions ${actions}`);

        actions.forEach(action => {
            switch (action) {
                case "LightsOff":
                    for (const item of pointItems) {
                        if (item.tags.includes("Light")) {
                            item.sendCommand('OFF');
                        }
                    }
                    break;
                case "SceneOff":
                    for (const item of pointItems) {
                        if (item.tags.includes("Scene")) {
                            item.sendCommand('OFF');
                        }
                    }
                    break;
                case "AVOff":
                    for (const item of pointItems) {
                        if (item.tags.includes("AVPower")) {
                            item.sendCommand('OFF');
                        }
                    }
                    break;
                case "ExhaustFansOff":
                    for (const item of pointItems) {
                        if (item.tags.includes("ExhaustFan")) {
                            item.sendCommand('OFF');
                        }
                    }
                    break;
                default:
                    console.warn(`Unknown action ${action} in location ${this.locationItem.name}`);
            }
        });
    }
}

module.exports = {
    LocationActions: LocationActions
};
