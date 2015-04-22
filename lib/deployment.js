/**
 * Deployment resource actions
 */
'use strict';

var internals = {};

/**
 * Constructor
 *
 * @param client
 */
var deployment = function (client) {
	this.client = client;
};

/**
 * Find a deployment by id
 *
 * @param id
 * @returns {promise|object}
 */
deployment.prototype.findById = function(id) {

	var options = {
		uri: '/api/deployments/' + id
	};

	return this.client.request.get(options);
};

deployment.prototype.create = function(environmentId, releaseId, comments, formValues) {

	var deploymentBody = {
		"EnvironmentId": environmentId,
		"ReleaseId": releaseId,
		"Comments": comments,
		"FormValues": formValues
	};

	var options = {
		uri: '/api/deployments',
		body: deploymentBody
	};

	return this.client.request.post(options);
};

module.exports = deployment;