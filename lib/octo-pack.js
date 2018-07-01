'use strict'

const archiver = require('archiver')

const globWrapper = require('./utils/glob-wrapper')
const logger = require('./utils/logger')

let archive
let fileCount

const handleGlobData = ({ path, base }) => {
  fileCount++

  const name = path.replace(base + '/', '')
  archive.file(path, { name })
}

const handleGlobEnd = () => {
  if (fileCount === 0) {
    archive.emit('error', new Error('No files were found to add to package'))
    return
  }

  logger.info(`Packing ${fileCount} files...`)
  archive.finalize()
}

const octopack = (globs, options) => {
  fileCount = 0
  options = options || {}

  let archiveType = 'tar'
  let archiveOptions = { gzip: true }
  if (options.zip) {
    archiveType = 'zip'
    archiveOptions = { zlib: { level: 9 } }
  }

  archive = archiver.create(archiveType, archiveOptions)

  archive.on('warning', err => { logger.error(err) })
  archive.on('error', err => { throw err })

  const globOptions = { nodir: true }
  const globStream = globWrapper.getGlobStream(globs, globOptions)

  globStream.on('data', handleGlobData)
  globStream.on('end', handleGlobEnd)

  globStream.read()

  return archive
}

module.exports = octopack
