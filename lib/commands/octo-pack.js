'use strict'

const archiver = require('archiver')
const path = require('path')

const api = require('../api')
const { logger, Maybe } = require('../utils')
const utils = require('../utils')

let archive
const contents = []
let fileCount

const handleGlobData = file => {
  fileCount++

  const base = path.join(file.cwd, file.base)
  const name = file.path.replace(base, '')
  archive.file(file.path, { name })
}

const handleGlobEnd = () => {
  if (fileCount === 0) {
    archive.emit('error', new Error('No files were found to add to package'))
    return
  }

  logger.info(`Packing ${fileCount} files...`)
  archive.finalize()
}

const readGlobs = (globs, options) => {
  const globOptions = { nodir: true }
  if (options.base) {
    globOptions.base = options.base
  }

  const globStream = utils.getGlobStream(globs, globOptions)

  globStream.on('data', handleGlobData)
  globStream.on('end', handleGlobEnd)

  globStream.read()
}

const octopack = (globs, options = {}) => {
  fileCount = 0

  let archiveType = 'tar'
  let archiveOptions = { gzip: true }
  if (options.zip) {
    archiveType = 'zip'
    archiveOptions = { zlib: { level: 9 } }
  }

  archive = archiver.create(archiveType, archiveOptions)

  archive.on('data', chunk => contents.push(chunk))
  archive.on('warning', err => logger.error('Warning building archive', err))

  readGlobs(globs, options)

  return new Promise(resolve => {
    archive.on('error', err => {
      logger.error(`Failed to create package. Error:`, err)
      resolve(Maybe.none())
    })
    archive.on('end', () => resolve(Maybe.some(Buffer.concat(contents))))
  })
}

const getFileSizeString = bytes => {
  const units = ['B', 'kB', 'MB', 'GB', 'TB']
  const kilobyte = 1024
  let unitIndex = 0

  while (bytes >= kilobyte && unitIndex < units.length) {
    bytes /= kilobyte
    unitIndex++
  }

  return `${unitIndex === 0 ? bytes : bytes.toFixed(2)} ${units[unitIndex]}`
}

const publish = async params => {
  const { name, version, extension, replace, contents } = params
  const fileName = `${name}.${version}.${extension}`
  logger.info(`Publishing package ${fileName}...`)

  const newPackage = await api.packages.create(fileName, contents, replace)
  if (!newPackage.hasValue) {
    logger.error(`Failed to publish package ${fileName}`)
    return Maybe.none()
  }

  const { title, version: actualVersion, fileExtension, packageSizeBytes } = newPackage.value
  const size = getFileSizeString(packageSizeBytes)

  return Maybe.some({ title, version: actualVersion, extension: fileExtension, size })
}

module.exports = {
  octopack,
  publish
}
