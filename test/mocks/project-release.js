'use strict'

const { generateRelease } = require('./release')

const generateProjectRelease = (overrides = {}) => {
  const { items } = overrides

  return {
    isStale: false,
    itemsPerPage: 30,
    itemType: 'Release',
    totalResults: (items && items.length) || 1,
    ...overrides,
    items: items && items.length
      ? items.map(generateRelease)
      : [generateRelease()]
  }
}

module.exports = { generateProjectRelease }
