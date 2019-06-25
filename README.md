# octopus-deploy

[![Build Status](https://travis-ci.org/parkerholladay/node-octopus-deploy.svg?branch=master)](https://travis-ci.org/parkerholladay/node-octopus-deploy)
[![NPM version](https://badge.fury.io/js/octopus-deploy.png)](http://badge.fury.io/js/octopus-deploy)

Node scripts to package up applications, create releases, and deploy with Octopus Deploy.
This package leverages the [Octopus Deploy REST API](https://github.com/OctopusDeploy/OctopusDeploy-Api/wiki)

These scripts mimic the behavior of Octopus Deploy powershell CLI tools and enable calling octopus from a linux machine.

The primary purpose is to be able to call the scripts for packaging, releasing, and deploying applications, via the command line, but you could also use the module as a library.

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

_Note: If `packageVersion` is omitted, `version` will be used for all package versions when creating the release._

The same package version will be used for all deployment steps. This requires that _ALL_ packages referenced by the deploy steps have the same version.

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

## Create and push a package

```
octopus-deploy-pack-and-push \
    --host=https://octopus.acme.com \
    --apiKey=API-123 \
    --packageName=my-package \
    --packageVersion=1.0.1 \
    --globs='./src/**::./node_modules/**::!**/*.spec.*' \
    --base="./" \
    --replace \
    --zip
```

`replace` is optional and will replace an existing package if one exists

`zip` is optional and creates a `.zip` file instead of `.tar.gz`

`globs` is a `::` separated list of file globs describing the files to package

_Note: If your globs have negations (`!`) you must wrap the `--globs` value in single quotes (`'`) rather than double quotes (`"`)_

# Library usage

## API

The wrapped api endpoints make use of a [maybe monad](https://en.wikibooks.org/wiki/Haskell/Understanding_monads/Maybe) borrowed from functional languages like Haskell. Each endpoint either returns a maybe with a `value` or not rather than throwing errors to be handled by the consumer.

### Usage

```js
const { initializeApi, octopusApi } = require('octopus-deploy')

const config = {
  host: 'https://octopus.acme.com',
  apiKey: 'API-123' // This is used to authorize against the REST API
}

initializeApi(config)

const projectId = 'Project-123'
const project = octopusApi.projects.get(projectId)

if (!project.hasValue) {
  console.error(`Project '${projectId}' not found`)
}

console.log(`Found project '${project.value.name}' by id '${projectId}'`)
```

### Create release example

Selected packages for the deployment steps are specified more explicitly. For more information refer to [this Octopus support issue](http://help.octopusdeploy.com/discussions/problems/35372-create-release-a-version-must-be-specified-for-every-included-nuget-package).

```js
const { octopusApi } = require('octopus-deploy')

const releaseParams = {
  projectId: 'Projects-123',
  version: '1.0.0-rc.3',
  releaseNotes: 'Release notes for testing',
  selectedPackages: [
    {
      StepName: 'My octopus process first step',
      Version: '1.0.0.0'
    },
    {
      StepName: 'My octopus process second step',
      Version: '1.0.2-rc.1'
    }
  ]
}

async function createRelease() {
  const release = await octopusApi.releases.create(releaseParams)

  if (!release.hasValue) {
    console.error('Octopus release creation failed!')
  }

  console.log(`Octopus release '${release.value.id}' created.`)

  return release.value
}

createRelease()
```

### Other

All implemented API endpoints can be found in the `./lib/api` directory. _Note: Not all Octopus Deploy endpoints are implemented._

- `deployment`
- `environment`
- `machine`
- `package`
- `process`
- `project`
- `release`
- `variable`

# Contributing

If there are other API functions you need, feel free to fork the project, add some tests along with the desired endpoint, and submit a pull request.

All commits will run the pre-commit hook which checks linting and runs all tests.

## Testing

100% test coverage is not an absolute (some code just can't be tested), but it is the aspirational goal

Run `npm test` to run all tests for the project

Run `npm run test:watch` to run tests in watch mode (ideal for development)

Run `npm run test:cover` to run tests and report on test coverage

# License

MIT
