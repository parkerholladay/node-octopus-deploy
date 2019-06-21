'use strict'

const { generateRelease } = require('./release')

function generateProjectRelease(overrides) {
  overrides = overrides || {}
  const { items } = overrides
  delete overrides.items

  return Object.assign({},
    {
      isStale: false,
      items: items && items.length
        ? items.map(generateRelease)
        : [generateRelease()],
      itemsPerPage: 30,
      itemType: 'Release',
      totalResults: 1
    },
    overrides
  )
}

module.exports = { generateProjectRelease }
