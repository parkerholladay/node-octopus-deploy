'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');
var _ = require('lodash');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockDeployment = require('./mocks/mock-deployment.json');
var mockProject = require('./mocks/mock-project.json');
var mockRelease = require('./mocks/mock-release.json');
var mockVariable = require('./mocks/mock-variable.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var octoRequestGet;
var octoRequestPost;

var internals = {};

describe('helper', function () {

	beforeEach(function (done) {

		sandbox = require('sinon').sandbox.create();

		octoRequestGet = sandbox.stub(require('request-promise'), 'get', function (options) {

			if (options.uri.indexOf('/projects/') > -1) {
				return BPromise.resolve(mockProject);
			} else if (options.uri.indexOf('/variables/') > -1) {
				return BPromise.resolve(mockVariable);
			} else {
				return BPromise.reject('Unknown endpoint');
			}
		});

		octoRequestPost = sandbox.stub(require('request-promise'), 'post', function (options) {

			if (_.endsWith(options.uri, '/deployments')) {
				return BPromise.resolve(mockDeployment);
			} else if (_.endsWith(options.uri, '/releases')) {
				return BPromise.resolve(mockRelease);
			} else if (_.endsWith(options.uri, '/variables')) {
				return BPromise.resolve(mockVariable);
			} else {
				return BPromise.reject('Unknown endpoint');
			}
		});

		done();
	});

	afterEach(function (done) {
		sandbox.restore();
		done();
	});

	describe('createReleaseAndDeploy', function () {

		it('should create a release and then deploy that release', function () {

			// Release Information
			var projectId = 'project-123';
			var version = '1.0.0-rc-3';
			var releaseNotes = 'Release notes for testing';

			// Deployment Information
			var environmentId = 'Environments-123';
			var comments = 'Deploy releases-123 to DEVSERVER1';
			// Form Value Example: Source Directory
			// The formValues.attribute is unique id for the 'SourceDir' variable
			var formValues = {
				'd02ff723-7fdb-2011-792d-ad99eaa3e1cc': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3'
			};

			// Create Release
			return client.helper.createReleaseAndDeploy(
				projectId, version, releaseNotes, environmentId, comments, formValues)
				.then(function (deployment) {

					expect(deployment).to.be.instanceof(Object);
					expect(deployment.Id).to.be.a('string');

					return deployment;
				});

		});

	});

	describe('simpleCreateReleaseAndDeploy', function () {

		it('should create a release and then deploy that release', function () {

			// Release Information
			var projectSlug = 'my-project-name';
			var version = '1.0.0-rc-3';
			var releaseNotes = 'Release notes for testing';

			// Deployment Information
			var environmentName = 'DEV-SERVER';
			var comments = 'Deploy releases-123 to DEVSERVER1';
			// Form Value Example: Source Directory
			var variables = {
				'SourceDir': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3'
			};

			// Create Release
			return client.helper.simpleCreateReleaseAndDeploy(
				projectSlug, version, releaseNotes, environmentName, comments, variables)
				.then(function (deployment) {

					expect(deployment).to.be.instanceof(Object);
					expect(deployment.Id).to.be.a('string');

					return deployment;
				});

		});

		it('should create a release and then deploy that release (via options object as only parameter)', function () {
			var deployOptions = {
				projectSlugOrId: 'my-project-name',
				version: '1.0.0-rc-3',
				releaseNotes: 'Release notes for testing',
				environmentName: 'DEV-SERVER',
				comments: 'Deploy releases-123 to DEVSERVER1',
				variables: {
					'SourceDir': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3'
				}
			};

			// Create Release
			return client.helper.simpleCreateReleaseAndDeploy(deployOptions)
				.then(function (deployment) {

					expect(deployment).to.be.instanceof(Object);
					expect(deployment.Id).to.be.a('string');

					return deployment;
				});

		});

	});

	describe('simpleCreateRelease', function () {

		it('should create a release', function () {

			// Release Information
			var projectSlugOrId = 'my-project-name';
			var version = '1.0.0-rc-3';
			var releaseNotes = 'Release notes for testing';

			// Create Release
			return client.helper.simpleCreateRelease(projectSlugOrId, version, releaseNotes)
				.then(function (release) {

					expect(release).to.be.instanceof(Object);
					expect(release.Id).to.be.a('string');

					return release;
				});

		});

	});

});
