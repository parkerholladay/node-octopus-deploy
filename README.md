# octopus-deploy

[![Build Status](https://travis-ci.org/parkerholladay/node-octopus-deploy.svg?branch=master)](https://travis-ci.org/parkerholladay/node-octopus-deploy)

A set of node scripts to create releases within Octopus Deploy, and optionally deploy those releases.
This package leverages the Octopus Deploy REST API:

```
https://github.com/OctopusDeploy/OctopusDeploy-Api/wiki
```

These scripts mimic the behavior of Octopus Deploy powershell CLI tools and enable calling octopus from a linux machine.

The primary purpose is to be able to call the scripts via the command line, but you could also use the module as a library.

```
npm install octopus-deploy
```

# CLI usage

## Create release

```
octopus-deploy-create-release \
    --host=https://octopus.acme.com \
    --apiKey=API-123 \
    --projectSlugOrId=my-project \
    --version=2.0.0-rc-4 \
    --releaseNotes="Test release notes" \
    --packageVersion=1.0.1
```
`releaseNotes` are optional

## Create release and deploy

```
octopus-deploy-create-release-and-deploy \
    --host=https://octopus.acme.com \
    --apiKey=API-123 \
    --projectSlugOrId=Projects-123 \
    --version=2.0.0-rc-4 \
    --releaseNotes="Test release notes" \
    --packageVersion=1.0.1
    --environmentName=DEV-SERVER \
    --comments="Automated Deploy to DEV-SERVER as post-build step" \
    --variables="{\"SourceDir\": \"\\\\\\\\SOURCESERVER\\\\MyProject\\\\1.0.0-rc-3 \"}"
```
`releaseNotes`, `comments`, and `variables` are optional

# Library usage

This module uses [bluebird](https://github.com/petkaantonov/bluebird) promises as much as possible.

## Setup client

```
const octopusApi = require('octopus-deploy')

const config = {
    host: 'https://octopus.acme.com',
    apiKey: 'API-123' // This is used to authorize against the REST API
}

octopusApi.init(config)
```

## Commands

The same package version will be used for all deployment steps. This requires ALL the packages referenced by the deploy steps to have the same version.

### Simple create release

```
const releaseParams = {
    projectSlugOrId: 'my-project-name',
    version: '1.0.0-rc.3',
    releaseNotes: 'Release notes for testing'
    packageVersion: '1.0.0'
}

// Create release
simpleCreateRelease(releaseParams)
    .then((release) => {
        console.log('Octopus release created:')
        console.log(release)
    }, (reason) => {
        console.log('Octopus release creation falied!')
        console.log(reason)
    })
```

### Simple create release and deploy

```
const releaseParams = {
    projectSlugOrId: 'my-project-name',
    version: '1.0.0-rc.3',
    releaseNotes: 'Release notes for testing'
    packageVersion: '1.0.0'
}

const deployParams = {
    environmentName: 'DEV-SERVER'
    comments: 'Deploy releases-123 to DEVSERVER1'
    variables: {
        'SourceDir': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' // Form value example: source directory
    }
}

// Create and deploy release
simpleCreateReleaseAndDeploy(releaseParams, deployParams)
    .then((deployment) => {
        console.log('Octopus release created and deployed:')
        console.log(deployment)
    }, (reason) => {
        console.log('Octopus release creation or deployment falied!')
        console.log(reason)
    })
```

## API

### Create release

Selected packages for the deployment steps are specified more explicitly. For more information refer to [this Octopus support issue](http://help.octopusdeploy.com/discussions/problems/35372-create-release-a-version-must-be-specified-for-every-included-nuget-package).

```
const projectId = 'Projects-123'
const version = '1.0.0-rc.3'
const releaseNotes = 'Release notes for testing'
const selectedPackages = [
    {
        StepName: 'My octopus process first step',
        Version: '1.0.0.0'
    },
    {
        StepName: 'My octopus process second step',
        Version: '1.0.2-rc.1'
    }
]

octopusApi.releases.create(projectId, version, releaseNotes, selectedPackages)
    .then((release) => {
        console.log('Octopus release created:')
        console.log(release)
    }, (reason) => {
        console.log('Octopus release creation falied!')
        console.log(reason)
    })
```

### Other

All implemented API endpoints can be found in the `./lib/api` directory. _Notice not all Octopus Deploy endpionts are implemented._

- deployment
- environment
- process
- project
- release
- variable

# Testing

This module uses mocha tests. Simply run `npm test` or `npm run test:watch`.

# Contributing

If there are other API functions you need, feel free to fork the project,
submit a pull request, and I'll try to keep up-to-date.

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
