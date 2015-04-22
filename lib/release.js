/**
 * Release resource actions
 */
'use strict';

var internals = {};

/**
 * Constructor
 *
 * @param client
 */
var release = function (client) {
	this.client = client;
};

/**
 * Find a release by id
 *
 * @param id
 * @returns {promise|object}
 */
release.prototype.findById = function(id) {

	var options = {
		uri: '/api/releases/' + id
	};

	return this.client.request.get(options);
};

/**
 * Find a release by projectId and version
 *
 * @param projectId
 * @param version
 * @returns {promise|object}
 */
release.prototype.findByProjectIdAndVersion = function(projectId, version) {

	var options = {
		uri: '/api/projects/' + projectId + '/releases/' + version
	};

	return this.client.request.get(options);
};

/**
 * Find a release by projectId and version
 *
 * @param projectId
 * @param version
 * @returns {promise|object}
 */
release.prototype.create = function(projectId, version, releaseNotes) {

	var releaseBody = {
		"ProjectId": projectId,
		"ReleaseNotes": releaseNotes,
		"Version": version
	};

	var options = {
		uri: '/api/releases',
		body: releaseBody
	};

	return this.client.request.post(options);
};

module.exports = release;