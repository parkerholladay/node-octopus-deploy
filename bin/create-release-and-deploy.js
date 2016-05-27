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
    .demand('environmentName', true)
    .describe('environmentName', 'Then name of the environment, if you are deploying (ex. DEV-SERVER)')
    .demand('comments', false)
    .describe('comments', 'Comments you want to associate with the deploy (ex. Automated Deploy to DEV-SERVER as post-build step)')
    .demand('variables', false)
    .describe('variables', "Variables applicable to deployment (ex. {'SourceDir': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3'})")
    .demand('packageVersion', false)
    .describe('packageVersion', 'The version of the packages to deploy in this release (ALL must be of this version).')
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
// Create Release and Deploy
// -------------------------------------------
// Release Information
var projectSlugOrId = argv.projectSlugOrId;
var version = argv.version;
var releaseNotes = argv.releaseNotes;
var packageVersion = argv.packageVersion;

// Deployment Information
var environmentName = argv.environmentName;
var comments = argv.comments;
// Form Value Example: Source Directory
var variables;
if (argv.variables) {
    variables = JSON.parse(argv.variables);
}

var deploymentPromise = client.helper.simpleCreateReleaseAndDeploy(projectSlugOrId, version, releaseNotes, environmentName, comments, variables, packageVersion);

deploymentPromise.then(
    // Success
    function (deployment) {
        console.log('Release and Deployment Created...');
        console.log(deployment);
        process.exit(0);
    },
    // Error
    function (error) {
        console.log('Error when trying to create release and deploy...');
        if (error.error) {
            console.log(error.error);
        } else {
            console.log(error);
        }
        process.exit(1);
    });