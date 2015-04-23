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
helper.prototype.simpleCreateReleaseAndDeploy = function (projectSlugOrId, version, releaseNotes, environmentName, comments, variables) {

	var projectId;
	var environmentId;
	var formValues;

	// Load Project
	var projectPromise = client.project.findBySlugOrId(projectSlugOrId);

	// Load Variable Set
	var variableSetPromise = projectPromise.then(function (project) {

		projectId = project.Id;

		if (_.isEmpty(project.VariableSetId)) {
			BPromise.reject('VariableSetId is not set on project');
		}

		return client.variable.findById(project.VariableSetId);
	});

	// Load Environment, Build Variables, kick off release and deploy
	var createReleaseAndDeployPromise = variableSetPromise.then(function (variableSet) {

		// Get environmentId for environmentName
		var foundEnvironment = _.findWhere(variableSet.ScopeValues.Environments, {'Name': environmentName});

		if (_.isEmpty(foundEnvironment)) {
			BPromise.reject('Unable to find Environment "' + environmentName + '" in variable set scope');
		}

		environmentId = foundEnvironment.Id;

		// Convert Variables with names to ids
		var variableNames = _.keys(variables);

		if (!_.isEmpty(variableNames)) {
			formValues = {};
		}

		for (var i = 0; i < variableNames.length; i = i + 1) {
			var variableName = variableNames[i];
			var variableId = internals.getVariableId(variableSet, variableName, environmentId);
			formValues[variableId] = variables[variableName];
		}

		return helper.prototype.createReleaseAndDeploy(
			projectId, version, releaseNotes, environmentId, comments, formValues);
	});

	return createReleaseAndDeployPromise;
};

/**
 * Create a release with simple params
 *
 * @param projectSlugOrId
 * @param version
 * @param releaseNotes
 * @returns {promise|*}
 */
helper.prototype.simpleCreateRelease = function (projectSlugOrId, version, releaseNotes) {

	var projectId;

	// Load Project
	var projectPromise = client.project.findBySlugOrId(projectSlugOrId);

	// Create Release
	var releasePromise = projectPromise.then(function (project) {

		projectId = project.Id;

		return client.release.create(projectId, version, releaseNotes);
	});

	return releasePromise;
};


/**
 * Helper to parse variable set to get variable id
 *
 * @param variableSet
 * @param variableName
 * @param environmentId
 * @returns {*}
 */
internals.getVariableId = function (variableSet, variableName, environmentId) {

	// Get Specific Variable
	var foundVariables = _.filter(variableSet.Variables, function (varWithScope) {

		// Verify Name Matches
		var nameMatches = varWithScope.Name === variableName;

		// Verify Env is part of this scope
		var foundEnv = _.includes(varWithScope.Scope.Environment, environmentId);

		return nameMatches && foundEnv;
	});

	// Throw error if no variable found
	if (_.isEmpty(foundVariables)) {
		throw new Error('No "' + variableName + '" variable found with scope env "' + environmentId + '" in variable set');
	}

	// Throw error if more than one variable found
	if (_.size(foundVariables) > 1) {
		throw new Error('More than one "' + variableName + '" variable found with scope env "' + environmentId + '" in variable set');
	}

	return foundVariables[0].Id;
};

module.exports = helper;