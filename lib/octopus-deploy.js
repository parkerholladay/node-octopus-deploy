'use strict';

var deployment = require('./deployment.js');
var environment = require('./environment.js');
var release = require('./release.js');
var project = require('./project.js');
var variable = require('./variable.js');

var helper = require('./helper.js');

//// Here are the options to specify when calling this script
//var argv = require('yargs')
//	.demand('url', true)
//	.describe('url', 'The url of your octopus deploy instance (ex: https://deploy.mycompany.com)')
//	.demand('apiKey', true)
//	.describe('apiKey', 'The api key used to connect to octopus deploy.')
//	.demand('project', true)
//	.describe('project', 'The name of the project to perform actions against (ex. My Project)')
//	.demand('release', true)
//	.describe('release', 'The SemVer of the release you would like to create (ex. 2.0.0-rc-4)')
//	.demand('environment', false)
//	.describe('environment', 'Then name of the environment, if you are deploying (ex. DEV-SERVER-1)')
//	.argv;

var Client = function(config) {

	// Verify Configuration was passed
	if (!config){
		throw new Error('config is required to instantiate client');
	}
	if (!config.host){
		throw new Error('host is required to instantiate client');
	}
	if (!config.apiKey){
		throw new Error('apiKey is required to instantiate client');
	}

	this.config = config;

	this.request = require("request-promise").defaults(
		{
			baseUrl: config.host,
			json: true,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-Octopus-ApiKey': config.apiKey
			}
		}
	);

	this.deployment = new deployment(this);
	this.environment = new environment(this);
	this.release = new release(this);
	this.project = new project(this);
	this.variable = new variable(this);

	this.helper = new helper(this);
};

module.exports = Client;