'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockDeployment = require('./mocks/mock-deployment.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var octoRequestGet;
var octoRequestPost;

var internals = {};

describe('deployments', function () {

	beforeEach(function (done) {

		sandbox = require('sinon').sandbox.create();
		octoRequestGet = sandbox.stub(require('request-promise'), 'get', function (options) {

			return BPromise.resolve(mockDeployment);
		});
		octoRequestPost = sandbox.stub(require('request-promise'), 'post', function (options) {

			return BPromise.resolve(mockDeployment);
		});
		done();
	});

	afterEach(function (done) {
		sandbox.restore();
		done();
	});


	describe('findById', function () {

		it('should find a deployment', function () {

			var deploymentId = 'deployments-123';

			return client.deployment.findById(deploymentId)
				.then(function (deployment) {
					internals.validateDeploymentObject(deployment);
				});
		});
	});

});

internals.validateDeploymentObject = function (deployment) {

	expect(deployment).to.not.be.undefined();
	expect(deployment).to.be.instanceof(Object);
	expect(deployment.Id).to.be.a('string');
	expect(deployment.ReleaseId).to.be.a('string');
	expect(deployment.EnvironmentId).to.be.a('string');
	expect(deployment.ForcePackageDownload).to.be.a('boolean');
	expect(deployment.ForcePackageRedeployment).to.be.a('boolean');
	expect(deployment.SkipActions).to.be.a('array');
	expect(deployment.SpecificMachineIds).to.be.a('array');
	expect(deployment.TaskId).to.be.a('string');
	expect(deployment.ProjectId).to.be.a('string');
	expect(deployment.UseGuidedFailure).to.be.a('boolean');
	expect(deployment.Comments).to.be.a('string');
	expect(deployment.FormValues).to.be.instanceof(Object);
	//expect(deployment.QueueTime).to.be.instanceof(Object);
	expect(deployment.Name).to.be.a('string');
	expect(deployment.Created).to.be.a('string');
	expect(deployment.LastModifiedOn).to.be.a('string');
	expect(deployment.LastModifiedBy).to.be.a('string');
	expect(deployment.Links).to.be.instanceof(Object);
};