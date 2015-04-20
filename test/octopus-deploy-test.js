'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;

var octopusDeploy = require('../lib/octopus-deploy');

describe('octopus-deploy', function () {

	it('should not blow up when required', function () {
		expect(octopusDeploy).to.not.be.undefined();
	});

});