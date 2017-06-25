#!/usr/bin/env node
'use strict'
/* eslint-disable no-process-exit */

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
  .describe('machineIds', 'Comma separated list of machine ids to target')
  .demandOption(['host', 'apiKey', 'projectSlugOrId', 'version', 'environmentName'])
  .example(`$0 \\\n --host=https://octopus.acme.com \\\n --apiKey=API-123 \\\n --projectSlugOrId={my-project|projects-123} \\\n --version=2.0.0-rc-4 \\\n --packageVersion=1.0.1 \\\n --releaseNotes="Created release as post-build step" \\\n --environmentName=DEV-SERVER \\\n --comments="Automated deploy to DEV-SERVER as post-build step" \\\n --variables="{\\"SourceDir\\": \\"\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3\\"}" \\\n --machineIds="Machines-123,Machines-456"`)
  .argv

const { host, apiKey, projectSlugOrId, version, releaseNotes, packageVersion, environmentName, comments } = args
const variables = args.variables
  ? JSON.parse(args.variables)
  : {}
const machineIds = args.machineIds
  ? args.machineIds.split(',')
  : []

octopusApi.init({ host, apiKey })

logger.info(`Creating release and deploying project '${projectSlugOrId}'...`)

const releaseParams = { projectSlugOrId, version, releaseNotes, packageVersion }
const deployParams = { environmentName, comments, variables, machineIds }

createReleaseAndDeploy(releaseParams, deployParams)
  .then(deploy => {
    logger.info(`Finished creating release '${deploy.releaseId}' and deployed '${deploy.id}'. ${projectSlugOrId} ${version}`)
    return deploy
  })
  .catch(err => {
    logger.error('Failed to create release and deploy. Error:', err.message)
    process.exit(1)
  })

/* eslint-enable no-process-exit */
