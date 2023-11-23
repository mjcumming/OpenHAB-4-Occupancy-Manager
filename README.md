
# Occupancy Manager for OpenHAB 4

## Introduction

Welcome to the Occupancy Manager module, an advanced tool designed for the OpenHAB 4 platform. This module is engineered to transform home automation with a nuanced approach to location-based occupancy management and automation.

## Purpose

In the realm of home automation, determining whether a specific location within the home is occupied is crucial. The Occupancy Manager module for OpenHAB 4 simplifies this by utilizing OpenHAB's semantic model, offering a refined system for managing locations and tracking their occupancy in real-time. The module operates on two core components:

- **Occupancy Status Determination**: Using events from existing devices (like light switches, AV systems, and motion sensors) to dynamically track the occupancy status of locations, thereby eliminating the need for dedicated presence sensors in every location.  
- **Optional Event-Driven Automation**: If desired, the module can automate tasks based on the occupancy state, such as adjusting lighting, HVAC systems, and media devices to enhance comfort and energy efficiency.

## Key Features

- **Semantic Location Management**: Manages locations within a home intelligently and semantically, recognizing and categorizing various locations such as rooms and floors.
- **Dynamic Occupancy Tracking**: Determines the occupancy status of locations using events from existing devices, making the system both economical and adaptable. 
- **Automated and Manual Control**: Offers both automated actions based on occupancy states and the ability for users to manually control actions using generated items in each location. This allows users to choose between automated tasks or custom rule-based automation.
- **Hierarchical Location Structure**: Supports complex control and event propagation across different levels, from individual locations to the entire home.  
- **Ease of Use**: Encapsulates all necessary logic within the module, shifting the focus from coding to configuring, thereby making occupancy management more accessible.

## Installation

Installing the Occupancy Manager module is a quick process. Follow these instructions to get started:

1. Navigate to the OpenHAB Automation Directory:  
    Access the `automation/js` directory within your OpenHAB configuration directory. This is where the module will be installed.

2. Install the Module:  
    Once in the `automation/js` directory, run the following command to install the Occupancy Manager module:

    ```bash
    npm install occupancymanager
    ```

    This command installs the Occupancy Manager module along with its dependencies into your OpenHAB system.

## Configuration of the Occupancy Manager Module  

The configuration of the Occupancy Manager module is essential for its effective operation within your OpenHAB 4 environment. This section guides you through defining locations, setting up metadata, and configuring items for occupancy detection.

### Basic Configuration Overview

Configuration involves defining locations, setting up location-specific metadata, and configuring items (like switches or sensors) that influence occupancy status. Accurate configuration ensures the module reflects the real occupancy status and integrates seamlessly with your home automation system.

#### Defining Locations

Locations in OpenHAB 4 are set using semantic modeling. Each location represents a distinct space within your home, such as a bathroom, bedroom, or kitchen. 

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

- `Time`: Duration (in minutes) a location remains 'occupied' after an event.
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

In this example, the bathroom's occupancy time is set to 15 minutes. Lights and exhaust fans turn off when it becomes vacant and lights turn on when occupied.

#### Configuring Occupancy Items  

Items such as light switches or motion sensors are linked to locations to determine their occupancy.

**Steps to Configure an Occupancy Item:**

1. Assign the Item to a Location: Include the item in the location's group.
2. Set Occupancy Event Metadata: Define how item state changes affect occupancy.

**Example:**

```text  
Switch LightSwitch_Bathroom "Bathroom Light" (gBathroom) ["Lighting"] { 
    OccupancyEvent = "OnOff" 
}
```

The bathroom light switch here influences the occupancy status of the bathroom.

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

In this setup, the bathroom is a part of the first floor, and events in the bathroom propagate to the first floor level.

### Custom Automation and Extended Functionality  

The Occupancy Manager module allows for custom automation based on occupancy states.

#### Creating Custom Automation Rules:  

1. Use Occupancy States: Develop rules that trigger based on the occupancy status of locations.
2. Integrate with OpenHAB Rules Engine: Leverage OpenHAB's rules engine to create complex automation scenarios.

**Example:** A rule might turn on hallway lights when the bathroom is occupied during night hours.

### Example Configuration Scenarios  

To help you better understand how to apply these configurations, here are some practical scenarios:

#### Bathroom Occupancy:

- When a light switch in the bathroom is turned on, the Occupancy Manager sets the bathroom as occupied for 15 minutes. If no other activity is detected, it then marks it as vacant, turning off the lights and exhaust fan automatically.

Metadata configuration for the bathroom would look like this:  

```text
Group gBathroom "Bathroom" <icon> (gFirstFloor) ["Bathroom"] { 
    OccupancySettings = "" 
    [Time = 15,  
     VacantActions = "LightsOff, ExhaustFansOff"]  
}
```

#### First Floor Monitoring:  

- Activities in any room on the first floor update the occupancy status of the entire floor. For instance, occupancy in the bathroom triggers the first floor's occupancy status.
- A rule could be created to adjust the HVAC settings based on the occupancy of the first floor.

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
    - `OnOff`: An item (like a light switch) triggers an occupancy event when turned on.  
    - `ContactMotion`: A motion sensor triggers an occupancy event when motion is detected.
    - `ContactDoor`: A door sensor triggers an occupancy event when opened and affects the occupancy status until it is closed.
    - `AnyChange`: Any change in the item's state triggers an occupancy event.
- Example: `OccupancyEvent = "OnOff"` for a light switch means that turning on the light indicates occupancy.

**BeginOccupiedTime and EndOccupiedTime (Optional)**  

- Description: Overrides the default occupancy time for an area when a specific item triggers an occupancy event.  
- Usage:
    - `BeginOccupiedTime`: Sets a custom duration for how long the area remains occupied after the item triggers an event.
    - `EndOccupiedTime`: Defines a custom duration for an area to remain occupied after the item's event ceases. 
- Example: `OccupancyEvent = "OnOff" [EndOccupiedTime = 0]` for a light switch means the area becomes vacant immediately when the light is turned off.  

#### Configuring Items for Occupancy  

Each item that contributes to occupancy detection must be configured with appropriate metadata. This ensures that their state changes are correctly interpreted as occupancy events. 

**Example Configuration for a Bathroom Light Switch:**  

```text  
Switch LightSwitch_Bathroom "Bathroom Light" (gBathroom) ["Lighting"] { 
    OccupancyEvent = "OnOff" 
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