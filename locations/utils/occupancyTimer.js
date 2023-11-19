// occupancyTimer.js

class OccupancyTimer {
    constructor(location) {
        this.location = location;
        this.occupancyTimer = null; // Timer for counting down occupancy.
        this.timeOut = null; // Time the timer will fire at.
    }

    /**
     * Starts an occupancy timer for a given duration.
     * 
     * @param {number} timeOutSeconds - Duration in seconds after which the timer will expire.
     */
    start(timeOutSeconds) {
        const timeStarted = new Date();

        // Clear any existing timer.
        if (this.occupancyTimer) {
            clearTimeout(this.occupancyTimer);
        }

        // Define the callback for when the timer expires.
        const timeoutCallback = () => {
            console.info(`Occupancy timer callback for location ${this.location.locationItem.name} expired, timer was started at ${timeStarted}`);
            this.location.setLocationVacant('Timer Expired');
            this.timeOut = null;
        };

        // Start the new timer.
        this.occupancyTimer = setTimeout(timeoutCallback, timeOutSeconds * 1000);
        this.timeOut = new Date(timeStarted.getTime() + timeOutSeconds * 1000); // Expected time of timer expiry.

        console.info(`Occupancy Timer started for location ${this.location.locationItem.name} expires at ${this.timeOut}, in ${parseInt(timeOutSeconds/60)} minutes`);
        
        this.location.occupancyItems.occupancyTimeItem.postUpdate(this.timeOut.toString());
    }

    /**
     * Cancels the running occupancy timer. MUST NOT CALL FROM TIMER CALLBACK.
     */
    cancel() {
        if (this.occupancyTimer) {
            clearTimeout(this.occupancyTimer);
            this.occupancyTimer = null;
            console.debug(`Occupancy timer for location ${this.location.locationItem.name} canceled`);

            this.timeOut = null;

            this.location.occupancyItems.occupancyTimeItem.postUpdate('Vacant');

        } else {
            console.debug(`No Occupancy timer to cancel for ${this.location.locationItem.name}`);
        }
    }

    /**
     * Disposes the occupancy timer.
     */
    dispose() {
        this.cancel();
    }
}

module.exports = {
    OccupancyTimer: OccupancyTimer
};
