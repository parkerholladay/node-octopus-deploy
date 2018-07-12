#!/usr/bin/env node
/* eslint-disable node/shebang */
'use strict'

const yargs = require('yargs')

const logger = require('../lib/utils/logger')
const octopack = require('../lib/octo-pack')
const publish = require('../lib/octo-push')
const octopus = require('../lib/octopus-deploy')

const args = yargs
  .usage('Usage:\n  $0 [options]')
  .option('host', { describe: 'The base url of the octopus deploy server', demandOption: true })
  .option('apiKey', { describe: 'Api key used to connect to octopus deploy', demandOption: true })
  .option('packageName', { describe: 'The name of the package', demandOption: true })
  .option('packageVersion', { describe: 'The SemVer of the package', demandOption: true })
  .option('globs', { describe: `A list of globs separated by '::' describing the files to package`, demandOption: true })
  .option('base', { describe: 'The path to be used as the base for the packaged files', demandOption: false })
  .option('replace', { describe: 'Optional flag to replace package if it exists', default: false })
  .option('zip', { describe: 'Optional flag to use .zip format instead of .tar.gz', default: false })
  .help()
  .alias('h', 'help')
  .example(`$0 \\\n --host=https://octopus.acme.com \\\n --apiKey=API-123 \\\n --packageName=my-package \\\n --packageVersion=2.0.0-rc-4 \\\n --globs='./build/**::./node_modules/**::!**/*.spec.*' \\\n --base='./' \\\n --replace \\\n --zip`)
  .argv

const { host, apiKey, packageName: name, packageVersion: version, globs, base, replace, zip } = args
const globList = globs.split('::')

octopus.init({ host, apiKey })

const packageNameAndVersion = `${name} - ${version}`
logger.info(`Packing '${packageNameAndVersion}'...`)

const extension = zip ? 'zip' : 'tar.gz'
const packOptions = { base, zip }

try {
  const archive = octopack(globList, packOptions)

  const publishParams = { name, version, extension, replace, stream: archive }
  publish(publishParams)
    .then(pkg => {
      logger.info(`Published package '${pkg.id}${pkg.fileExtension}'`)
      return pkg
    })
    .catch(() => {
      logger.error(`Failed to publish '${packageNameAndVersion}'`)

      /* eslint-disable no-process-exit */
      process.exit(1)
      /* eslint-enable no-process-exit */
    })
} catch (err) {
  logger.error(`Failed to pack '${packageNameAndVersion}'`, err.message)

  /* eslint-disable no-process-exit */
  process.exit(1)
  /* eslint-enable no-process-exit */
}

/* eslint-enable node/shebang */
