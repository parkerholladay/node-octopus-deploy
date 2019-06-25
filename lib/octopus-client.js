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

const getAction = method => {
  switch (method) {
    case methods.get:
      return request.get
    case methods.post:
      return request.post
    case methods.delete:
      return request.delete
  }
}

const executeRequest = async (method, options, logKeys) => {
  const action = getAction(method)

  try {
    const data = await action(options)
    const camelizedData = JSONCasing.toCamel(data)

    return Maybe.some(camelizedData)
  } catch (err) {
    logger.error(`Failed to execute ${method} at '${options.url}'. Error: ${err.message}`)
    if (err.options) {
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

const getOptions = (overrides = {}) => {
  const { host, apiKey } = getApiConfig()

  return {
    baseUrl: `${host}/api`,
    json: true,
    ...overrides,
    headers: {
      'X-Octopus-ApiKey': apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...overrides.headers
    }
  }
}

const get = async url => {
  const logKeys = ['baseUrl', 'url', 'method', 'headers']

  return executeRequest(methods.get, getOptions({ url }), logKeys)
}

const post = async (url, data) => {
  const logKeys = ['baseUrl', 'url', 'method', 'headers', 'body: data']

  return executeRequest(methods.post, getOptions({ url, body: data }), logKeys)
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
    formData,
    headers: { 'Content-Type': 'mutlipart/form-data' }
  })

  const logKeys = ['baseUrl', 'url', 'method', 'headers', 'formData']

  return executeRequest(methods.post, options, logKeys)
}

const httpDelete = async url => {
  const logKeys = ['baseUrl', 'url', 'method', 'headers']

  return executeRequest(methods.delete, getOptions({ url }), logKeys)
}

module.exports = {
  delete: httpDelete,
  get,
  post,
  postFile
}
