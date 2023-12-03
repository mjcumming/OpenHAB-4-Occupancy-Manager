const { OccupancyManager } = require('./occupancyManager.js');

function start(options) {
    return new OccupancyManager(options);
}

module.exports = start;

