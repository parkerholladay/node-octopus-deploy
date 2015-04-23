#! /usr/bin/env node
'use strict';

//// Here are the options to specify when calling this script
var argv = require('yargs')
	.demand('host', true)
	.describe('host', 'The base url of your octopus deploy instance (ex: https://deploy.mycompany.com)')
	.demand('apiKey', true)
	.describe('apiKey', 'The api key used to connect to octopus deploy.')
	.demand('projectSlugOrId', true)
	.describe('projectSlugOrId', 'The id or slug of the project to perform actions against (ex. my-project or projects-123)')
	.demand('version', true)
	.describe('version', 'The SemVer of the release you would like to create (ex. 2.0.0-rc-4)')
	.demand('releaseNotes', true)
	.describe('releaseNotes', 'The notes you want to associate with this release (ex. Created release as post-build step)')
//	.demand('environmentName', false)
//	.describe('environmentName', 'Then name of the environment, if you are deploying (ex. DEV-SERVER)')
	.argv;

// -------------------------------------------
// Setup Client
// -------------------------------------------
var OctoDeployApi = require('../lib/octopus-deploy');

var config = {
	host: argv.host,
	apiKey: argv.apiKey // This is used to authorize against the REST Api
};

var client = new OctoDeployApi(config);

// -------------------------------------------
// Create Release
// -------------------------------------------
var projectSlugOrId = argv.projectSlugOrId;
var version = argv.version;
var releaseNotes = argv.releaseNotes;

var releasePromise = client.helper.simpleCreateRelease(projectSlugOrId, version, releaseNotes);

releasePromise.then(
	// Success
	function (release) {
		console.log('Release Created...');
		console.log(release);
		process.exit(0);
	},
	// Error
	function (error) {
		console.log('Error when tyring to create release...');
		if (error.error) {
			console.log(error.error);
		} else {
			console.log(error);
		}
		process.exit(1);
	});