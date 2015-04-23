/**
 * Environment resource actions
 */
'use strict';

var internals = {};

/**
 * Constructor
 *
 * @param client
 */
var environment = function (client) {
	this.client = client;
};

/**
 * Find a environment by id
 *
 * @param id
 * @returns {promise|object}
 */
environment.prototype.findById = function (id) {

	var options = {
		uri: '/api/environments/' + id
	};

	return this.client.request.get(options);
};

module.exports = environment;