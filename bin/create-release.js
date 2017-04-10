#! /usr/bin/env node
'use strict'

const yargs = require('yargs')

const logger = require('../lib/logger')
const octopusApi = require('../lib/octopus-deploy')
const createRelease = require('../lib/commands/simple-create-release')

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
  .demandOption(['host', 'apiKey', 'projectSlugOrId', 'version', 'packageVersion'])
  .example(`$0 \\\n --host=https://octopus.acme.com \\\n --apiKey=API-123 \\\n --projectSlugOrId={my-project|projects-123} \\\n --version=2.0.0-rc-4 \\\n --releaseNotes="Created release as post-build step" \\\n --packageVersion=1.0.1`)
  .argv

const { host, apiKey, projectSlugOrId, version, releaseNotes, packageVersion } = args

octopusApi.init({ host, apiKey })

logger.log('Creating release...')

const params = { projectSlugOrId, version, releaseNotes, packageVersion }

createRelease(params)
  .then(release => {
    logger.log(`Created release '${release.Id}'`)
    process.exit(0)
  })
  .catch(err => {
    logger.log('Failed to create release. Error:', err.message)
    process.exit(1)
  })
