'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');
var _ = require('lodash');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockRelease = require('./mocks/mock-release.json');
var mockDeployment = require('./mocks/mock-deployment.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var octoRequestPost;

var internals = {};

describe('release-and-deploy', function () {

	describe('release and deploy', function () {

		beforeEach(function (done) {

			sandbox = require('sinon').sandbox.create();

			octoRequestPost = sandbox.stub(require('request-promise'), 'post', function (options) {

				if (_.endsWith(options.uri, '/releases')) {
					return BPromise.resolve(mockRelease);
				} else if (_.endsWith(options.uri, '/deployments')) {
					return BPromise.resolve(mockDeployment);
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
				.then (function(deployment) {

				expect(deployment).to.be.instanceof(Object);

				return deployment;
			});

		});

	});

});