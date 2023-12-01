const OccupancyManager = require('./occupancyManager');

function start(options) {
    return new OccupancyManager(options);
}

module.exports = start;