'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockVariable = require('./mocks/mock-variable.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var octoRequestGet;

var internals = {};

describe('variables', function () {

	beforeEach(function (done) {

		sandbox = require('sinon').sandbox.create();
		octoRequestGet = sandbox.stub(require('request-promise'), 'get', function (options) {

			return BPromise.resolve(mockVariable);
		});
		done();
	});

	afterEach(function (done) {
		sandbox.restore();
		done();
	});


	describe('findById', function () {

		it('should find a variable', function () {

			var variableId = 'variables-123';

			return client.variable.findById(variableId)
				.then(function (variable) {
					internals.validateVariableObject(variable);
				});
		});
	});

});

internals.validateVariableObject = function (variable) {

	expect(variable).to.not.be.undefined();
	expect(variable).to.be.instanceof(Object);
	expect(variable.Id).to.be.a('string');
	expect(variable.OwnerId).to.be.a('string');
	expect(variable.Version).to.be.a('number');
	expect(variable.Variables).to.be.a('array');
	expect(variable.ScopeValues).to.be.instanceof(Object);
	expect(variable.LastModifiedOn).to.be.a('string');
	expect(variable.LastModifiedBy).to.be.a('string');
	expect(variable.Links).to.be.instanceof(Object);
};