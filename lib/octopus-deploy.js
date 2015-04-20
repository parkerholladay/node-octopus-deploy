'use strict';
/**
 * This file is called from the command line.
 */

// Here are the options to specify when calling this script
var argv = require('yargs')
	.demand('url', true)
	.describe('url', 'The url of your octopus deploy instance (ex: https://deploy.mycompany.com)')
	.demand('apiKey', true)
	.describe('apiKey', 'The api key used to connect to octopus deploy.')
	.demand('project', true)
	.describe('project', 'The name of the project to perform actions against (ex. My Project)')
	.demand('release', true)
	.describe('release', 'The SemVer of the release you would like to create (ex. 2.0.0-rc-4)')
	.demand('environment', false)
	.describe('environment', 'Then name of the environment, if you are deploying (ex. DEV-SERVER-1)')
	.argv;