/*global rules, items, things, Java*/

const ThingsAction = Java.type('org.openhab.core.model.script.actions.Things');

function isCurrentlyDaylight() {
    let sunActions = ThingsAction.getActions("astro","astro:sun:local");
    if (null === sunActions) {
        console.warn("sunActions not found, check thing ID");
        return false;
    } else {
        let now = java.time.ZonedDateTime.now();
        let sunriseTime = sunActions.getEventTime("SUN_RISE", now, "END");
        let sunsetTime = sunActions.getEventTime("SUN_SET", now, "START");
        console.log("Sunrise at: " + sunriseTime + ", Sunset at: " + sunsetTime);
        return now.isAfter(sunriseTime) && now.isBefore(sunsetTime);
    } 
}

function handleStartup() {
    let daylightState = isCurrentlyDaylight() ? "ON" : "OFF";
    console.log(`Startup: Setting DayLight_Switch to ${daylightState}`);
    items.getItem("DayLight_Switch").sendCommand(daylightState);
}

function handleSunrise() {
    console.log("Sunrise: Turning DayLight_Switch ON");
    items.getItem("DayLight_Switch").sendCommand("ON");
}

function handleSunset() {
    console.log("Sunset: Turning DayLight_Switch OFF");
    items.getItem("DayLight_Switch").sendCommand("OFF");
}

const initialize = () => {    // Check if the item exists
    // Check if the item exists
    if (items.getItem('DayLight_Switch', true) === null) {
        // Define the item configuration
        const itemConfig = {
            type: 'Switch',
            name: 'DayLight_Switch',
            label: 'DayLight [%s]',
            category: 'switch',
            tags: ['OccupancyManager'],
        };

        // Add the item
        items.addItem(itemConfig);

        console.log('OM DayLight_Switch has been created.');
    } else {
        console.log('OM DayLight_Switch exists.');
    }
    
    // Set up rules
    rules.when().channel("astro:sun:local:rise#event").triggered("END").then(handleSunrise).build("OM Daylight Rule on Sunrise");
    rules.when().channel("astro:sun:local:set#event").triggered("START").then(handleSunset).build("OM Daylight Rule on Sunset");

    handleStartup();
}

// Exporting the initialize function only
module.exports = initialize;
