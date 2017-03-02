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
project.prototype.findBySlugOrId = function(idOrSlug) {

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

	return this.findBySlugOrId(id);
};

/**
 * Find a project by slug
 *
 * @param slug
 * @returns {promise|Object}
 */
project.prototype.findBySlug = function(slug) {

	return this.findBySlugOrId(slug);
};

/**
 * Get project's releases by projectId
 * will have to do some work to incorporate paging, but this will
 * get most recent releases
 *
 * @param projectId
 * @returns {promise|object}
 */
project.prototype.getReleasesById = function(projectId) {

	var options = {
		uri: '/api/projects/' + projectId + '/releases'
	};

	return this.client.request.get(options);
};

module.exports = project;
