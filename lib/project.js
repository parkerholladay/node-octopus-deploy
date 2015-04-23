/**
 * Project resource actions
 */
'use strict';

var internals = {};

/**
 * Constructor
 *
 * @param client
 */
var project = function (client) {
	this.client = client;
};

/**
 * Find a project by a unique project by slug or id
 *
 * @param slug
 * @returns {promise|Object}
 */
project.prototype.findByIdOrSlug = function(idOrSlug) {

	var options = {
		uri: '/api/projects/' + idOrSlug
	};

	return this.client.request.get(options);
};

/**
 * Find a project by id
 *
 * @param id
 * @returns {promise|Object}
 */
project.prototype.findById = function(id) {

	return this.findByIdOrSlug(id);
};

/**
 * Find a project by slug
 *
 * @param slug
 * @returns {promise|Object}
 */
project.prototype.findBySlug = function(slug) {

	return this.findByIdOrSlug(slug);
};

module.exports = project;