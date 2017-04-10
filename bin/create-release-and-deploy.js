#! /usr/bin/env node
'use strict'

const yargs = require('yargs')

const logger = require('../lib/logger')
const octopusApi = require('../lib/octopus-deploy')
const createReleaseAndDeploy = require('../lib/commands/simple-create-release-and-deploy')

const args = yargs
  .usage('Usage:\n  $0 [options]')
  .help('help')
  .alias('h', 'help')
  .describe('host', 'The base url of the octopus deploy server')
  .describe('apiKey', 'Api key used to connect to octopus deploy')
  .describe('projectSlugOrId', 'The id or slug of the octopus project')
  .describe('version', 'The SemVer of the release to create')
  .describe('releaseNotes', 'Notes to associate with the new release')
  .describe('packageVersion', 'The version of the packages to release')
  .describe('environmentName', 'The name of the environment to deploy to')
  .describe('comments', 'Deploy comments')
  .describe('variables', 'Deploy variables')
  .demandOption(['host', 'apiKey', 'projectSlugOrId', 'version', 'packageVersion', 'environmentName'])
  .example(`$0 \\\n --host=https://octopus.acme.com \\\n --apiKey=API-123 \\\n --projectSlugOrId={my-project|projects-123} \\\n --version=2.0.0-rc-4 \\\n --releaseNotes="Created release as post-build step" \\\n --packageVersion=1.0.1 \\\n --environmentName=DEV-SERVER \\\n --comments="Automated deploy to DEV-SERVER as post-build step" \\\n --variables="{\\"SourceDir\\": \\"\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3\\"}"`)
  .argv

const { host, apiKey, projectSlugOrId, version, releaseNotes, packageVersion, environmentName, comments } = args
const variables = args.variables
  ? JSON.parse(args.variables)
  : null

octopusApi.init({ host, apiKey })

logger.log('Creating release and deploying...')

const releaseParams = { projectSlugOrId, version, releaseNotes, packageVersion }
const deployParams = { environmentName, comments, variables }

createReleaseAndDeploy(releaseParams, deployParams)
  .then(deploy => {
    logger.log(`Created release '${deploy.ReleaseId}' and deployed '${deploy.Id}'`)
    process.exit(0)
  })
  .catch(err => {
    logger.log('Failed to create release and deploy. Error:', err.message)
    process.exit(1)
  })
