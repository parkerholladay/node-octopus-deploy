# octopus-deploy

[![Build Status](https://travis-ci.org/parkerholladay/node-octopus-deploy.svg?branch=master)](https://travis-ci.org/parkerholladay/node-octopus-deploy)

Node script to create a release within Octopus Deploy, and optionally also deploys that release.  
This package uses the Octopus Deploy REST API.

    https://github.com/OctopusDeploy/OctopusDeploy-Api/wiki

This module was specifically created in order to initiate a release and deploy from a linux machine.

The primary usage was to be able to call it via the command line, but you could also use it as a library as well.

# Command Line Usage

Install it globally...

    npm install octopus-deploy -g
    
## Create Release

Here is an example of creating a release (make into one line)

    octopus-deploy-create-release 
        --host=https://deploy.mycompany.com 
        --apiKey=ABC-123 
        --projectSlugOrId=my-project
        --version=0.0.0-test-node-od-1 
        --releaseNotes="Test release notes"

## Create Release and Deploy

Here is an example of creating a release, then deploying that release (make into one line)

`comments` and `variables` are optional

    octopus-deploy-create-release-and-deploy 
        --host=https://deploy.mycompany.com 
        --apiKey=ABC-123 
        --projectSlugOrId=my-project
        --version=0.0.0-test-node-od-1 
        --releaseNotes="Test release notes"
        --environmentName="DEV-SERVER"
        --comments="Automated Deploy to DEV-SERVER as post-build step"
        --variables="{\"SourceDir\": \"\\\\\\\\SOURCESERVER\\\\MyProject\\\\0.0.0-test-node-od-1 \"}"
    
# Library Usage

If you are looking to use it as a library, you are probably looking to install it locally.

    npm install octopus-deploy

This module tries to use promises whenever possible, specifically [bluebird](https://github.com/petkaantonov/bluebird) promises.

## Setup Client

    var OctoDeployApi = require('octopus-deploy');
    
    var config = {
        host: 'https://deploy.mycompany.com',
        apiKey: 'ABC-123' // This is used to authorize against the REST Api
    };
    
    var client = new OctoDeployApi(config);

## Helper
 
### Simple - Create Release And Deploy

The same package version will be used for all deployment steps. This depends on there existing a package of the specified version for ALL the packages referenced by the steps. 

    // Release Information
    var projectIdOrSlug = 'my-project-name';
    var version = '1.0.0-rc.3';
    var releaseNotes = 'Release notes for testing';
    var packageVersion = version;
    
    // Deployment Information
    var environmentName = 'DEV-SERVER';
    var comments = 'Deploy releases-123 to DEVSERVER1';
    // Form Value Example: Source Directory
    var variables = {
        'SourceDir': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3'
    };
    
    // Create Deployment
    var deploymentPromise = client.helper.simpleCreateReleaseAndDeploy(
        projectIdOrSlug, version, releaseNotes, environmentName, comments, variables, packageVersion);
        
    // Print out deployment
    deploymentPromise.then(function(deployment) {
        console.log('Octopus release created and deployed:');
        console.log(deployment);
    }, function(reason) {
        console.log('Octopus release creation or deployment falied!');
        console.log(reason);
    });

## Release

### Create

Selected packages for the deployment steps are specified more explicitly. For more information refer to [this Octopus support issue](http://help.octopusdeploy.com/discussions/problems/35372-create-release-a-version-must-be-specified-for-every-included-nuget-package).

    var projectIdOrSlug = 'my-project-name';
    var version = '1.0.0-rc.3';
    var releaseNotes = 'Release notes for testing';
    var selectedPackages = 
        [{
            "StepName": "My octopus process first step",
            "Version": "1.0.0.0"
        }, {
            "StepName": "My octopus process second step",
            "Version": "1.0.2-rc.1"
        }];

    releasePromise = client.release.create(projectIdOrSlug, version, releaseNotes, selectedPackages);
    
    releasePromise.then(function (release) {
        console.log('Octopus release Created:');
        console.log(release);
    }, function(reason) {
        console.log('Octopus release creation falied!');
        console.log(reason);
    });

## Other

Other methods are exposed but I didn't want to take the time to document them right now.
You can find them in the `.\lib` folder. 
Notice not all resource/methods are implemented 
(Feel free to fork and submit pull request for your needs).

- deployment
- environment
- helper (custom mashup of multiple calls)
- project
- process
- release
- variable

# Testing

This project uses gulp for running tests.  All tests reside in the `.\test` folder.

To run tests...

    gulp test
    
To run tests in a TDD mode with a watch...

    gulp dev
    
# TODO

There are a few error cases that do not have test cases right now.

# Contributing

If there are other API functions you need, feel free to fork the project,
submit a pull request, and I'll try to keep up to date.

# License

The MIT License (MIT)

Copyright (c) 2014 Isaac Johnson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
