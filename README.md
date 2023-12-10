
# Occupancy Manager for OpenHAB 4

## Introduction

Welcome to the Occupancy Manager module, a location-based occupancy management and automation tool for OpenHAB based on the semantic model.

## Purpose

In the realm of home automation, determining whether a specific location within the home is occupied is frquently required to automate various tasks. The Occupancy Manager module for OpenHAB 4 simplifies this by leveraging OpenHAB's semantic model, offering a refined system for managing locations and tracking their occupancy. The Occupancy Manager utilizies any type of events in a location to determine occupancy. For example, turning on a light or changing the volume of a speaker are all events that can be used to determine that a location is occupied. The second (optional) feature of the Occupancy Manager is the ability to turn on or off various devices in a location based on the occupancy status. These featurea are represented in the two core components:

- **Occupancy Status Determination**: Using events from existing devices (like light switches, AV systems, and motion sensors) to dynamically track the occupancy status of locations, eliminating the need for dedicated presence sensors in every location.  
- **Optional Event-Driven Automation**: If desired, the module can automate tasks based on the occupancy state, such as adjusting lighting, HVAC systems, and media devices to enhance comfort and energy efficiency.

## Key Features

- **Semantic Location Management**: Uses the semantic model to determine locations to monitor occupancy.
- **Dynamic Occupancy Tracking**: Determines the occupancy status of locations using events from existing devices in that location. 
- **Automated and Manual Control**: Offers both automated actions based on occupancy states and users' ability to control actions using generated items in each location manually in rules. This allows users to choose between automated tasks or custom rule-based automation.
- **Hierarchical Location Structure**: Supports event propagation across different locations, from individual locations to the entire home.  
- **Ease of Use**: Encapsulates all necessary logic within the module, shifting the focus from coding to configuring, making occupancy management easy.

## Real-life Examples

### Arriving Home
When you arrive home and open the door, the system detects this and sets the main floor as occupied, automatically turning on the main floor lights.

### Leaving Home
When you leave your home with the lights and TV on, the system turns them off after detecting no occupancy events for a set time, all without needing to write specific rules.

## System Requirements

- JavaScript (ECMAScript 2022+) binding must be enabled in OpenHAB.

## Installation

Installing the Occupancy Manager module is a quick process. Follow these instructions to get started:

1. Navigate to the OpenHAB Automation Directory:  
    Access the `automation/js` directory within your OpenHAB configuration directory. This is where the module will be installed.

2. Install the Module:  
    Once in the `automation/js` directory, run the following command to install the Occupancy Manager module:

    ```bash
    npm install occupancymanager
    ```

    This command installs the Occupancy Manager module and its dependencies into your OpenHAB system.

## Starting the Occupancy Manager
    
    ```
    const start = require('occupancymanager');

    start( { createLocationMetadata: true, createPointItemMetadata: true } );
    ```

## Configuration of the Occupancy Manager Module  

This section guides you through defining locations, setting up item metadata, and configuring items for occupancy detection.

### Basic Configuration Overview

Configuration involves defining locations using the semantic model, setting up location-specific metadata, and configuring items (like switches or sensors) influencing occupancy status. Accurate configuration ensures the module reflects the occupancy status and integrates seamlessly with your home automation system.

The module has two options that will automatically generate the metadata namespace for location items, and metadata for point items (switches, dimmers, contacts). Enabling the automatical creating of the namespace will make configuration easier.

#### Defining Locations

Locations in OpenHAB 4 are set using semantic modeling. Each location represents a distinct space within your home, such as a bathroom, bedroom, or kitchen. Ideally Locations are defined in a hierarchial fashion.

**Steps to Define a Location:**

1. Choose a Location Type: For example, a bathroom.
2. Create a Group Item: Represent locations as group items in OpenHAB. 
3. Assign Semantic Tags: Use appropriate semantic tags for the location.

**Example:**

```text
Group gBathroom "Bathroom" <icon> (gFirstFloor) ["Bathroom"]  
```

Here, `gBathroom` is a group item representing the bathroom, tagged as Bathroom, and is part of the `gFirstFloor` group.

#### Setting Up Location Metadata  

Metadata for each location controls its occupancy behavior.  

**Key Metadata Settings:**

- `Time`: Duration (in minutes) a location remains 'occupied' after an event from a point item in that location.
- `VacantActions`: Actions triggered when a location becomes vacant. 
- `OccupiedActions`: Actions triggered when a location becomes occupied.

**Example:**

```text
Group gBathroom "Bathroom" <icon> (gFirstFloor) ["Bathroom"] { 
    OccupancySettings = "" 
    [Time = 15, 
     VacantActions = "LightsOff, ExhaustFansOff",  
     OccupiedActions = "LightsOn"] 
}
```

In this example, the bathroom's occupancy time is 15 minutes when an item in that location generates an event. If there is a motion sensor in the bathroom that is configured to generate an occupancy event:

```text  
Contact Bathroom_Motion_Sensor "Bathroom Motion" (gBathroom) ["Motion"] { 
    OccupancyEvent = "Contact" 
}
```
When the motion sensor is triggered, the bathroom will become occupied. The lights will automatically turn on. Any further motion events will reset the occupancy timer for another 15 minutes. After 15 minutes of no events, the location will be vacant, and the lights and exhaust fans will be turned off.

#### Configuring Occupancy Items  

Items like light switches or motion sensors are grouped in location, and events from these items are used to determine occupancy.

**Steps to Configure an Occupancy Item:**

1. Assign the Item to a Location: Include the item in the location's group.
2. Set Occupancy Event Metadata: Define how item state changes affect occupancy.

**Example:**

```text  
Switch LightSwitch_Bathroom "Bathroom Light" (gBathroom) ["Lighting"] { 
    OccupancyEvent = "Switch" 
}
```

The bathroom light switch here influences the occupancy status of the bathroom. It will generate an occupancy event when the switch is turned on.

### Advanced Location Hierarchy and Event Propagation  

In sophisticated home automation setups, locations can be arranged in a hierarchical structure. This allows for nuanced control and event propagation across multiple levels.

#### Setting Up Hierarchical Locations:  

1. Define Parent and Child Locations: Create a structure where locations like rooms (child) are part of a larger area like a floor (parent).
2. Nest Groups Appropriately: Ensure child location groups are nested within parent location groups in OpenHAB. 

**Example:**

```text
Group gFirstFloor "First Floor" <icon> ["FirstFloor"]  
Group gBathroom "Bathroom" <icon> (gFirstFloor) ["Bathroom"]
```

In this setup, the bathroom is a part of the first floor, and events in the bathroom propagate to the first floor level. So an event in the bathroom that sets the bathroom to occupied is also propatgated to the First Floor reseting its occupancy timer. Only events that set a location to occupied  or that update that locations occupancy timer, are used to reset the parent location occpuancy timer. A vacancy event in a location does not change the occpuancy status of a parent location.

**Example event propagation: TV Volume is changed, and the Family Room, Main Floor, and Home Occupancy times are all updated**

```
[INFO ] [openhab.event.ItemStateChangedEvent ] - Item 'FamilyRoom_SonyTV_Volume' changed from 18 to 28
[INFO ] [openhab.event.ItemStateChangedEvent ] - Item 'gLocMainFloorFamilyRoom_Occupancy_Time' changed from Tue Dec 05 2023 20:42:31 GMT-0600 (CST) to Tue Dec 05 2023 20:49:03 GMT-0600 (CST)
[INFO ] [openhab.event.ItemStateChangedEvent ] - Item 'gLocMainFloor_Occupancy_Time' changed from Tue Dec 05 2023 21:42:31 GMT-0600 (CST) to Tue Dec 05 2023 21:49:03 GMT-0600 (CST)
[INFO ] [openhab.event.ItemStateChangedEvent ] - Item 'gLocHome_Occupancy_Time' changed from Tue Dec 05 2023 20:48:46 GMT-0600 (CST) to Tue Dec 05 2023 20:49:03 GMT-0600 (CST)
```

### Custom Automation and Extended Functionality  

The Occupancy Manager module allows for custom automation based on occupancy states without the need to write rules.

#### Creating Automation from Occupancy Status:  

The module allows for basic automation of items based on occupancystatus without the need to write rules. More complex automations require using the Occupancy Item for that location to write more complex rules

### Example Configuration Scenarios  

To help you better understand how to apply these configurations, here are some practical scenarios:

#### Bathroom Occupancy:

The module can be configured to turn on the bathroom lights at night when motion is detected.

The location is configured as follows:

```text
Group gBathroom "Bathroom" <icon> (gFirstFloor) ["Bathroom"] { OccupancySettings = "" 
    [Time = 15,  
     OccupiedActions = "LightsOnIfDark"
     VacantActions = "LightsOff, ExhaustFansOff"]  
}
```
The motion sensor is configured as follows:

```text
Contact Bathroom_MotionSensor "Bathroom Room Motion" <motion>	(gEquip_Bathroom_Sensors) {OccupancyEvent = "Contact"}	
```

The motion item is configured to gennerate an Occupancy Event "Contact" which is one the predefined events that items can generate (details below).

The light is configured as follows:

```
Dimmer Bathroom_Dimmmer "Bathroom Lights" <light>    (gEquip_Bathroom_Lights) ["Light"]  {OccupancyEvent = "Switch"}

```
Note that light item has also been tagged with "Light". Tagging items to be controlled by the Occupancy Manager using occupancy events is required. Using the Semantic Model for identifing point items to control is too limited. 

```
Switch BathroomExhaustFan_Switch "Bathroom Fan"  <fan> (gEquip_Bathroom_ExhaustFan)  ["ExhaustFan"]  {OccupancyEvent = "Switch"}
```
The exhaust fan has been tagged "ExhaustFan"

// The gEquip_* groups here represent equipment groupings defined as part of the semantic model. They are optional and not strictly required for the Occupancy Manager to function. Items could be associated directly with the gBathroom group.

With this configuration, when the motion sensor detects motion, the bathhroom light is automatically turned on and the bathroom is set to occupied for 15 minutes. If the motion sensor is triggered again, the timer will be reset to 15 minutes. On the way out of the bathroom, if the exhaust fan is turned on, this will also generate an occpuancy event and reset the timer to 15 minutes. After 15 minutes of no events, the bathroom lights and fan will be turned off. 

Metadata configuration for the bathroom would look like this:  

This section provides an outline for setting up the Occupancy Manager module, including advanced hierarchical structures and custom automation scenarios.

## Detailed Configuration: Locations  

### Understanding Location Metadata  

Location metadata in the Occupancy Manager module is crucial for defining how each location behaves in terms of occupancy. This metadata includes settings for occupancy duration, and actions to take when a location becomes occupied or vacant.  

**Key Metadata Components:**

- `Time`: The duration (in minutes) for which a location is considered occupied after an event.
- `VacantActions`: A list of actions the module should execute when the location becomes vacant. Examples include `LightsOff`, `ExhaustFansOff`.
- `OccupiedActions`: A list of actions the module should execute when the location becomes occupied. Examples include `LightsOn`, `SceneOn`.  

**Metadata Configuration Example for a Location:**

```text
Group gBathroom "Bathroom" <icon> (gFirstFloor) ["Bathroom"] { 
    OccupancySettings = "" 
    [Time = 15,  
     VacantActions = "LightsOff, ExhaustFansOff",  
     OccupiedActions = "LightsOn"]
}
```

In this example, the bathroom:  

- Remains occupied for 15 minutes after an event.  
- Turns off lights and exhaust fans when it becomes vacant.
- Turns on lights when it becomes occupied.

### Detailed Configuration: Items  

#### Understanding Item Metadata for Occupancy  

Item metadata in the Occupancy Manager module dictates how the state changes of each item influence the occupancy status of a location. The configuration of this metadata is crucial for accurate and responsive occupancy management.

**Key Metadata Components for Items:**  

**OccupancyEvent**

- Description: Specifies the type of occupancy event the item generates.  
- Options:
    - `Switch`: An item (like a light switch or dimmer) triggers an occupancy event when turned on.  
    - `ContactMotion`: A motion sensor triggers an occupancy event when motion is detected. 
    - `ContactDoor`: A door sensor triggers an occupancy event when opened and affects the occupancy status until it is closed.
    - `AnyChange`: Any change in the item's state triggers an occupancy event.
- Example: `OccupancyEvent = "Switch"` for a light switch means that turning on the light indicates occupancy.

**BeginOccupiedTime and EndOccupiedTime (Optional)**  

- Description: Overrides the default occupancy time for an area when a specific item triggers an occupancy event.  
- Usage:
    - `BeginOccupiedTime`: Sets a custom duration for how long the area remains occupied after the item triggers an event.
    - `EndOccupiedTime`: Defines a custom duration for an area to remain occupied after the item's event ceases. 
- Example: `OccupancyEvent = "Switch" [EndOccupiedTime = 0]` for a light switch means the area becomes vacant immediately when the light is turned off.  

#### Configuring Items for Occupancy  

Each item that contributes to occupancy detection must be configured with appropriate metadata. This ensures that their state changes are correctly interpreted as occupancy events. 

**Example Configuration for a Bathroom Light Switch:**  

```text  
Switch LightSwitch_Bathroom "Bathroom Light" (gBathroom) ["Lighting"] { 
    OccupancyEvent = "Switch" 
}
```  

In this setup, the light switch in the bathroom:  

- Is associated with the `gBathroom` location.  
- Tagged as a "Lighting" item.  
- Triggers an occupancy event (occupancy starts) when turned on.  

**Example Configuration for a Bathroom Motion Sensor:**  

```text  
Contact MotionSensor_Bathroom "Bathroom Motion Sensor" (gBathroom) { 
    OccupancyEvent = "ContactMotion" 
}
```

Here, the motion sensor in the bathroom:  

- Is linked to the `gBathroom` group.  
- Triggers an occupancy event (occupancy starts) upon detecting motion.

#### Occupied and Vacant Actions

The following are possible automations for when an area becomes occupied:

**LightsOn** - will turn on any lights in a location that are point items tagged "Light"
**LightsOnIfDark** - will turn any lights in a location that are point items tagged "Light" when it is dark out
**SceneOn** - will activate any scenes in a location that are point items tagged "Scene"
**SceneOnIfDark** - will activate any scenes in a location that are point items tagged "Scene" when it is dark out
**AVOn** - will turn on any AV items in a location that are point items tagged "AVPower"
**ExhaustFansOn** - will turn on any exhaust fan items in a location that are point items tagged "ExhaustFan"

The following are possible automations for when an are become vacant:

**LightsOff** - will turn off any lights in a location that are point items tagged "Light"
**SceneOff** - will turn off any scenes in a location that are point items tagged "Scene"
**AVOff** - will turn off any AV items in a location that are point items tagged "AVPower"
**ExhaustFansOff** - will turn off any exhaust fan items in a location that are point items tagged "ExhaustFan"
 
#### Tagging of items for automation by the Occupancy Manager

Items that you want to automate need to be tagged for the Occupancy Manager to control them. Items must be a Point Item in the Semantic Model. They are then tagged as follows:


- **Light**
- **Scene**
- **AVPower**
- **ExhaustFan**

##### Considerations for Item Configuration  

- Consistent Tagging: Ensure that all items are tagged consistently to match the actions defined in the location metadata.   
- Group Association: Items must be correctly associated with their respective location groups to influence the occupancy status accurately.
- Metadata Accuracy: Ensure that the metadata for each item accurately reflects its role and the type of event it generates.  

This detailed section on item configuration provides a comprehensive guide on how to set up individual items for occupancy detection and management within the Occupancy Manager module.

### Occupancy Manager Generated Items for Each Location  

For each location, the Occupancy Manager module creates specific items named using the location item's name with added suffixes. These items manage and reflect the occupancy state and control aspects of the location.  

**Occupancy State Item (_Occupancy_State):**  

- Purpose: Indicates and allows setting the current occupancy status of the location.  
- State: `ON` (Occupied) or `OFF` (Vacant).
- Usage: Automatically updated by the module based on occupancy events. Can also be set through rules, triggering associated actions if defined (e.g., turning lights on/off).  

**Occupancy Control Item (_Occupancy_Control):**   

- Purpose: Provides control over the locking of the location's occupancy status from rules.
- State: String value indicating control commands (e.g., `LOCK`, `UNLOCK`, `CLEARLOCK`).  
- Usage: Receives commands to lock or unlock the location. Locking controls can be propagated to child locations for hierarchical occupancy management.  

**Occupancy Locking Item (_Occupancy_Lock):**  

- Purpose: Reflects the locking state of the location's occupancy status.  
- State: `ON` (Locked) or `OFF` (Unlocked).  
- Usage: A status item indicating if the location's occupancy state is currently locked. Not intended for control or change by rules, but rather for informational purposes.  

**Occupancy Time Item (_Occupancy_Time):**   

- Purpose: Displays the time until which the location is considered occupied. 
- State: String value showing the occupancy duration or end time.  
- Usage: A status item providing visual or programmatic indication of the occupancy duration. Not for control by rules, but useful for complex automations or informational purposes.  

### Integrating Generated Items in Automations and UI  

**Automations and Rules:** The occupancy state item can be used in OpenHAB rules to create sophisticated automations. For example, a rule can be set up to turn on certain lights when the occupancy state of a location is ON.  

**Manual Overrides and Locking:** The occupancy control item allows manual intervention in occupancy status, essential for scenarios like parties or specific home activities where automatic detection might be overridden.   

**UI Display:** These items can be displayed in the OpenHAB user interface, providing users with an at-a-glance view of which locations are occupied, locked, or their upcoming vacancy status.  

### Detailed Discussion on Locking Mechanism
The Occupancy Manager module provides a locking mechanism to override and take manual control over the automatic occupancy detection in certain scenarios.

**Introduction to Locking**
The locking feature allows temporarily preventing occupancy state changes to a location that would normally occur from sensor events. Locking is useful when:

You don't want any automation changes in the house for a period.
The house is vacant but you want to manually control devices without triggering occupancy.
Overriding inaccurate occupancy detection during special activities.
Locking provides a way to manually override the automated occupancy status management when required.

**Using Locking in the Occupancy Manager**
The module provides a _Occupancy_Control item for each location to command locking actions.

**Locking Commands**

LOCK: Prevents occupancy status from changing automatically due to sensor events. Multiple LOCK commands can be sent.
UNLOCK: Removes one of the locks, returning to normal automated occupancy update after all UNLOCKs clear all previous LOCKs.
CLEARLOCK: Clears all existing locks on a location regardless of number of LOCK commands sent previously.
Locks do not propagate to parent or child locations.

If a location is occupied when lock is applied, the occupancy timer is suspended until lock is cleared.

A parent location cannot be marked vacant if any child location is locked.

**Example Usage**

If away on vacation with the house vacant, but you want to turn on some lights for security purposes without marking the home as occupied:

Send LOCK command to _Occupancy_Control item for the home location group.
Manually turn lights on by setting state of light switches.
This will not trigger occupancy as home location is locked.
Locking provides added flexibility in managing occupancy status for complex home automation needs.
