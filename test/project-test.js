'use strict';

/**
 * Unit tests for octopus-deploy.js
 */
var expect = require('chai').expect;
var BPromise = require('bluebird');

var testConfig = require('./etc/test-config');
var OctoDeployApi = require('../lib/octopus-deploy');
var mockProject = require('./mocks/mock-project.json');

var client = new OctoDeployApi(testConfig);

var sandbox;
var octoRestGet;

var internals = {};

describe('projects', function () {

	beforeEach(function (done) {

		sandbox = require('sinon').sandbox.create();
		octoRestGet = sandbox.stub(require('request-promise'), 'get', function (options) {
			return BPromise.resolve(mockProject);
		});
		done();
	});

	afterEach(function (done) {

		sandbox.restore();
		done();
	});

	describe('findBySlugOrId', function () {

		it('should find a project by id', function () {

			var id = 'project-123';
			return client.project.findBySlugOrId(id)
				.then(function (project) {
					internals.validateProjectObject(project);
				});
		});

		it('should find a project by slug', function () {

			var slug = 'my-project-name';
			return client.project.findBySlugOrId(slug)
				.then(function (project) {
					internals.validateProjectObject(project);
				});
		});
	});

	describe('findById', function () {

		it('should find a project by id', function () {

			var id = 'project-123';
			return client.project.findById(id)
				.then(function (project) {
					internals.validateProjectObject(project);
				});
		});
	});

	describe('findBySlug', function () {

		it('should find a project by slug', function () {

			var slug = 'my-project-name';
			return client.project.findBySlug(slug)
				.then(function (project) {
					internals.validateProjectObject(project);
				});
		});
	});

});

internals.validateProjectObject = function (project) {

	expect(project).to.not.be.undefined();
	expect(project).to.be.instanceof(Object);
	expect(project.Id).to.be.a('string');
	expect(project.VariableSetId).to.be.a('string');
	expect(project.DeploymentProcessId).to.be.a('string');
	expect(project.IncludedLibraryVariableSetIds).to.be.a('array');
	expect(project.DefaultToSkipIfAlreadyInstalled).to.be.a('boolean');
	expect(project.VersioningStrategy).to.be.instanceof(Object);
	expect(project.ReleaseCreationStrategy).to.be.instanceof(Object);
	expect(project.Name).to.be.a('string');
	expect(project.Slug).to.be.a('string');
	expect(project.Description).to.be.a('string');
	expect(project.ProjectGroupId).to.be.a('string');
	expect(project.LifecycleId).to.be.a('string');
	expect(project.AutoCreateRelease).to.be.a('boolean');
	expect(project.LastModifiedOn).to.be.a('string');
	expect(project.LastModifiedBy).to.be.a('string');
	expect(project.Links).to.be.instanceof(Object);
};