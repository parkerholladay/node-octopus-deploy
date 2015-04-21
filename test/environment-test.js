'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockEnvironment = require('./mocks/mock-environment.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var octoRequestGet;
var octoRequestPost;

var internals = {};

describe('environments', function () {

	beforeEach(function (done) {

		sandbox = require('sinon').sandbox.create();
		octoRequestGet = sandbox.stub(require('request-promise'), 'get', function (options) {

			return BPromise.resolve(mockEnvironment);
		});
		done();
	});

	afterEach(function (done) {
		sandbox.restore();
		done();
	});


	describe('findById', function () {

		it('should find a environment', function () {

			var environmentId = 'environments-123';

			return client.environment.findById(environmentId)
				.then(function (environment) {
					internals.validateEnvironmentObject(environment);
				});
		});
	});

});

internals.validateEnvironmentObject = function (environment) {

	expect(environment).to.not.be.undefined();
	expect(environment).to.be.instanceof(Object);
	expect(environment.Id).to.be.a('string');
	expect(environment.Name).to.be.a('string');
	expect(environment.Description).to.be.a('string');
	expect(environment.SortOrder).to.be.a('number');
	expect(environment.UseGuidedFailure).to.be.a('boolean');
	expect(environment.LastModifiedOn).to.be.a('string');
	expect(environment.LastModifiedBy).to.be.a('string');
	expect(environment.Links).to.be.instanceof(Object);
};