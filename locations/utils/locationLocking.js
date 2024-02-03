const { LocationUtils } = require ('./locationUtils.js'); 


/**
 * Class to manager location locking.
 * @class
 */
class LocationLocking {
    /**
     * Create a LocationLocking.
     * @param {Object} location - The location object.
     */
    constructor(location) {
        this.location = location;
        this.lockingLevel = 0;
        this.lockTimer = null;
        this.secondsLeftWhenLocked = null;
    }

    /**
     * Check if the location is locked.
     * @returns {boolean} - True if the location is locked, false otherwise.
     */
    isLocked() {
        return this.lockingLevel > 0;
    }

    /**
     * Check if any child locations are locked.
     * @returns {boolean} True if any child locations are locked, false otherwise.
     */
    hasLockedChildLocations() {
        const childLocationGroups = LocationUtils.getChildLocations(this.location.locationItem);
        for (const childLocationGroup of childLocationGroups) {
            console.debug(`Checking child location ${childLocationGroup.name} for locking`);
            const location = this.location.locations[childLocationGroup.name];
            if (location === undefined) {
                console.warn(`Location ${childLocationGroup.name} not found in locations.`);
            } else if (location.locking.isLocked()) {
                return true;
            } else if (location.locking.hasLockedChildLocations()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Lock the location.
     * @param {number} timeOut - The timeout in seconds.
     */
    lock(timeOut) {
        this.lockingLevel++;
        console.log(`Locking level for location ${this.location.locationItem.name} is ${this.lockingLevel}`) 
        if (this.lockingLevel === 1 && this.location.occupancyTimer.timeOut !== null) {
            this.secondsLeftWhenLocked = (this.location.occupancyTimer.timeOut - Date.now()) / 1000;
            console.log(`Occupancy Locking turned on, occupancy time left in seconds ${this.secondsLeftWhenLocked}`);
        }
        // update locking state
        this.location.occupancyItems.occupancyLockingItem.postUpdate("ON");
        this.location.occupancyItems.occupancyTimeItem.postUpdate("Locked");
        
        if (timeOut) {
            this.startTimer(timeOut);
        }   

        //lock child locations
        const childLocationGroups = LocationUtils.getChildLocations(this.location.locationItem);
        for (const childLocationGroup of childLocationGroups) {
            const location = this.location.locations[childLocationGroup.name];
            if (location === undefined) {
                console.warn(`Location ${childLocationGroup.name} not found in locations.`);
            } else {
                location.locking.lock(); //do not pass timeout as we want to use the same timeout for all locations
            }
        }   
    } 

    /**
     * Unlock the location.
     */
    unlock() {
        this.lockingLevel--;
        console.log(`Unlocking level for location ${this.location.locationItem.name} is ${this.lockingLevel}`)
        if (this.lockingLevel === 0) {
            console.log(`Occupancy Locking turned off for location ${this.location.locationItem.name}`)
            this.location.occupancyItems.occupancyLockingItem.postUpdate("OFF");
            this.cancelTimer(); //cancel the timer for locking if there was one

            if (this.location.isLocationOccupied()) {
                if (this.secondsLeftWhenLocked !== null) {
                    console.log(`Occupancy Timer restarted with time left ${Math.floor(this.secondsLeftWhenLocked)} seconds`);
                    this.location.occupancyTimer.start(this.secondsLeftWhenLocked);
                    this.secondsLeftWhenLocked = null;
                } else {
                    console.log(`Occupancy Timer restarted with location default time`);
                    this.location.occupancyTimer.start(this.location.occupancySettings.getOccupancyTime());
                }
            } else {
                console.log(`Occupancy Timer NOT restarted as location is not occupied`);
            }
        }

        if (this.lockingLevel < 0) {
            this.lockingLevel = 0;
            console.warn(`Occupancy Locking level for location ${this.location.locationItem.name} is less than 0, reset to 0`)
        }

        //unlock child locations
        const childLocationGroups = LocationUtils.getChildLocations(this.location.locationItem);
        for (const childLocationGroup of childLocationGroups) {
            const location = this.location.locations[childLocationGroup.name];
            if (location === undefined) {
                console.warn(`Location ${childLocationGroup.name} not found in locations.`);
            } else {
                location.locking.unlock();
            }
        }
    } 

    /**
     * Clear the location lock.
     */
    clearLock() {
        this.lockingLevel = 1;
        this.unlock();
    }

    /**
     * Start the location lock timer.
     * @param {number} timeOutSeconds - The timeout in seconds.
     */
    startTimer(timeOutSeconds) {
        const timeoutCallback = () => {
            console.log(`Occupancy LOCK timer for location ${this.location.locationItem.name} expired`);
            this.unlock();
        };

        if (this.lockTimer) {
            clearTimeout(this.lockTimer);
        }

        this.lockTimer = setTimeout(timeoutCallback, timeOutSeconds * 1000);
        console.log(`Occupancy LOCK timer for location ${this.location.locationItem.name} started for ${timeOutSeconds} seconds`);
    }

    /**
     * Cancel the location lock timer.
     */
    cancelTimer() {
        if (this.lockTimer) {
            clearTimeout(this.lockTimer);
            console.log(`Occupancy LOCK timer for location ${this.location.locationItem.name} cancelled`);
            this.lockTimer = null;
        }
    }       

    /**
     * Dispose the location lock.
     */
    dispose() {
        this.cancelTimer();
    }
}

module.exports = { 
    LocationLocking: LocationLocking
};

