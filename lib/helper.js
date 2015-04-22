/**
 * Helper actions
 */
'use strict';

var _ = require('lodash');
var BPromise = require('bluebird');

var internals = {};

var client;

/**
 * Constructor
 *
 * @param client
 */
var helper = function (parentClient) {
	client = parentClient;
};

/**
 * Create and deploy a release
 *
 * @param projectId
 * @param version
 * @param releaseNotes
 * @param environmentId
 * @param comments
 * @param formValues
 * @returns {promise|object}
 */
helper.prototype.createReleaseAndDeploy = function (projectId, version, releaseNotes, environmentId, comments, formValues) {

	// Create Release
	var releasePromise = client.release.create(projectId, version, releaseNotes);

	// Create Deployment
	return releasePromise.then(function (release) {

		var releaseId = release.Id;
		return client.deployment.create(environmentId, releaseId, comments, formValues);
	});
};

/**
 * Create and deploy a release with simple params
 *
 * @param projectSlug
 * @param version
 * @param releaseNotes
 * @param environmentName
 * @param comments
 * @param variables
 * @returns {promise|Object}
 */
helper.prototype.simpleCreateReleaseAndDeploy = function (projectSlug, version, releaseNotes, environmentName, comments, variables) {

	var projectId;
	//var version;
	//var releaseNotes;
	var environmentId;
	//var comments;
	var formValues;

	// Load Project
	var projectPromise = client.project.findBySlug(projectSlug);

	// Load Variables
	var variableSetPromise = projectPromise.then(function (project) {

		projectId = project.Id;

		if (_.isEmpty(project.VariableSetId)) {
			BPromise.reject('VariableSetId is not set on project');
		}

		return client.variable.findById(project.VariableSetId);
	});

	// Load Environment And Any Variables That were passed
	var envAndVariablesPromise = variableSetPromise.then(function (variableSet) {

		// Get environmentId for environmentName
		var foundEnvironment = _.findWhere(variableSet.ScopeValues.Environments, {'Name': environmentName});

		if (!foundEnvironment) {
			BPromise.reject('Unable to find Environment "' + environmentName + '" in variable set scope');
		}

		environmentId = foundEnvironment.Id;

		// Get Specific Variables
		// TODO: implement

		// TODO: implement test


	});


	return helper.prototype.createReleaseAndDeploy(
		projectId, version, releaseNotes, environmentId, comments, formValues);


//	// Create Release
//	var releasePromise = client.release.create(projectId, version, releaseNotes);
//
//	// Create Deployment
//	return releasePromise.then(function (release) {
//
//		var releaseId = release.Id;
//		return client.deployment.create(environmentId, releaseId, comments, formValues);
//	});
};

module.exports = helper;