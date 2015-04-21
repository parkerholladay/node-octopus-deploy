'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockRelease = require('./mocks/mock-release.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var releasesFindByProjectIdAndVersion;

var internals = {};

describe('releases', function () {

	beforeEach(function (done) {

		sandbox = require('sinon').sandbox.create();
		releasesFindByProjectIdAndVersion = sandbox.stub(require('request-promise'), 'get', function (options) {

			return BPromise.resolve(mockRelease);
		});
		done();
	});

	afterEach(function (done) {
		sandbox.restore();
		done();
	});


	describe('findById', function () {

		it('should find a release', function () {

			var releaseId = 'releases-123';

			return client.release.findById(releaseId)
				.then(function (release) {
					internals.validateReleaseObject(release);
				});
		});
	});

	describe('findByProjectIdAndVersion', function () {

		it('should find a release', function () {

			var projectId = 'project-123';
			var version = '1.0.0-rc-3';

			return client.release.findByProjectIdAndVersion(projectId, version)
				.then(function (release) {
					internals.validateReleaseObject(release);
				});
		});
	});

});

internals.validateReleaseObject = function (release) {

	expect(release).to.not.be.undefined();
	expect(release).to.be.instanceof(Object);
	expect(release.Id).to.be.a('string');
	expect(release.Assembled).to.be.a('string');
	expect(release.ReleaseNotes).to.be.a('string');
	expect(release.ProjectId).to.be.a('string');
	expect(release.ProjectVariableSetSnapshotId).to.be.a('string');
	expect(release.LibraryVariableSetSnapshotIds).to.be.a('array');
	expect(release.ProjectDeploymentProcessSnapshotId).to.be.a('string');
	expect(release.SelectedPackages).to.be.a('array');
	expect(release.Version).to.be.a('string');
	expect(release.LastModifiedOn).to.be.a('string');
	expect(release.LastModifiedBy).to.be.a('string');
	expect(release.Links).to.be.instanceof(Object);
};