#!/usr/bin/env node
'use strict'

const yargs = require('yargs')

const { octopack, publish } = require('../lib/octo-pack')
const octopus = require('../lib/octopus-deploy')
const { logger } = require('../lib/utils')

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
  .example(`$0 \\\n --host=https://octopus.acme.com \\\n --apiKey=API-123 \\\n --packageName=my-package \\\n --packageVersion=2.0.0-rc-4 \\\n --globs='./build/**::./node_modules/**::!**/*.spec.*' \\\n --base=./ \\\n --replace \\\n --zip`)
  .argv

const execute = async () => {
  const { host, apiKey, packageName: name, packageVersion: version, globs, base, replace, zip } = args
  const globList = globs.split('::')

  octopus.init({ host, apiKey })

  const packageNameAndVersion = `${name} v${version}`
  logger.info(`Packing '${packageNameAndVersion}'...`)

  const extension = zip ? 'zip' : 'tar.gz'
  const packOptions = { base, zip }
  const publishParams = { name, version, extension, replace }

  try {
    const contents = await octopack(globList, packOptions)
    const pkg = await publish({ ...publishParams, contents })

    logger.info(`Published package '${pkg.title}.${pkg.version}${pkg.extension}' (${pkg.size})`)
  } catch (err) {
    logger.error(`Failed to pack and publish '${packageNameAndVersion}'`, err.message)

    process.exitCode = 1
  }
}

execute()
