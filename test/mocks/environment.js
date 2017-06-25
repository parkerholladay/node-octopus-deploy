'use strict'

function create(overrides) {
  return Object.assign({},
    {
      id: 'Environments-123',
      description: 'DEV server 1 environment',
      lastModifiedBy: 'email@acme.com',
      lastModifiedOn: '2017-01-01T00:00:00+0000',
      links: {},
      name: 'DEV-SERVER',
      sortOrder: 3,
      useGuidedFailure: false
    },
    overrides
  )
}

module.exports = create
