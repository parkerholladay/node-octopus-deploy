'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;

var OctoDeployApi = require('../lib/octopus-deploy');

describe('client', function () {

	it('should not blow up when required', function () {
		expect(OctoDeployApi).to.not.be.undefined();
	});

	describe('constructor', function () {

		it('should throw error if no config was passed', function (done) {

			var error = 'config is required to instantiate client';
			var fn = function () {
				var client = new OctoDeployApi();
			};
			expect(fn).to.throw(error);
			done();
		});

		it('should throw error if config.host was not set', function (done) {

			var error = 'host is required to instantiate client';
			var fn = function () {
				var config = {};
				var client = new OctoDeployApi(config);
			};
			expect(fn).to.throw(error);
			done();
		});

		it('should throw error if config.host was not set', function (done) {

			var error = 'apiKey is required to instantiate client';
			var fn = function () {
				var config = {
					host: 'https://deploy.mycompany.com'
				};
				var client = new OctoDeployApi(config);
			};
			expect(fn).to.throw(error);
			done();
		});
	});

});