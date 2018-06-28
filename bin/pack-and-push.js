#!/usr/bin/env node
/* eslint-disable node/shebang */
'use strict'

const yargs = require('yargs')

const octo = require('../lib')
// const logger = require('../lib/utils/logger')

const args = yargs
  .usage('Usage:\n  $0 [options]')
  .option('host', { describe: 'The base url of the octopus deploy server', demandOption: true })
  .option('apiKey', { describe: 'Api key used to connect to octopus deploy', demandOption: true })
  .option('globs', { describe: `A list of globs separated by '::' describing the files to package`, demandOption: true })
  .option('pkgName', { describe: 'The name of the package', demandOption: true })
  .option('pkgVersion', { describe: 'The SemVer of the package', demandOption: true })
  .option('zip', { describe: 'Optional flag to use .zip format instead of .tar.gz', default: false })
  .help()
  .alias('h', 'help')
  .example(`$0 \\\n --host=https://octopus.acme.com \\\n --apiKey=API-123 \\\n --base=my-dir \\\n --globs='**/build/*::!**/node_modules/**' \\\n --pkgName=my-package \\\n --pkgVersion=2.0.0-rc-4 \\\n --zip`)
  .argv

// const { host, apiKey, globs, pkgName: name, pkgVersion: version, zip } = args
const { globs, zip } = args
const globList = globs.split('::')

// logger.info(`Packing '${base}'...`)

const extension = zip ? '.zip' : '.tar.gz'
const packOptions = { zip, extension }
octo.pack(globList, packOptions)
// .then(pkgName => {
//   logger.info(`Finished packaging '${pkgName}'`)
//   return pkgName
// })
// .catch(err => {
//   logger.error('Failed to package app', err)

//   /* eslint-disable no-process-exit */
//   process.exit(1)
//   /* eslint-enable no-process-exit */
// })

/* eslint-enable node/shebang */
