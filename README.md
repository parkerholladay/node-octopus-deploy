# octopus-deploy

[![build status](https://img.shields.io/github/actions/workflow/status/parkerholladay/node-octopus-deploy/build.yaml?branch=master&logo=github&style=for-the-badge)](https://github.com/parkerholladay/node-octopus-deploy/actions)
[![npm](https://img.shields.io/npm/v/octopus-deploy?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/octopus-deploy)
![license](https://img.shields.io/npm/l/octopus-deploy?style=for-the-badge)
![test coverage](https://img.shields.io/nycrc/parkerholladay/node-octopus-deploy?label=coverage&config=.nycrc&preferredThreshold=functions&style=for-the-badge)

## DEPRECATED

There is now an [official CLI tool](https://octopus.com/docs/octopus-rest-api/octopus-cli) that replaces this utility and offers the full functionality of Octopus Deploy. And, the best part is, it is available on all platforms. As a result, this library has seen its last update.


> Node scripts to package up applications, create releases, and deploy with Octopus Deploy.

These scripts replicate some of the functionality of the Octopus Deploy powershell CLI tool and enable calling octopus from non-Windows machines.

This package leverages the [Octopus Deploy REST API](https://github.com/OctopusDeploy/OctopusDeploy-Api/wiki). The primary purpose is to be able to call the scripts for packaging, releasing, and deploying applications, via the command line, but you could also use the module as a library.

```
npm install --save-dev octopus-deploy
```

## CLI usage

### Create and push a package

```bash
octopus-deploy octopack \
    --host https://octopus.acme.com \
    --apiKey API-123 \
    --packageName my-package \
    --packageVersion 1.0.1 \
    --globs './src/**' './node_modules/**' '!**/*.spec.*' \
    --base ./ \
    --replace \
    --zip
```

`replace` is optional and will replace a package if it already exists _Note: Requires specific permission in Octopus Deploy_

`zip` is optional and creates a `.zip` file instead of `.tar.gz`

`globs` is a list of file globs describing the files to be packaged _Note: Each glob value in the list must be wrapped in single quotes (`'`)_

### Create release

```bash
octopus-deploy release create \
    --host https://octopus.acme.com \
    --apiKey API-123 \
    --projectSlugOrId my-project \
    --releaseVersion 2.0.0-rc-4 \
    --packageVersion 1.0.1 \
    --releaseNotes "Test release notes"
```

`packageVersion` and `releaseNotes` are optional

_Note: If `packageVersion` is omitted, `releaseVersion` will be used for all package versions when creating the release._

The same package version will be used for all deployment steps. This requires that _ALL_ packages referenced by the deploy steps have the same version.

### Create release and deploy

```bash
octopus-deploy release deploy \
    --host https://octopus.acme.com \
    --apiKey API-123 \
    --projectSlugOrId Projects-123 \
    --releaseVersion 2.0.0-rc-4 \
    --packageVersion 1.0.1 \
    --releaseNotes "Test release notes" \
    --environmentName Staging \
    --comments "Automated Deploy to Staging as post-build step" \
    --variables "{ \"host\": \"https://api.acme.com\", \"key\": \"its-a-secret-to-everybody\" }" \
    --machineIds Machines-123 Machines-456
```

`packageVersion`, `releaseNotes`, `comments`, `variables`, and `machineIds` are optional

### Promote/deploy existing release

```bash
octopus-deploy release promote \
    --host https://octopus.acme.com \
    --apiKey API-123 \
    --projectSlugOrId Projects-123 \
    --releaseVersion 2.2.1 \
    --environmentName Production \
    --comments "Automated Deploy to Production as post-build step" \
    --variables "{ \"host\": \"https://api.acme.com\", \"key\": \"its-a-secret-to-everybody\" }" \
    --machineIds Machines-123 Machines-456
```

`comments`, `variables`, and `machineIds` are optional


## Library usage

### API

The wrapped api endpoints make use of a [maybe monad](https://en.wikibooks.org/wiki/Haskell/Understanding_monads/Maybe) borrowed from functional languages like Haskell. Each endpoint either returns a maybe with a `value` or not rather than throwing errors to be handled by the consumer.

#### Usage

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

#### Create release example

Selected packages for the deployment steps are specified more explicitly. For more information refer to [this Octopus support issue](http://help.octopusdeploy.com/discussions/problems/35372-create-release-a-version-must-be-specified-for-every-included-nuget-package).

```js
const { octopusApi } = require('octopus-deploy')

const releaseParams = {
  projectId: 'Projects-123',
  version: '1.0.0-rc.3',
  releaseNotes: 'Release notes for testing',
  selectedPackages: [
    {
      stepName: 'My octopus process first step',
      version: '1.0.0.0'
    },
    {
      stepName: 'My octopus process second step',
      version: '1.0.2-rc.1'
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

#### Other

All implemented API endpoints can be found in the `./lib/api` directory. _Note: Not all Octopus Deploy endpoints are implemented._

- `deployments`
- `environments`
- `machines`
- `packages`
- `processes`
- `projects`
- `releases`
- `variables`

## Contributing

If there are other API functions you need, feel free to fork the project, add some tests along with the desired endpoint, and submit a pull request.

All commits will run the pre-commit hook which checks linting and runs all tests.

### Testing

100% test coverage is not an absolute (some code just can't be tested), but it is the aspirational goal

```bash
npm test  # Runs all tests for the project

npm run test:watch  # Runs tests in watch mode (ideal for development)

npm run test:cover  # Runs tests and report on test coverage
```

## License

MIT
