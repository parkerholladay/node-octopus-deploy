'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockProjectsReleases = require('./mocks/mock-projects-releases.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var octoRestGet;

var internals = {};

describe('project\'s releases', function () {
	beforeEach(function (done) {
		sandbox = require('sinon').sandbox.create();
		octoRestGet = sandbox.stub(require('request-promise'), 'get', function (options) {
			return BPromise.resolve(mockProjectsReleases);
		});
		done();
	});

	afterEach(function (done) {

		sandbox.restore();
		done();
	});

	describe('getProjectsReleases', function () {
		it('should get projects\'s releases', function () {
			var projectId = 'project-123';

			return client.project.getReleasesById(projectId)
				.then(function (response) {
					internals.validateProjectsReleases(response);
				});
		});
	});
});

internals.validateProjectsReleases = function(response) {
	var firstRelease;

	expect(response).to.not.be.undefined();
	expect(response).to.be.instanceof(Object);
	expect(response.ItemType).to.equal('release');
	expect(response.Items).to.be.instanceof(Array);

	firstRelease = response.Items[0];
	expect(firstRelease.Id).to.be.a('string');
	expect(firstRelease.Assembled).to.be.a('string');
	expect(firstRelease.ReleaseNotes).to.be.a('string');
	expect(firstRelease.ProjectId).to.be.a('string');
	expect(firstRelease.ChannelId).to.be.a('string');
	expect(firstRelease.ProjectVariableSetSnapshotId).to.be.a('string');
	expect(firstRelease.LibraryVariableSetSnapshotIds).to.be.a('array');
	expect(firstRelease.ProjectDeploymentProcessSnapshotId).to.be.a('string');
	expect(firstRelease.SelectedPackages).to.be.a('array');
	expect(firstRelease.Version).to.be.a('string');
	expect(firstRelease.Links).to.be.instanceof(Object);
};
