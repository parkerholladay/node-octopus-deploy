/**
 * Process resource actions
 */
'use strict';

var internals = {};

/**
 * Constructor
 *
 * @param client
 */
var process = function (client) {
    this.client = client;
};

/**
 * Find a deployment process by id
 *
 * @param id
 * @returns {promise|Object}
 */
process.prototype.findById = function(id) {

    var options = {
        uri: '/api/deploymentProcesses/' + id
    };

    return this.client.request.get(options);
};

module.exports = process;