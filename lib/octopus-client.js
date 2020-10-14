'use strict'

const { JSONCasing } = require('json-casing')
const request = require('request-promise-native')

const { getApiConfig, logger, Maybe } = require('./utils')

const methods = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE'
}

const actions = {
  [methods.get]: options => request.get(options),
  [methods.post]: options => request.post(options),
  [methods.delete]: options => request.delete(options)
}

const defaultLogKeys = ['baseUrl', 'url', 'method', 'headers']

const executeRequest = async (options, additionalLogKeys = []) => {
  const { url, method } = options

  try {
    const data = await actions[method](options)
    const camelizedData = JSONCasing.toCamel(data)

    return Maybe.some(camelizedData)
  } catch (err) {
    logger.error(`Failed to execute ${method} at '${url}'. Error: ${err.message}`)
    if (err.options) {
      const logKeys = defaultLogKeys.concat(additionalLogKeys)

      const logInfo = logKeys.reduce((logInfo, key) => {
        const [optionsKey, logKey] = key.split(': ')
        return {
          [logKey || optionsKey]: err.options[optionsKey],
          ...logInfo
        }
      }, {})

      logger.info(logInfo)
    }

    return Maybe.none()
  }
}

const getOptions = overrides => {
  const { host, apiKey } = getApiConfig()

  return {
    baseUrl: `${host}/api`,
    json: true,
    ...overrides,
    headers: {
      'X-Octopus-ApiKey': apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...overrides.headers
    }
  }
}

const get = async url => {
  return executeRequest(getOptions({ url, method: methods.get }))
}

const post = async (url, data) => {
  return executeRequest(getOptions({ url, method: methods.post, body: data }), ['body: data'])
}

const postFile = async (url, name, contents) => {
  const formData = {
    file: {
      value: contents,
      options: {
        filename: name,
        contentType: 'application/octet-stream'
      }
    }
  }
  const options = getOptions({
    url,
    method: methods.post,
    formData,
    headers: { 'Content-Type': 'mutlipart/form-data' }
  })

  return executeRequest(options, ['formData'])
}

const httpDelete = async url => {
  return executeRequest(getOptions({ url, method: methods.delete }))
}

module.exports = {
  delete: httpDelete,
  get,
  post,
  postFile
}
