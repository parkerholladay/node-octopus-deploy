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
    --packageVersion=1.0.1 \
    --releaseNotes="Test release notes"
```
`packageVersion` and `releaseNotes` are optional

## Create release and deploy

```
octopus-deploy-create-release-and-deploy \
    --host=https://octopus.acme.com \
    --apiKey=API-123 \
    --projectSlugOrId=Projects-123 \
    --version=2.0.0-rc-4 \
    --packageVersion=1.0.1 \
    --releaseNotes="Test release notes" \
    --environmentName=DEV-SERVER \
    --comments="Automated Deploy to DEV-SERVER as post-build step" \
    --variables="{\"SourceDir\": \"\\\\\\\\SOURCESERVER\\\\MyProject\\\\1.0.0-rc-3 \"}" \
    --machineIds="Machines-123,Machines-456"
```
`packageVersion`, `releaseNotes`, `comments`, `variables`, and `machineIds` are optional

_Note: If `packageVersion` is omitted, `version` will be used for all package versions when creating the release._

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

The same package version will be used for all deployment steps. This requires that _ALL_ packages referenced by the deploy steps have the same version.

### Simple create release

```
const releaseParams = {
    projectSlugOrId: 'my-project-name',
    version: '1.0.0-rc.3',
    packageVersion: '1.0.0',
    releaseNotes: 'Release notes for testing'
}

// Create release
simpleCreateRelease(releaseParams)
    .then((release) => {
        console.log('Octopus release created:')
        console.log(release)
    }, (reason) => {
        console.log('Octopus release creation failed!')
        console.log(reason)
    })
```

### Simple create release and deploy

```
const releaseParams = {
    projectSlugOrId: 'my-project-name',
    version: '1.0.0-rc.3',
    packageVersion: '1.0.0',
    releaseNotes: 'Release notes for testing'
}

const deployParams = {
    environmentName: 'DEV-SERVER'
    comments: 'Deploy releases-123 to DEVSERVER1'
    variables: {
        SourceDir: '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' // Form value example: source directory
    }
}

// Create and deploy release
simpleCreateReleaseAndDeploy(releaseParams, deployParams)
    .then((deployment) => {
        console.log('Octopus release created and deployed:')
        console.log(deployment)
    }, (reason) => {
        console.log('Octopus release creation or deployment failed!')
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

All implemented API endpoints can be found in the `./lib/api` directory. _Note: Not all Octopus Deploy endpionts are implemented._

- `deployment`
- `environment`
- `machine`
- `process`
- `project`
- `release`
- `variable`

# Testing

This module uses mocha tests. Simply run `npm test`, `npm run test:watch`, or `npm run test:cover`.

# Contributing

If there are other API functions you need, feel free to fork the project, add some tests along with the desired endpoint, and submit a pull request.
I'll try to stay on top of things as much as possible.

All commits will run the pre-commit hook which checks linting and runs all tests.

# License

MIT
