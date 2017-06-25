'use strict'

const createRelease = require('./release')

function create(overrides) {
  overrides = overrides || {}
  const { items } = overrides
  delete overrides.items

  return Object.assign({},
    {
      isStale: false,
      items: items && items.length
        ? items.map(createRelease)
        : [createRelease()],
      itemsPerPage: 30,
      itemType: 'Release',
      totalResults: 1
    },
    overrides
  )
}

module.exports = create
