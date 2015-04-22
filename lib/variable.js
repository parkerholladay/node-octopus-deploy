/**
 * Variable resource actions
 */
'use strict';

var internals = {};

/**
 * Constructor
 *
 * @param client
 */
var variable = function (client) {
	this.client = client;
};

/**
 * Find a variable by id
 *
 * @param id
 * @returns {promise|object}
 */
variable.prototype.findById = function (id) {

	var options = {
		uri: '/api/variables/' + id
	};

	return this.client.request.get(options);
};

module.exports = variable;