#!/usr/bin/env node
'use strict'

const yargs = require('yargs')

const { createRelease } = require('../lib/commands/create-release')
const { logger, setApiConfig } = require('../lib/utils')

const args = yargs
  .usage('Usage:\n  $0 [options]')
  .option('host', { describe: 'The base url of the octopus deploy server', demandOption: true })
  .option('apiKey', { describe: 'Api key used to connect to octopus deploy', demandOption: true })
  .option('projectSlugOrId', { describe: 'The id or slug of the octopus project', demandOption: true })
  .option('releaseVersion', { describe: 'The SemVer of the release to create', demandOption: true })
  .option('releaseNotes', { describe: 'Notes to associate with the new release' })
  .option('packageVersion', { describe: 'The version of the packages to release' })
  .help()
  .alias('h', 'help')
  .example(`$0 \\\n --host=https://octopus.acme.com \\\n --apiKey=API-123 \\\n --projectSlugOrId={my-project|projects-123} \\\n --releaseVersion=2.0.0-rc-4 \\\n --packageVersion=1.0.1 \\\n --releaseNotes="Created release as post-build step"`)
  .argv

const execute = async () => {
  const { host, apiKey, projectSlugOrId, releaseVersion, releaseNotes, packageVersion } = args
  const params = { projectSlugOrId, version: releaseVersion, releaseNotes, packageVersion }

  setApiConfig({ host, apiKey })

  logger.info(`Creating release for project '${projectSlugOrId}'`)

  try {
    await createRelease(params)
  } catch (err) {
    logger.error('Failed to create release. Error:', err)

    process.exitCode = 1
  }
}

execute()
